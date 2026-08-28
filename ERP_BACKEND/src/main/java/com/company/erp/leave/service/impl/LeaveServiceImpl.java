package com.company.erp.leave.service.impl;

import com.company.erp.audit.entity.AuditLog;
import com.company.erp.audit.repository.AuditLogRepository;
import com.company.erp.common.exception.BusinessLogicException;
import com.company.erp.common.exception.ResourceNotFoundException;
import com.company.erp.common.enums.LeaveStatus;
import com.company.erp.common.enums.LeaveType;
import com.company.erp.common.enums.UserRole;
import com.company.erp.employee.dto.EmployeeDTO;
import com.company.erp.employee.entity.Employee;
import com.company.erp.employee.repository.EmployeeRepository;
import com.company.erp.holiday.repository.HolidayRepository;
import com.company.erp.leave.dto.LeaveRequestDTO;
import com.company.erp.leave.entity.LeaveRequest;
import com.company.erp.leave.repository.LeaveRequestRepository;
import com.company.erp.leave.service.LeaveService;
import com.company.erp.notification.service.AppNotificationService;
import com.company.erp.notification.entity.NotificationType;
import com.company.erp.security.entity.User;
import com.company.erp.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class LeaveServiceImpl implements LeaveService {
    
    private final LeaveRequestRepository leaveRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final HolidayRepository holidayRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final AppNotificationService appNotificationService;
    
    @Override
    public LeaveRequestDTO createLeaveRequest(LeaveRequestDTO leaveRequestDTO) {
        log.info("Creating leave request for employee ID: {}", leaveRequestDTO.getEmployeeId());
        
        Employee employee = employeeRepository.findById(leaveRequestDTO.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        
        // Validate dates
        if (leaveRequestDTO.getStartDate().isAfter(leaveRequestDTO.getEndDate())) {
            throw new BusinessLogicException("Start date must be before end date");
        }
        
        // Check for overlapping leave
        if (hasOverlappingLeave(employee.getId(), leaveRequestDTO.getStartDate(), leaveRequestDTO.getEndDate())) {
            throw new BusinessLogicException("Employee already has overlapping leave request");
        }
        
        long totalDays = calculateLeaveDays(leaveRequestDTO.getStartDate(), leaveRequestDTO.getEndDate());
        
        // Validate leave balance - check available balance (including reserved days)
        int availableBalance = getAvailableBalance(employee, leaveRequestDTO.getLeaveType());
        if (totalDays > availableBalance) {
            throw new BusinessLogicException(
                    String.format("Insufficient leave balance. Requested: %d days, Available: %d days", totalDays, availableBalance)
            );
        }
        
        LeaveRequest leaveRequest = LeaveRequest.builder()
                .employee(employee)
                .startDate(leaveRequestDTO.getStartDate())
                .endDate(leaveRequestDTO.getEndDate())
                .totalDays((int) totalDays)
                .type(leaveRequestDTO.getLeaveType())
                .status(LeaveStatus.PENDING)
                .build();
        
        leaveRequest = leaveRequestRepository.save(leaveRequest);
        
        log.info("Leave request saved with ID: {}, creating notifications", leaveRequest.getId());
        
        // Create notification for HR role
        try {
            appNotificationService.createNotification(
                    "New Leave Request",
                    String.format("Employee %s %s has requested %d days of %s leave from %s to %s",
                            employee.getFirstName(),
                            employee.getLastName(),
                            totalDays,
                            leaveRequestDTO.getLeaveType(),
                            leaveRequestDTO.getStartDate(),
                            leaveRequestDTO.getEndDate()),
                    UserRole.HR,
                    NotificationType.LEAVE_REQUEST,
                    leaveRequest.getId()
            );
            log.info("Notification created for HR role");
        } catch (Exception e) {
            log.error("Error creating HR notification", e);
        }
        
        // Create notification for Manager role if employee belongs to a department
        if (employee.getDepartment() != null) {
            try {
                appNotificationService.createNotification(
                        "New Leave Request",
                        String.format("Employee %s %s has requested %d days of %s leave from %s to %s",
                                employee.getFirstName(),
                                employee.getLastName(),
                                totalDays,
                                leaveRequestDTO.getLeaveType(),
                                leaveRequestDTO.getStartDate(),
                                leaveRequestDTO.getEndDate()),
                        UserRole.MANAGER,
                        NotificationType.LEAVE_REQUEST,
                        leaveRequest.getId()
                );
                log.info("Notification created for MANAGER role");
            } catch (Exception e) {
                log.error("Error creating MANAGER notification", e);
            }
        }
        
        auditLogRepository.save(AuditLog.builder()
                .action("LEAVE_REQUEST_CREATED")
                .entityName("LeaveRequest")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Leave request created for " + totalDays + " days")
                .build());
        
        log.info("Leave request created with ID: {}", leaveRequest.getId());
        return mapToDTO(leaveRequest);
    }
    
    @Override
    public LeaveRequestDTO updateLeaveRequest(Long id, LeaveRequestDTO leaveRequestDTO) {
        log.info("Updating leave request with ID: {}", id);
        
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));
        
        // Can only update if status is PENDING
        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new BusinessLogicException("Cannot update leave request that is not in PENDING status");
        }
        
        if (leaveRequestDTO.getStartDate().isAfter(leaveRequestDTO.getEndDate())) {
            throw new BusinessLogicException("Start date must be before end date");
        }
        
        leaveRequest.setStartDate(leaveRequestDTO.getStartDate());
        leaveRequest.setEndDate(leaveRequestDTO.getEndDate());
        leaveRequest.setType(leaveRequestDTO.getLeaveType());
        leaveRequest.setTotalDays((int) calculateLeaveDays(leaveRequestDTO.getStartDate(), leaveRequestDTO.getEndDate()));
        
        leaveRequest = leaveRequestRepository.save(leaveRequest);
        
        auditLogRepository.save(AuditLog.builder()
                .action("LEAVE_REQUEST_UPDATED")
                .entityName("LeaveRequest")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Leave request updated")
                .build());
        
        return mapToDTO(leaveRequest);
    }
    
    @Override
    public LeaveRequestDTO approveLeave(Long id, String managerComment) {
        log.info("Approving leave request with ID: {}", id);
        
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));
        
        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new BusinessLogicException("Only PENDING leave requests can be approved");
        }
        
        // Validate available balance (including other APPROVED leaves)
        Employee employee = leaveRequest.getEmployee();
        int availableBalance = getAvailableBalance(employee, leaveRequest.getType());
        if (leaveRequest.getTotalDays() > availableBalance) {
            throw new BusinessLogicException(
                    String.format("Cannot approve: Insufficient balance. Requested: %d days, Available: %d days", 
                            leaveRequest.getTotalDays(), availableBalance)
            );
        }
        
        leaveRequest.setStatus(LeaveStatus.APPROVED);
        leaveRequest.setManagerComment(managerComment);
        leaveRequest = leaveRequestRepository.save(leaveRequest);
        
        log.info("Leave request approved - days are now RESERVED for employee {}", employee.getId());
        
        // Create notification for employee
        appNotificationService.createNotification(
                "Leave Request Approved",
                String.format("Your leave request from %s to %s (%d days) has been approved. Days are now reserved.",
                        leaveRequest.getStartDate(),
                        leaveRequest.getEndDate(),
                        leaveRequest.getTotalDays()),
                UserRole.EMPLOYEE,
                NotificationType.LEAVE_APPROVED,
                leaveRequest.getId()
        );
        
        auditLogRepository.save(AuditLog.builder()
                .action("LEAVE_REQUEST_APPROVED")
                .entityName("LeaveRequest")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details(String.format("Leave request approved - %d days reserved", leaveRequest.getTotalDays()))
                .build());
        
        log.info("Leave request approved");
        return mapToDTO(leaveRequest);
    }
    
    @Override
    public LeaveRequestDTO rejectLeave(Long id, String managerComment) {
        log.info("Rejecting leave request with ID: {}", id);
        
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));
        
        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new BusinessLogicException("Only PENDING leave requests can be rejected");
        }
        
        leaveRequest.setStatus(LeaveStatus.REJECTED);
        leaveRequest.setManagerComment(managerComment);
        
        leaveRequest = leaveRequestRepository.save(leaveRequest);
        
        // Create notification for employee
        appNotificationService.createNotification(
                "Leave Request Rejected",
                String.format("Your leave request from %s to %s has been rejected. Reason: %s",
                        leaveRequest.getStartDate(),
                        leaveRequest.getEndDate(),
                        managerComment != null ? managerComment : "No reason provided"),
                UserRole.EMPLOYEE,
                NotificationType.LEAVE_REJECTED,
                leaveRequest.getId()
        );
        
        auditLogRepository.save(AuditLog.builder()
                .action("LEAVE_REQUEST_REJECTED")
                .entityName("LeaveRequest")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Leave request rejected by manager")
                .build());
        
        log.info("Leave request rejected");
        return mapToDTO(leaveRequest);
    }
    
    @Override
    public void cancelLeave(Long id) {
        log.info("Cancelling leave request with ID: {}", id);
        
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));
        
        // If leave was approved, unreserve the days back to employee
        if (leaveRequest.getStatus() == LeaveStatus.APPROVED) {
            Employee employee = leaveRequest.getEmployee();
            log.info("Unreserving {} days for employee {}", leaveRequest.getTotalDays(), employee.getId());
            
            switch (leaveRequest.getType()) {
                case ANNUAL:
                    employee.setAnnualLeaveBalance(employee.getAnnualLeaveBalance() + leaveRequest.getTotalDays());
                    break;
                case SICK:
                    employee.setSickLeaveBalance(employee.getSickLeaveBalance() + leaveRequest.getTotalDays());
                    break;
                case CASUAL:
                    employee.setCasualLeaveBalance(employee.getCasualLeaveBalance() + leaveRequest.getTotalDays());
                    break;
                case MATERNITY:
                    employee.setMaternityLeaveBalance(employee.getMaternityLeaveBalance() + leaveRequest.getTotalDays());
                    break;
                case PATERNITY:
                    employee.setPaternityLeaveBalance(employee.getPaternityLeaveBalance() + leaveRequest.getTotalDays());
                    break;
                case UNPAID:
                    // No balance tracking for unpaid leave
                    break;
            }
            employeeRepository.save(employee);
        }
        
        leaveRequest.setStatus(LeaveStatus.CANCELLED);
        leaveRequestRepository.save(leaveRequest);
        
        auditLogRepository.save(AuditLog.builder()
                .action("LEAVE_REQUEST_CANCELLED")
                .entityName("LeaveRequest")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Leave request cancelled")
                .build());
        
        log.info("Leave request cancelled");
    }
    
    @Override
    @Transactional(readOnly = true)
    public LeaveRequestDTO getLeaveById(Long id) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));
        return mapToDTO(leaveRequest);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<LeaveRequestDTO> getAllLeaves() {
        log.info("Fetching leaves with role-based filtering");
        
        String currentUsername = getCurrentUsername();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));
        
        UserRole userRole = currentUser.getRole();
        log.info("Current user role: {}", userRole);
        
        List<LeaveRequest> allLeaves = leaveRequestRepository.findAll();
        log.info("Total leaves in database: {}", allLeaves.size());
        
        // HR, Admin, and Accountant can see all leaves
        if (userRole == UserRole.HR || userRole == UserRole.ADMIN || userRole == UserRole.ACCOUNTANT) {
            log.info("User has role {}, returning all leaves", userRole);
            return allLeaves.stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        }
        
        // Manager sees only leaves from employees in their department
        if (userRole == UserRole.MANAGER) {
            Employee currentEmployee = employeeRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee record not found for current user"));
            
            Long departmentId = currentEmployee.getDepartment().getId();
            log.info("Manager department ID: {}, fetching leaves for department members", departmentId);
            
            List<Employee> departmentMembers = employeeRepository.findByDepartmentId(departmentId);
            log.info("Department members count: {}", departmentMembers.size());
            
            List<Long> departmentMemberIds = departmentMembers.stream()
                    .map(Employee::getId)
                    .collect(Collectors.toList());
            
            log.info("Department member IDs: {}", departmentMemberIds);
            
            List<LeaveRequestDTO> filteredLeaves = allLeaves.stream()
                    .peek(leave -> log.debug("Processing leave ID: {}, Employee ID: {}", leave.getId(), leave.getEmployee().getId()))
                    .filter(leave -> departmentMemberIds.contains(leave.getEmployee().getId()))
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
            
            log.info("Filtered leaves count: {}", filteredLeaves.size());
            return filteredLeaves;
        }
        
        // Employee sees only their own leaves
        if (userRole == UserRole.EMPLOYEE) {
            Employee currentEmployee = employeeRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee record not found for current user"));
            
            Long employeeId = currentEmployee.getId();
            log.info("Employee ID: {}, fetching own leaves", employeeId);
            
            return allLeaves.stream()
                    .filter(leave -> leave.getEmployee().getId().equals(employeeId))
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        }
        
        // Default: return empty list for unknown roles
        log.warn("Unknown role: {}, returning empty list", userRole);
        return List.of();
    }

    @Override
    public List<LeaveRequestDTO> getAllLeaves(String status) {
        log.info("Fetching all leaves with status filter: {}", status);
        List<LeaveRequestDTO> allLeaves = getAllLeaves();
        
        // Filter by status if provided
        if (status != null && !status.isEmpty()) {
            try {
                LeaveStatus leaveStatus = LeaveStatus.valueOf(status.toUpperCase());
                allLeaves = allLeaves.stream()
                        .filter(leave -> leave.getStatus() == leaveStatus)
                        .collect(Collectors.toList());
                log.info("Filtered leaves by status {}: {} leaves found", status, allLeaves.size());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid status value: {}", status);
            }
        }
        
        return allLeaves;
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<LeaveRequestDTO> getLeavesByEmployeeId(Long employeeId) {
        log.info("Fetching leaves for employee ID: {}", employeeId);
        return leaveRequestRepository.findByEmployeeId(employeeId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<LeaveRequestDTO> getLeavesByStatus(String status) {
        log.info("Fetching leaves with status: {}", status);
        return leaveRequestRepository.findAll().stream()
                .filter(l -> l.getStatus().name().equalsIgnoreCase(status))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<LeaveRequestDTO> getLeavesByDateRange(LocalDate startDate, LocalDate endDate) {
        log.info("Fetching leaves between {} and {}", startDate, endDate);
        return leaveRequestRepository.findAll().stream()
                .filter(l -> l.getStartDate().isBefore(endDate) && l.getEndDate().isAfter(startDate))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean hasOverlappingLeave(Long employeeId, LocalDate startDate, LocalDate endDate) {
        List<LeaveRequest> approvedLeaves = leaveRequestRepository.findByEmployeeId(employeeId).stream()
                .filter(l -> l.getStatus() == LeaveStatus.APPROVED)
                .toList();
        
        return approvedLeaves.stream()
                .anyMatch(l -> l.getStartDate().isBefore(endDate) && l.getEndDate().isAfter(startDate));
    }
    
    @Override
    @Transactional(readOnly = true)
    public long calculateLeaveDays(LocalDate startDate, LocalDate endDate) {
        long days = 0;
        LocalDate current = startDate;
        
        while (!current.isAfter(endDate)) {
            // Exclude weekends
            if (current.getDayOfWeek() != DayOfWeek.SATURDAY && current.getDayOfWeek() != DayOfWeek.SUNDAY) {
                // Exclude holidays
                if (!holidayRepository.existsByDate(current)) {
                    days++;
                }
            }
            current = current.plusDays(1);
        }
        
        return days;
    }
    
    /**
     * Calculates reserved (APPROVED) leave days for a specific leave type
     */
    private int getReservedDaysForLeaveType(Long employeeId, LeaveType leaveType) {
        return leaveRequestRepository.findByEmployeeId(employeeId).stream()
                .filter(l -> l.getStatus() == LeaveStatus.APPROVED && l.getType() == leaveType)
                .mapToInt(LeaveRequest::getTotalDays)
                .sum();
    }
    
    /**
     * Calculates available balance for a leave type
     * Available = Total Balance - Reserved (APPROVED) Days
     */
    private int getAvailableBalance(Employee employee, LeaveType leaveType) {
        int totalBalance = 0;
        int reservedDays = 0;
        
        switch (leaveType) {
            case ANNUAL:
                totalBalance = employee.getAnnualLeaveBalance();
                break;
            case SICK:
                totalBalance = employee.getSickLeaveBalance();
                break;
            case CASUAL:
                totalBalance = employee.getCasualLeaveBalance();
                break;
            case MATERNITY:
                totalBalance = employee.getMaternityLeaveBalance();
                break;
            case PATERNITY:
                totalBalance = employee.getPaternityLeaveBalance();
                break;
            case UNPAID:
                // Unpaid leave has unlimited balance
                return Integer.MAX_VALUE;
        }
        
        reservedDays = getReservedDaysForLeaveType(employee.getId(), leaveType);
        return Math.max(0, totalBalance - reservedDays);
    }
    
    private LeaveRequestDTO mapToDTO(LeaveRequest leaveRequest) {
        Employee emp = leaveRequest.getEmployee();
        return LeaveRequestDTO.builder()
                .id(leaveRequest.getId())
                .employeeId(emp.getId())
                .employee(EmployeeDTO.builder()
                        .id(emp.getId())
                        .firstName(emp.getFirstName())
                        .lastName(emp.getLastName())
                        .email(emp.getEmail())
                        .build())
                .employeeName(emp.getFirstName() + " " + emp.getLastName())
                .startDate(leaveRequest.getStartDate())
                .endDate(leaveRequest.getEndDate())
                .totalDays(leaveRequest.getTotalDays())
                .leaveType(leaveRequest.getType())
                .status(leaveRequest.getStatus())
                .managerComment(leaveRequest.getManagerComment())
                .createdAt(leaveRequest.getCreatedAt())
                .updatedAt(leaveRequest.getUpdatedAt())
                .build();
    }
    
    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "SYSTEM";
    }
}
