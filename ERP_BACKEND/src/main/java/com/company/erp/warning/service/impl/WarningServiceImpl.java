package com.company.erp.warning.service.impl;

import com.company.erp.audit.entity.AuditLog;
import com.company.erp.audit.repository.AuditLogRepository;
import com.company.erp.common.exception.BusinessLogicException;
import com.company.erp.common.exception.ResourceNotFoundException;
import com.company.erp.common.enums.UserRole;
import com.company.erp.common.enums.WarningStatus;
import com.company.erp.employee.entity.Employee;
import com.company.erp.employee.repository.EmployeeRepository;
import com.company.erp.security.entity.User;
import com.company.erp.security.repository.UserRepository;
import com.company.erp.warning.dto.WarningDTO;
import com.company.erp.warning.entity.Warning;
import com.company.erp.warning.repository.WarningRepository;
import com.company.erp.warning.service.WarningService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class WarningServiceImpl implements WarningService {
    
    private final WarningRepository warningRepository;
    private final EmployeeRepository employeeRepository;
    private final AuditLogRepository auditLogRepository;
        private final UserRepository userRepository;
    
    @Override
    public WarningDTO createWarning(WarningDTO warningDTO) {
        log.info("Creating warning for employee ID: {}", warningDTO.getEmployeeId());
        
        Employee employee = employeeRepository.findById(warningDTO.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

                // Enforce manager department scope: managers can only warn employees in their department
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                String username = authentication != null ? authentication.getName() : null;
                if (username == null) {
                        throw new BusinessLogicException("User is not authenticated");
                }

                User currentUser = userRepository.findByUsername(username)
                                .orElseThrow(() -> new BusinessLogicException("Current user not found"));

                if (currentUser.getRole() == UserRole.MANAGER) {
                        Employee manager = employeeRepository.findByUserId(currentUser.getId())
                                        .orElseThrow(() -> new BusinessLogicException("Manager profile not found"));

                        if (manager.getDepartment() == null || employee.getDepartment() == null ||
                                        !manager.getDepartment().getId().equals(employee.getDepartment().getId())) {
                                throw new BusinessLogicException("You do not have permission to warn this employee");
                        }
                }
        
        Warning warning = Warning.builder()
                .employee(employee)
                .reason(warningDTO.getReason())
                .comments(warningDTO.getComments())
                .severity(warningDTO.getSeverity())
                .dateIssued(LocalDateTime.now().toLocalDate())
                .status(WarningStatus.PENDING_HR_REVIEW)
                .build();
        
        warning = warningRepository.save(warning);
        
        auditLogRepository.save(AuditLog.builder()
                .action("WARNING_ISSUED")
                .entityName("Warning")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Warning issued for " + warningDTO.getReason())
                .build());
        
        return mapToDTO(warning);
    }
    
    @Override
    public WarningDTO updateWarning(Long id, WarningDTO warningDTO) {
        log.info("Updating warning with ID: {}", id);
        
        Warning warning = warningRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warning not found"));
        
        warning.setReason(warningDTO.getReason());
        warning.setSeverity(warningDTO.getSeverity());
        
        warning = warningRepository.save(warning);
        
        auditLogRepository.save(AuditLog.builder()
                .action("WARNING_UPDATED")
                .entityName("Warning")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Warning updated")
                .build());
        
        return mapToDTO(warning);
    }
    
    @Override
    public WarningDTO resolveWarning(Long id) {
        log.info("Resolving warning with ID: {}", id);
        
        Warning warning = warningRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warning not found"));
        
        warning.setStatus(WarningStatus.RESOLVED);
        warning = warningRepository.save(warning);
        
        auditLogRepository.save(AuditLog.builder()
                .action("WARNING_RESOLVED")
                .entityName("Warning")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Warning resolved")
                .build());
        
        return mapToDTO(warning);
    }
    
    @Override
    public void deleteWarning(Long id) {
        log.info("Deleting warning with ID: {}", id);
        
        Warning warning = warningRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warning not found"));
        
        warningRepository.delete(warning);
        
        auditLogRepository.save(AuditLog.builder()
                .action("WARNING_DELETED")
                .entityName("Warning")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Warning deleted")
                .build());
    }
    
    @Override
    @Transactional(readOnly = true)
    public WarningDTO getWarningById(Long id) {
        Warning warning = warningRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warning not found"));
        return mapToDTO(warning);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<WarningDTO> getWarningsByEmployeeId(Long employeeId) {
        log.info("Fetching warnings for employee ID: {}", employeeId);
        
        // Check if current user is an employee viewing their own warnings
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            String username = authentication.getName();
            User currentUser = userRepository.findByUsername(username).orElse(null);
            
            // If employee viewing their own warnings, only show MEDIUM and HIGH severity
            if (currentUser != null && currentUser.getRole() == UserRole.EMPLOYEE) {
                Employee emp = employeeRepository.findByUserId(currentUser.getId()).orElse(null);
                if (emp != null && emp.getId().equals(employeeId)) {
                    return warningRepository.findByEmployeeId(employeeId).stream()
                            .filter(w -> w.getSeverity().name().equals("MEDIUM") || w.getSeverity().name().equals("HIGH"))
                            .map(this::mapToDTO)
                            .collect(Collectors.toList());
                }
            }
        }
        
        // Otherwise return all warnings for the employee
        return warningRepository.findByEmployeeId(employeeId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<WarningDTO> getWarningsByStatus(String status) {
        log.info("Fetching warnings with status: {}", status);
        return warningRepository.findAll().stream()
                .filter(w -> w.getStatus().name().equalsIgnoreCase(status))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<WarningDTO> getWarningsBySeverity(String severity) {
        log.info("Fetching warnings with severity: {}", severity);
        return warningRepository.findAll().stream()
                .filter(w -> w.getSeverity().name().equalsIgnoreCase(severity))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<WarningDTO> getAllWarnings() {
        log.info("Fetching all warnings");

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return warningRepository.findAll().stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        }

        String username = authentication.getName();
        User currentUser = userRepository.findByUsername(username)
                .orElse(null);

        if (currentUser != null && currentUser.getRole() == UserRole.MANAGER) {
            Employee manager = employeeRepository.findByUserId(currentUser.getId())
                    .orElse(null);

            if (manager != null && manager.getDepartment() != null) {
                Long managerDeptId = manager.getDepartment().getId();
                return warningRepository.findAll().stream()
                        .filter(warning -> warning.getEmployee() != null
                                && warning.getEmployee().getDepartment() != null
                                && managerDeptId.equals(warning.getEmployee().getDepartment().getId()))
                        .map(this::mapToDTO)
                        .collect(Collectors.toList());
            }
        }

        return warningRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public WarningDTO escalateWarning(Long id) {
        log.info("Escalating warning with ID: {}", id);
        
        Warning warning = warningRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warning not found"));
        
        com.company.erp.common.enums.WarningSeverity currentSeverity = warning.getSeverity();
        com.company.erp.common.enums.WarningSeverity nextSeverity = currentSeverity;
        String escalationDetail;

        if (currentSeverity == com.company.erp.common.enums.WarningSeverity.LOW) {
            nextSeverity = com.company.erp.common.enums.WarningSeverity.MEDIUM;
            escalationDetail = "Escalated from LOW to MEDIUM";
        } else if (currentSeverity == com.company.erp.common.enums.WarningSeverity.MEDIUM) {
            nextSeverity = com.company.erp.common.enums.WarningSeverity.HIGH;
            escalationDetail = "Escalated from MEDIUM to HIGH";
        } else {
            escalationDetail = "Escalated HIGH warning to upper management";
        }

        warning.setSeverity(nextSeverity);
        warning.setStatus(WarningStatus.ESCALATED);
        warning.setHrComment(escalationDetail);
        warningRepository.save(warning);
        
        auditLogRepository.save(AuditLog.builder()
                .action("WARNING_ESCALATED")
                .entityName("Warning")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details(escalationDetail)
                .build());
        
        return mapToDTO(warning);
    }
    
    public WarningDTO scheduleReunion(Long id, LocalDateTime reunionScheduledAt) {
        log.info("Scheduling reunion for warning ID: {}", id);
        
        Warning warning = warningRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warning not found"));
        
        warning.setReunionScheduledAt(reunionScheduledAt);
        warning.setStatus(WarningStatus.REUNION_SCHEDULED);
        warning = warningRepository.save(warning);
        
        auditLogRepository.save(AuditLog.builder()
                .action("REUNION_SCHEDULED")
                .entityName("Warning")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Reunion scheduled for " + reunionScheduledAt)
                .build());
        
        return mapToDTO(warning);
    }
    
    public WarningDTO submitReunionReport(Long id, String reunionReport) {
        log.info("Submitting reunion report for warning ID: {}", id);
        
        Warning warning = warningRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warning not found"));
        
        warning.setReunionReport(reunionReport);
        warning.setStatus(WarningStatus.CLOSED);
        warning.setResolvedAt(LocalDateTime.now());
        warning = warningRepository.save(warning);
        
        auditLogRepository.save(AuditLog.builder()
                .action("REUNION_REPORT_SUBMITTED")
                .entityName("Warning")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Reunion report submitted")
                .build());
        
        return mapToDTO(warning);
    }
    
    private WarningDTO mapToDTO(Warning warning) {
        return WarningDTO.builder()
                .id(warning.getId())
                .employeeId(warning.getEmployee().getId())
                .employeeName(warning.getEmployee() != null
                        ? warning.getEmployee().getFirstName() + " " + warning.getEmployee().getLastName()
                        : null)
                .reason(warning.getReason())
                .comments(warning.getComments())
                .severity(warning.getSeverity())
                .dateIssued(warning.getDateIssued())
                .status(warning.getStatus())
                .hrComment(warning.getHrComment())
                .reunionScheduledAt(warning.getReunionScheduledAt())
                .reunionReport(warning.getReunionReport())
                .resolvedAt(warning.getResolvedAt())
                .createdAt(warning.getCreatedAt())
                .updatedAt(warning.getUpdatedAt())
                .build();
    }
    
    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "SYSTEM";
    }
}
