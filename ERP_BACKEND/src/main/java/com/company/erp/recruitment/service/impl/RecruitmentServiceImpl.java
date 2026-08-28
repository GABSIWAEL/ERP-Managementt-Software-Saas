package com.company.erp.recruitment.service.impl;

import com.company.erp.audit.entity.AuditLog;
import com.company.erp.audit.repository.AuditLogRepository;
import com.company.erp.common.enums.CandidateStatus;
import com.company.erp.common.enums.EmployeeStatus;
import com.company.erp.common.enums.EmploymentType;
import com.company.erp.common.enums.UserRole;
import com.company.erp.common.exception.BusinessLogicException;
import com.company.erp.common.exception.ResourceNotFoundException;
import com.company.erp.employee.entity.Employee;
import com.company.erp.employee.repository.EmployeeRepository;
import com.company.erp.notification.dto.EmailRequest;
import com.company.erp.notification.service.NotificationService;
import com.company.erp.recruitment.dto.CandidateDTO;
import com.company.erp.recruitment.entity.Candidate;
import com.company.erp.recruitment.entity.JobApplication;
import com.company.erp.recruitment.entity.JobOffer;
import com.company.erp.recruitment.repository.CandidateRepository;
import com.company.erp.recruitment.service.RecruitmentService;
import com.company.erp.security.entity.User;
import com.company.erp.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class RecruitmentServiceImpl implements RecruitmentService {
    
    private final CandidateRepository candidateRepository;
    private final EmployeeRepository employeeRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;
    
    @Override
    public CandidateDTO createCandidate(CandidateDTO candidateDTO) {
        log.info("Creating candidate: {}", candidateDTO.getCandidateName());
        
        // Check if email already exists
        if (candidateRepository.existsByEmail(candidateDTO.getEmail())) {
            throw new BusinessLogicException("Candidate with this email already exists");
        }
        
        Candidate candidate = Candidate.builder()
                .candidateName(candidateDTO.getCandidateName())
                .email(candidateDTO.getEmail())
                .position(candidateDTO.getPosition())
                .status(CandidateStatus.APPLIED)
                .notes(candidateDTO.getNotes())
                .build();
        
        candidate = candidateRepository.save(candidate);
        
        auditLogRepository.save(AuditLog.builder()
                .action("CANDIDATE_CREATED")
                .entityName("Candidate")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Candidate created: " + candidateDTO.getCandidateName())
                .build());
        
        return mapToDTO(candidate);
    }
    
    /**
     * Create a Candidate from an accepted JobApplication
     * Extracts candidate details from the job application and sets the jobOfferId
     */
    public CandidateDTO createCandidateFromJobApplication(JobApplication jobApplication) {
        log.info("Creating candidate from job application: {}", jobApplication.getApplicantName());
        
        // Check if candidate with this email already exists
        if (candidateRepository.existsByEmail(jobApplication.getEmail())) {
            log.warn("Candidate with email {} already exists, skipping creation", jobApplication.getEmail());
            throw new BusinessLogicException("Candidate with this email already exists");
        }
        
        // Extract jobOfferId from the JobOffer
        Long jobOfferId = jobApplication.getJobOffer().getId();
        String position = jobApplication.getJobOffer().getTitle();
        
        // Create candidate from job application
        Candidate candidate = Candidate.builder()
                .candidateName(jobApplication.getApplicantName())
                .email(jobApplication.getEmail())
                .position(position)
                .jobOfferId(jobOfferId)
                .status(CandidateStatus.APPLIED)
                .notes("Created from job application (Application ID: " + jobApplication.getId() + ")")
                .build();
        
        candidate = candidateRepository.save(candidate);
        
        auditLogRepository.save(AuditLog.builder()
                .action("CANDIDATE_CREATED_FROM_APPLICATION")
                .entityName("Candidate")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Candidate created from job application: " + jobApplication.getApplicantName() + 
                        " for job offer ID: " + jobOfferId)
                .build());
        
        return mapToDTO(candidate);
    }
    
    @Override
    public CandidateDTO updateCandidate(Long id, CandidateDTO candidateDTO) {
        log.info("Updating candidate with ID: {}", id);
        
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found"));
        
        candidate.setCandidateName(candidateDTO.getCandidateName());
        candidate.setPosition(candidateDTO.getPosition());
        candidate.setNotes(candidateDTO.getNotes());
        
        candidate = candidateRepository.save(candidate);
        
        auditLogRepository.save(AuditLog.builder()
                .action("CANDIDATE_UPDATED")
                .entityName("Candidate")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Candidate updated")
                .build());
        
        return mapToDTO(candidate);
    }
    
    @Override
    public CandidateDTO updateCandidateStatus(Long id, String status) {
        log.info("Updating candidate status with ID: {}", id);
        
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found"));
        
        CandidateStatus newStatus = CandidateStatus.valueOf(status.toUpperCase());
        candidate.setStatus(newStatus);
        candidate = candidateRepository.save(candidate);
        
        auditLogRepository.save(AuditLog.builder()
                .action("CANDIDATE_STATUS_UPDATED")
                .entityName("Candidate")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Candidate status updated to " + status)
                .build());
        
        // AUTO-CONVERSION: If status is ACCEPTED, create employee record
        if (newStatus == CandidateStatus.ACCEPTED) {
            convertCandidateToEmployee(candidate);
        }
        
        return mapToDTO(candidate);
    }

    /**
     * Auto-convert an accepted candidate to an Employee record with User account and send welcome email
     */
    private void convertCandidateToEmployee(Candidate candidate) {
        try {
            log.info("[ACCEPTANCE] Starting conversion for candidate: {} (ID: {})", candidate.getCandidateName(), candidate.getId());
            
            // Check if employee already exists with this email
            if (employeeRepository.existsByEmail(candidate.getEmail())) {
                log.warn("[ACCEPTANCE] Employee with email {} already exists, skipping conversion", candidate.getEmail());
                return;
            }
            
            log.info("[ACCEPTANCE] Creating new employee for candidate email: {}", candidate.getEmail());
            
            // Split candidate name into first and last name
            String[] nameParts = candidate.getCandidateName().trim().split("\\s+", 2);
            String firstName = nameParts[0];
            String lastName = nameParts.length > 1 ? nameParts[1] : "";
            
            // Create new employee record
            Employee newEmployee = Employee.builder()
                    .firstName(firstName)
                    .lastName(lastName)
                    .email(candidate.getEmail())
                    .hireDate(LocalDate.now())
                    .salary(BigDecimal.ZERO) // To be configured by HR
                    .employmentType(EmploymentType.FULL_TIME) // Default
                    .status(EmployeeStatus.ACTIVE)
                    .jobPosition(candidate.getPosition())
                    .build();
            
            // Generate temporary password
            String temporaryPassword = generateTemporaryPassword();
            log.info("[ACCEPTANCE] Generated temporary password for {}", candidate.getEmail());
            String encodedPassword = passwordEncoder.encode(temporaryPassword);
            
            // Create corresponding User account
            User newUser = User.builder()
                    .username(candidate.getEmail())
                    .password(encodedPassword)
                    .role(UserRole.EMPLOYEE)
                    .enabled(true)
                    .build();
            
            // Set audit fields after building
            newUser.setCreatedAt(LocalDateTime.now());
            newUser.setUpdatedAt(LocalDateTime.now());
            
            User savedUser = userRepository.save(newUser);
            log.info("[ACCEPTANCE] User account created with ID: {}", savedUser.getId());
            
            newEmployee.setUser(savedUser);
            
            Employee createdEmp = employeeRepository.save(newEmployee);
            log.info("[ACCEPTANCE] Employee created with ID: {}", createdEmp.getId());
            
            // Log the conversion
            auditLogRepository.save(AuditLog.builder()
                    .action("CANDIDATE_CONVERTED_TO_EMPLOYEE")
                    .entityName("Candidate")
                    .performedBy(getCurrentUsername())
                    .timestamp(LocalDateTime.now())
                    .details("Candidate " + candidate.getCandidateName() + 
                            " (ID: " + candidate.getId() + ") converted to Employee (ID: " + createdEmp.getId() + ")")
                    .build());
            
            log.info("[ACCEPTANCE] Successfully converted candidate {} to employee with ID: {}", 
                    candidate.getCandidateName(), createdEmp.getId());
            
            // Send welcome email with credentials
            try {
                log.info("[ACCEPTANCE] Sending acceptance email to: {}", createdEmp.getEmail());
                sendAcceptanceEmail(createdEmp, temporaryPassword, candidate);
                log.info("[ACCEPTANCE] Email sent successfully to: {}", createdEmp.getEmail());
            } catch (Exception e) {
                log.error("[ACCEPTANCE] FAILED to send acceptance email to {}: {} - {}", 
                        candidate.getEmail(), e.getClass().getName(), e.getMessage(), e);
            }
            
        } catch (Exception e) {
            log.error("[ACCEPTANCE] ERROR converting candidate {} to employee: {} - {}", 
                    candidate.getCandidateName(), e.getClass().getName(), e.getMessage(), e);
            // Don't throw exception to prevent status update from failing
        }
    }
    
    @Override
    public void deleteCandidate(Long id) {
        log.info("Deleting candidate with ID: {}", id);
        
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found"));
        
        candidateRepository.delete(candidate);
        
        auditLogRepository.save(AuditLog.builder()
                .action("CANDIDATE_DELETED")
                .entityName("Candidate")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Candidate deleted")
                .build());
    }
    
    @Override
    @Transactional(readOnly = true)
    public CandidateDTO getCandidateById(Long id) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found"));
        return mapToDTO(candidate);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<CandidateDTO> getAllCandidates() {
        log.info("Fetching all candidates");
        return candidateRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<CandidateDTO> getCandidatesByStatus(String status) {
        log.info("Fetching candidates with status: {}", status);
        return candidateRepository.findByStatus(CandidateStatus.valueOf(status.toUpperCase())).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<CandidateDTO> getCandidatesByPosition(String position) {
        log.info("Fetching candidates for position: {}", position);
        return candidateRepository.findAll().stream()
                .filter(c -> c.getPosition().equalsIgnoreCase(position))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<CandidateDTO> getCandidatesByJobOffer(Long jobOfferId) {
        log.info("Fetching candidates for job offer: {}", jobOfferId);
        return candidateRepository.findByJobOfferId(jobOfferId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    private CandidateDTO mapToDTO(Candidate candidate) {
        return CandidateDTO.builder()
                .id(candidate.getId())
                .candidateName(candidate.getCandidateName())
                .email(candidate.getEmail())
                .position(candidate.getPosition())
                .jobOfferId(candidate.getJobOfferId())
                .status(candidate.getStatus().name())
                .notes(candidate.getNotes())
                .createdAt(candidate.getCreatedAt())
                .updatedAt(candidate.getUpdatedAt())
                .build();
    }
    
    /**
     * Generate a temporary password for new employees
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
     * Send acceptance email with credentials to newly hired employee
     */
    private void sendAcceptanceEmail(Employee employee, String temporaryPassword, Candidate candidate) {
        log.info("[EMAIL] Starting sendAcceptanceEmail for: {}", employee.getEmail());
        
        String subject = "Welcome to ERP System - Your Account is Ready";
        
        String body = String.format(
                "Dear %s %s,\n\n" +
                "Congratulations! Your job application has been accepted and you are now an employee.\n\n" +
                "Position: %s\n" +
                "Start Date: %s\n\n" +
                "Your ERP System Account:\n" +
                "Username (Email): %s\n" +
                "Temporary Password: %s\n\n" +
                "Please log in and change your password immediately for security purposes.\n" +
                "Visit: https://your-erp-domain.com to access the system.\n\n" +
                "If you have any issues accessing your account, please contact the HR department.\n\n" +
                "Best regards,\n" +
                "HR Team",
                employee.getFirstName(),
                employee.getLastName(),
                candidate.getPosition(),
                employee.getHireDate(),
                employee.getEmail(),
                temporaryPassword
        );

        log.info("[EMAIL] Email body length: {} chars", body.length());

        EmailRequest emailRequest = EmailRequest.builder()
                .to(employee.getEmail())
                .subject(subject)
                .body(body)
                .isHtml(false)
                .build();

        log.info("[EMAIL] EmailRequest built - To: {}, Subject: {}", emailRequest.getTo(), emailRequest.getSubject());
        log.info("[EMAIL] NotificationService available: {}", notificationService != null);
        
        notificationService.sendEmail(emailRequest);
        
        log.info("[EMAIL] sendEmail() method called for: {}", employee.getEmail());
    }
    
    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "SYSTEM";
    }
}
