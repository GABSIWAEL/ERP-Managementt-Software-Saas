package com.company.erp.employee.service.impl;

import com.company.erp.asset.repository.AssetRepository;
import com.company.erp.common.enums.EmployeeStatus;
import com.company.erp.common.enums.UserRole;
import com.company.erp.common.exception.BusinessLogicException;
import com.company.erp.common.exception.ResourceNotFoundException;
import com.company.erp.department.entity.Department;
import com.company.erp.department.repository.DepartmentRepository;
import com.company.erp.employee.dto.EmployeeDTO;
import com.company.erp.employee.dto.UpdateEmployeeDTO;
import com.company.erp.employee.entity.Employee;
import com.company.erp.employee.repository.EmployeeRepository;
import com.company.erp.employee.service.EmployeeService;
import com.company.erp.notification.dto.EmailRequest;
import com.company.erp.notification.service.NotificationService;
import com.company.erp.payroll.repository.PayrollRepository;
import com.company.erp.security.entity.User;
import com.company.erp.security.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class EmployeeServiceImpl implements EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PayrollRepository payrollRepository;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private NotificationService notificationService;

    @Override
    public EmployeeDTO createEmployee(EmployeeDTO employeeDTO) {
        if (employeeRepository.existsByEmail(employeeDTO.getEmail())) {
            throw new BusinessLogicException("Employee with email '" + employeeDTO.getEmail() + "' already exists");
        }

        if (userRepository.existsByUsername(employeeDTO.getEmail())) {
            throw new BusinessLogicException("User account already exists for email: " + employeeDTO.getEmail());
        }

        // Get current user creating this employee
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new BusinessLogicException("Current user not found"));

        // Determine the role to assign to the new employee
        UserRole roleToAssign = determineUserRole(currentUser, employeeDTO);

        // Create Employee entity
        Employee employee = Employee.builder()
                .firstName(employeeDTO.getFirstName())
                .lastName(employeeDTO.getLastName())
                .email(employeeDTO.getEmail())
                .phone(employeeDTO.getPhone())
                .hireDate(employeeDTO.getHireDate())
                .salary(employeeDTO.getSalary())
                .employmentType(employeeDTO.getEmploymentType())
                .status(employeeDTO.getStatus())
                .jobPosition(employeeDTO.getJobPosition())
                // Set default leave balances
                .annualLeaveBalance(20)
                .sickLeaveBalance(8)
                .casualLeaveBalance(5)
                .maternityLeaveBalance(180)
                .paternityLeaveBalance(10)
                .build();

        if (employeeDTO.getDepartmentId() != null) {
            Department department = departmentRepository.findById(employeeDTO.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
            employee.setDepartment(department);
        }

        // Auto-create User account for the employee
        String temporaryPassword = generateTemporaryPassword();
        String encodedPassword = passwordEncoder.encode(temporaryPassword);
        
        User user = User.builder()
                .username(employeeDTO.getEmail())  // Use email as username
                .password(encodedPassword)
                .role(roleToAssign)
                .enabled(true)
                .build();

        // Set audit fields
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        employee.setUser(savedUser);

        Employee saved = employeeRepository.save(employee);
        log.info("Employee created with ID: {} and User account created with role {} for email: {}", 
                 saved.getId(), roleToAssign, employee.getEmail());

        // Send credentials email to employee
        try {
            sendCredentialsEmail(employee, temporaryPassword);
        } catch (Exception e) {
            log.warn("Failed to send credentials email to {}: {}", employee.getEmail(), e.getMessage());
            // Continue with employee creation even if email fails
        }

        return mapToDTO(saved);
    }

    /**
     * Determine the role to assign to a new employee based on who's creating them
     * - ADMIN can create HR and EMPLOYEE roles
     * - HR can only create EMPLOYEE and MANAGER roles
     * - Role can be explicitly specified in DTO or auto-determined from jobPosition
     */
    private UserRole determineUserRole(User creator, EmployeeDTO employeeDTO) {
        // If systemRole is explicitly specified in DTO
        if (employeeDTO.getSystemRole() != null && !employeeDTO.getSystemRole().isEmpty()) {
            try {
                UserRole requestedRole = UserRole.valueOf(employeeDTO.getSystemRole());
                
                // ADMIN can create any role
                if (creator.getRole() == UserRole.ADMIN) {
                    return requestedRole;
                }
                
                // HR can only create EMPLOYEE or MANAGER
                if (creator.getRole() == UserRole.HR) {
                    if (requestedRole == UserRole.EMPLOYEE || requestedRole == UserRole.MANAGER) {
                        return requestedRole;
                    }
                    throw new BusinessLogicException("HR can only create EMPLOYEE or MANAGER roles");
                }
                
                throw new BusinessLogicException("You don't have permission to create employees");
            } catch (IllegalArgumentException e) {
                throw new BusinessLogicException("Invalid role: " + employeeDTO.getSystemRole());
            }
        }
        
        // Auto-determine role based on jobPosition (if provided)
        if (employeeDTO.getJobPosition() != null && !employeeDTO.getJobPosition().isEmpty()) {
            String positionLower = employeeDTO.getJobPosition().toLowerCase();
            if (positionLower.contains("manager") || positionLower.contains("supervisor") || positionLower.contains("lead")) {
                return UserRole.MANAGER;
            }
        }
        
        // Default role is EMPLOYEE
        return UserRole.EMPLOYEE;
    }

    /**
     * Generate a temporary password for new employees
     * Format: 8 characters mix of uppercase, lowercase, digits
     */
    private String generateTemporaryPassword() {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        Random random = new Random();
        StringBuilder password = new StringBuilder();

        for (int i = 0; i < 10; i++) {
            password.append(characters.charAt(random.nextInt(characters.length())));
        }

        return password.toString();
    }

    /**
     * Send credentials email to newly created employee
     */
    private void sendCredentialsEmail(Employee employee, String temporaryPassword) {
        String subject = "Welcome to ERP System - Your Account is Ready";
        
        String body = String.format(
                "Dear %s %s,\n\n" +
                "Your employee account has been created in our ERP system.\n\n" +
                "Login Credentials:\n" +
                "Username (Email): %s\n" +
                "Temporary Password: %s\n\n" +
                "Please log in and change your password immediately for security purposes.\n\n" +
                "If you have any issues accessing your account, please contact the HR department.\n\n" +
                "Best regards,\n" +
                "ERP System Administrator",
                employee.getFirstName(),
                employee.getLastName(),
                employee.getEmail(),
                temporaryPassword
        );

        EmailRequest emailRequest = EmailRequest.builder()
                .to(employee.getEmail())
                .subject(subject)
                .body(body)
                .isHtml(false)
                .build();

        notificationService.sendEmail(emailRequest);
    }

    @Override
    public EmployeeDTO updateEmployee(Long id, EmployeeDTO employeeDTO) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + id));

        if (!employee.getEmail().equals(employeeDTO.getEmail()) &&
                employeeRepository.existsByEmail(employeeDTO.getEmail())) {
            throw new BusinessLogicException("Email already exists");
        }

        employee.setFirstName(employeeDTO.getFirstName());
        employee.setLastName(employeeDTO.getLastName());
        employee.setEmail(employeeDTO.getEmail());
        employee.setPhone(employeeDTO.getPhone());
        employee.setSalary(employeeDTO.getSalary());
        employee.setEmploymentType(employeeDTO.getEmploymentType());
        employee.setStatus(employeeDTO.getStatus());

        if (employeeDTO.getDepartmentId() != null) {
            Department department = departmentRepository.findById(employeeDTO.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
            employee.setDepartment(department);
        }

        Employee updated = employeeRepository.save(employee);
        log.info("Employee updated with ID: {}", updated.getId());

        return mapToDTO(updated);
    }

    @Override
    public EmployeeDTO updateEmployee(Long id, UpdateEmployeeDTO updateEmployeeDTO) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + id));

        if (updateEmployeeDTO.getEmail() != null && !employee.getEmail().equals(updateEmployeeDTO.getEmail()) &&
                employeeRepository.existsByEmail(updateEmployeeDTO.getEmail())) {
            throw new BusinessLogicException("Email already exists");
        }

        // Only update fields that are provided
        if (updateEmployeeDTO.getFirstName() != null) {
            employee.setFirstName(updateEmployeeDTO.getFirstName());
        }
        if (updateEmployeeDTO.getLastName() != null) {
            employee.setLastName(updateEmployeeDTO.getLastName());
        }
        if (updateEmployeeDTO.getEmail() != null) {
            employee.setEmail(updateEmployeeDTO.getEmail());
        }
        if (updateEmployeeDTO.getPhone() != null) {
            employee.setPhone(updateEmployeeDTO.getPhone());
        }
        if (updateEmployeeDTO.getSalary() != null) {
            employee.setSalary(updateEmployeeDTO.getSalary());
        }
        if (updateEmployeeDTO.getEmploymentType() != null) {
            employee.setEmploymentType(updateEmployeeDTO.getEmploymentType());
        }
        if (updateEmployeeDTO.getStatus() != null) {
            employee.setStatus(updateEmployeeDTO.getStatus());
        }
        if (updateEmployeeDTO.getJobPosition() != null) {
            employee.setJobPosition(updateEmployeeDTO.getJobPosition());
        }
        if (updateEmployeeDTO.getDateOfBirth() != null) {
            employee.setDateOfBirth(updateEmployeeDTO.getDateOfBirth());
        }

        if (updateEmployeeDTO.getDepartmentId() != null) {
            Department department = departmentRepository.findById(updateEmployeeDTO.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
            employee.setDepartment(department);
        }

        // Sync role change to User entity if systemRole is provided
        if (updateEmployeeDTO.getSystemRole() != null && !updateEmployeeDTO.getSystemRole().isEmpty()) {
            User user = employee.getUser();
            if (user != null) {
                try {
                    UserRole role = UserRole.valueOf(updateEmployeeDTO.getSystemRole());
                    user.setRole(role);
                    userRepository.save(user);
                    log.info("[ROLE_SYNC] Updated User role for employee {} to {}", employee.getId(), role);
                } catch (IllegalArgumentException e) {
                    log.warn("[ROLE_SYNC] Invalid role provided: {}", updateEmployeeDTO.getSystemRole());
                    throw new BusinessLogicException("Invalid role: " + updateEmployeeDTO.getSystemRole());
                }
            } else {
                log.warn("[ROLE_SYNC] Employee {} has no associated User account", employee.getId());
            }
        }

        Employee updated = employeeRepository.save(employee);
        log.info("Employee updated with ID: {} using UpdateEmployeeDTO", updated.getId());

        return mapToDTO(updated);
    }

    @Override
    public void terminateEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + id));

        // Check unreleased assets
        long unreleasedAssets = assetRepository.countByAssignedToIdAndStatusNot(id);
        if (unreleasedAssets > 0) {
            throw new BusinessLogicException("Cannot terminate. Employee has " + unreleasedAssets + " unreleased assets. Assets must be returned first.");
        }

        employee.setStatus(EmployeeStatus.TERMINATED);
        employeeRepository.save(employee);
        log.info("Employee terminated with ID: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeDTO getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + id));

        // Check row-level security: ensure user can only access their own data or is authorized
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
            // Check if user is accessing their own employee profile
            if (employee.getUser() != null && !employee.getUser().getId().equals(currentUser.getId())) {
                // User is accessing someone else's profile
                // Check if they have permission
                boolean hasPermission = false;
                
                // ADMIN and HR can access any employee
                if (currentUser.getRole() == UserRole.ADMIN || currentUser.getRole() == UserRole.HR) {
                    hasPermission = true;
                } else if (currentUser.getRole() == UserRole.MANAGER || currentUser.getRole() == UserRole.ACCOUNTANT) {
                    // MANAGER can access employees in their department
                    // ACCOUNTANT can access any employee (for payroll purposes)
                    Employee currentEmployee = employeeRepository.findByUserId(currentUser.getId())
                            .orElse(null);
                    
                    if (currentUser.getRole() == UserRole.ACCOUNTANT) {
                        hasPermission = true;
                    } else if (currentUser.getRole() == UserRole.MANAGER && currentEmployee != null) {
                        // Check if target employee is in same department or reports to this manager
                        if (employee.getDepartment() != null && currentEmployee.getDepartment() != null) {
                            hasPermission = employee.getDepartment().getId().equals(currentEmployee.getDepartment().getId()) ||
                                    employee.getDepartment().getManager() != null && 
                                    employee.getDepartment().getManager().getId().equals(currentEmployee.getId());
                        }
                    }
                }
                
                if (!hasPermission) {
                    log.warn("Unauthorized access attempt: User {} tried to access employee {}", username, id);
                    throw new BusinessLogicException("You don't have permission to access this employee's information");
                }
            }
        }

        return mapToDTO(employee);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeDTO> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeDTO> getEmployeesByDepartment(Long departmentId) {
        return employeeRepository.findByDepartmentId(departmentId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EmployeeDTO> getEmployeesPaginated(org.springframework.data.domain.Pageable pageable, Long departmentId) {
        org.springframework.data.domain.Page<Employee> employees;
        
        if (departmentId != null && departmentId > 0) {
            // If departmentId is provided, filter by department
            employees = employeeRepository.findByDepartmentId(departmentId, pageable);
        } else {
            // Otherwise, get all employees
            employees = employeeRepository.findAll(pageable);
        }
        
        return employees.map(this::mapToDTO);
    }

    @Override
    public EmployeeDTO transferDepartment(Long employeeId, Long newDepartmentId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        Department newDepartment = departmentRepository.findById(newDepartmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        employee.setDepartment(newDepartment);
        Employee updated = employeeRepository.save(employee);

        log.info("Employee {} transferred to department {}", employeeId, newDepartmentId);

        return mapToDTO(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeDTO getEmployeeProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Employee employee = employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for user"));
        
        log.info("Retrieved profile for employee: {}", employee.getEmail());
        return mapToDTO(employee);
    }

    private EmployeeDTO mapToDTO(Employee employee) {
        return EmployeeDTO.builder()
                .id(employee.getId())
                .firstName(employee.getFirstName())
                .lastName(employee.getLastName())
                .email(employee.getEmail())
                .phone(employee.getPhone())
                .hireDate(employee.getHireDate())
                .dateOfBirth(employee.getDateOfBirth())
                .salary(employee.getSalary())
                .employmentType(employee.getEmploymentType())
                .status(employee.getStatus())
                .jobPosition(employee.getJobPosition())
                .departmentId(employee.getDepartment() != null ? employee.getDepartment().getId() : null)
                .departmentName(employee.getDepartment() != null ? employee.getDepartment().getName() : null)
                .userId(employee.getUser() != null ? employee.getUser().getId() : null)
                .systemRole(employee.getUser() != null ? employee.getUser().getRole().name() : null)
                .annualLeaveBalance(employee.getAnnualLeaveBalance())
                .sickLeaveBalance(employee.getSickLeaveBalance())
                .casualLeaveBalance(employee.getCasualLeaveBalance())
                .maternityLeaveBalance(employee.getMaternityLeaveBalance())
                .paternityLeaveBalance(employee.getPaternityLeaveBalance())
                .build();
    }

}
