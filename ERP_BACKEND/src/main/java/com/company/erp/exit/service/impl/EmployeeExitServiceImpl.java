package com.company.erp.exit.service.impl;

import com.company.erp.audit.entity.AuditLog;
import com.company.erp.audit.repository.AuditLogRepository;
import com.company.erp.common.enums.EmployeeStatus;
import com.company.erp.common.enums.ResignationStatus;
import com.company.erp.common.exception.BusinessLogicException;
import com.company.erp.common.exception.ResourceNotFoundException;
import com.company.erp.employee.entity.Employee;
import com.company.erp.employee.repository.EmployeeRepository;
import com.company.erp.exit.dto.ExitChecklistDTO;
import com.company.erp.exit.dto.ResignationRequestDTO;
import com.company.erp.exit.entity.ExitChecklist;
import com.company.erp.exit.entity.ResignationRequest;
import com.company.erp.exit.repository.ExitChecklistRepository;
import com.company.erp.exit.repository.ResignationRequestRepository;
import com.company.erp.exit.service.EmployeeExitService;
import com.company.erp.security.entity.User;
import com.company.erp.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service implementation for employee exit/resignation workflows
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class EmployeeExitServiceImpl implements EmployeeExitService {
    
    private final ResignationRequestRepository resignationRepository;
    private final ExitChecklistRepository exitChecklistRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    
    @Override
    public ResignationRequestDTO submitResignation(Long employeeId, LocalDate lastWorkingDay, String reason) {
        log.info("Employee {} submitting resignation with last working day: {}", employeeId, lastWorkingDay);
        
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        
        // Check if employee already has an active resignation
        var existingResignation = resignationRepository.findByEmployeeIdAndStatus(employeeId, ResignationStatus.SUBMITTED);
        if (existingResignation.isPresent()) {
            throw new BusinessLogicException("Employee already has a pending resignation");
        }
        
        // Validate last working day is in the future
        if (lastWorkingDay.isBefore(LocalDate.now())) {
            throw new BusinessLogicException("Last working day must be in the future");
        }
        
        ResignationRequest resignation = ResignationRequest.builder()
                .employee(employee)
                .submissionDate(LocalDate.now())
                .lastWorkingDay(lastWorkingDay)
                .reason(reason)
                .status(ResignationStatus.SUBMITTED)
                .build();
        
        resignation = resignationRepository.save(resignation);
        
        auditLogRepository.save(AuditLog.builder()
                .action("RESIGNATION_SUBMITTED")
                .entityName("ResignationRequest")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Resignation submitted by employee " + employee.getFirstName() + 
                        " " + employee.getLastName() + " with last working day: " + lastWorkingDay)
                .build());
        
        return mapToDTO(resignation);
    }
    
    @Override
    public ResignationRequestDTO approveResignationByManager(Long resignationId, String managerComments) {
        log.info("Manager approving resignation ID: {}", resignationId);
        
        ResignationRequest resignation = resignationRepository.findById(resignationId)
                .orElseThrow(() -> new ResourceNotFoundException("Resignation not found"));
        
        if (resignation.getStatus() != ResignationStatus.SUBMITTED) {
            throw new BusinessLogicException("Only SUBMITTED resignations can be approved by manager");
        }
        
        resignation.setStatus(ResignationStatus.MANAGER_APPROVED);
        resignation.setManagerApprovalDate(LocalDateTime.now());
        resignation.setManagerComments(managerComments);
        
        resignation = resignationRepository.save(resignation);
        
        auditLogRepository.save(AuditLog.builder()
                .action("RESIGNATION_APPROVED_BY_MANAGER")
                .entityName("ResignationRequest")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Resignation ID " + resignationId + " approved by manager")
                .build());
        
        return mapToDTO(resignation);
    }
    
    @Override
    public ResignationRequestDTO approveResignationByHR(Long resignationId, String hrComments) {
        log.info("HR approving resignation ID: {}", resignationId);
        
        ResignationRequest resignation = resignationRepository.findById(resignationId)
                .orElseThrow(() -> new ResourceNotFoundException("Resignation not found"));
        
        if (resignation.getStatus() != ResignationStatus.MANAGER_APPROVED) {
            throw new BusinessLogicException("Resignation must be approved by manager first");
        }
        
        resignation.setStatus(ResignationStatus.HR_APPROVED);
        resignation.setHrApprovalDate(LocalDateTime.now());
        resignation.setHrComments(hrComments);
        
        resignation = resignationRepository.save(resignation);
        
        // Initialize exit checklist
        initializeExitChecklist(resignationId);
        
        auditLogRepository.save(AuditLog.builder()
                .action("RESIGNATION_APPROVED_BY_HR")
                .entityName("ResignationRequest")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Resignation ID " + resignationId + " approved by HR. Exit checklist initialized.")
                .build());
        
        return mapToDTO(resignation);
    }
    
    @Override
    public ResignationRequestDTO rejectResignation(Long resignationId, String rejectionReason) {
        log.info("Rejecting resignation ID: {}", resignationId);
        
        ResignationRequest resignation = resignationRepository.findById(resignationId)
                .orElseThrow(() -> new ResourceNotFoundException("Resignation not found"));
        
        if (resignation.getStatus() == ResignationStatus.REJECTED || 
            resignation.getStatus() == ResignationStatus.COMPLETED) {
            throw new BusinessLogicException("Cannot reject a " + resignation.getStatus() + " resignation");
        }
        
        resignation.setStatus(ResignationStatus.REJECTED);
        resignation.setManagerComments(rejectionReason);
        
        resignation = resignationRepository.save(resignation);
        
        auditLogRepository.save(AuditLog.builder()
                .action("RESIGNATION_REJECTED")
                .entityName("ResignationRequest")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Resignation ID " + resignationId + " rejected")
                .build());
        
        return mapToDTO(resignation);
    }
    
    @Override
    public ResignationRequestDTO cancelResignation(Long resignationId) {
        log.info("Cancelling resignation ID: {}", resignationId);
        
        ResignationRequest resignation = resignationRepository.findById(resignationId)
                .orElseThrow(() -> new ResourceNotFoundException("Resignation not found"));
        
        if (resignation.getStatus() == ResignationStatus.COMPLETED) {
            throw new BusinessLogicException("Cannot cancel a completed resignation");
        }
        
        resignation.setStatus(ResignationStatus.CANCELLED);
        resignation = resignationRepository.save(resignation);
        
        auditLogRepository.save(AuditLog.builder()
                .action("RESIGNATION_CANCELLED")
                .entityName("ResignationRequest")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Resignation ID " + resignationId + " cancelled")
                .build());
        
        return mapToDTO(resignation);
    }
    
    @Override
    @Transactional(readOnly = true)
    public ResignationRequestDTO getResignationById(Long resignationId) {
        ResignationRequest resignation = resignationRepository.findById(resignationId)
                .orElseThrow(() -> new ResourceNotFoundException("Resignation not found"));
        return mapToDTO(resignation);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ResignationRequestDTO> getResignationsByEmployeeId(Long employeeId) {
        return resignationRepository.findByEmployeeId(employeeId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ResignationRequestDTO> getResignationsByStatus(String status) {
        ResignationStatus resignationStatus = ResignationStatus.valueOf(status.toUpperCase());
        return resignationRepository.findByStatus(resignationStatus).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ResignationRequestDTO> getPendingResignations() {
        return resignationRepository.findByStatus(ResignationStatus.SUBMITTED).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ResignationRequestDTO> getAllResignations() {
        return resignationRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public ExitChecklistDTO initializeExitChecklist(Long resignationId) {
        log.info("Initializing exit checklist for resignation ID: {}", resignationId);
        
        ResignationRequest resignation = resignationRepository.findById(resignationId)
                .orElseThrow(() -> new ResourceNotFoundException("Resignation not found"));
        
        // Check if checklist already exists
        ExitChecklist existingChecklist = exitChecklistRepository.findByResignationId(resignationId);
        if (existingChecklist != null) {
            return mapExitChecklistToDTO(existingChecklist);
        }
        
        ExitChecklist checklist = ExitChecklist.builder()
                .resignation(resignation)
                .assetsReturned(false)
                .leaveSettled(false)
                .finalPayrollProcessed(false)
                .userAccountDeactivated(false)
                .dataArchived(false)
                .notes("Exit checklist initialized")
                .build();
        
        checklist = exitChecklistRepository.save(checklist);
        
        return mapExitChecklistToDTO(checklist);
    }
    
    @Override
    public ExitChecklistDTO markAssetsReturned(Long resignationId) {
        ExitChecklist checklist = getOrCreateExitChecklist(resignationId);
        checklist.setAssetsReturned(true);
        checklist = exitChecklistRepository.save(checklist);
        logChecklistUpdate("ASSETS_RETURNED", resignationId);
        return mapExitChecklistToDTO(checklist);
    }
    
    @Override
    public ExitChecklistDTO markLeaveSettled(Long resignationId) {
        ExitChecklist checklist = getOrCreateExitChecklist(resignationId);
        checklist.setLeaveSettled(true);
        checklist = exitChecklistRepository.save(checklist);
        logChecklistUpdate("LEAVE_SETTLED", resignationId);
        return mapExitChecklistToDTO(checklist);
    }
    
    @Override
    public ExitChecklistDTO markFinalPayrollProcessed(Long resignationId) {
        ExitChecklist checklist = getOrCreateExitChecklist(resignationId);
        checklist.setFinalPayrollProcessed(true);
        checklist = exitChecklistRepository.save(checklist);
        logChecklistUpdate("FINAL_PAYROLL_PROCESSED", resignationId);
        return mapExitChecklistToDTO(checklist);
    }
    
    @Override
    public ExitChecklistDTO markUserAccountDeactivated(Long resignationId) {
        ExitChecklist checklist = getOrCreateExitChecklist(resignationId);
        checklist.setUserAccountDeactivated(true);
        checklist = exitChecklistRepository.save(checklist);
        logChecklistUpdate("USER_ACCOUNT_DEACTIVATED", resignationId);
        return mapExitChecklistToDTO(checklist);
    }
    
    @Override
    public ExitChecklistDTO markDataArchived(Long resignationId) {
        ExitChecklist checklist = getOrCreateExitChecklist(resignationId);
        checklist.setDataArchived(true);
        checklist = exitChecklistRepository.save(checklist);
        logChecklistUpdate("DATA_ARCHIVED", resignationId);
        return mapExitChecklistToDTO(checklist);
    }
    
    @Override
    @Transactional(readOnly = true)
    public ExitChecklistDTO getExitChecklist(Long resignationId) {
        ExitChecklist checklist = exitChecklistRepository.findByResignationId(resignationId);
        if (checklist == null) {
            throw new ResourceNotFoundException("Exit checklist not found for resignation ID: " + resignationId);
        }
        return mapExitChecklistToDTO(checklist);
    }
    
    @Override
    public void completeExitProcess(Long resignationId) {
        log.info("Completing exit process for resignation ID: {}", resignationId);
        
        ResignationRequest resignation = resignationRepository.findById(resignationId)
                .orElseThrow(() -> new ResourceNotFoundException("Resignation not found"));
        
        ExitChecklist checklist = exitChecklistRepository.findByResignationId(resignationId);
        if (checklist == null || !checklist.isFullyCompleted()) {
            throw new BusinessLogicException("Exit checklist must be fully completed before finalizing exit process");
        }
        
        // Mark resignation as completed
        resignation.setStatus(ResignationStatus.COMPLETED);
        resignationRepository.save(resignation);
        
        // Update employee status to TERMINATED
        Employee employee = resignation.getEmployee();
        employee.setStatus(EmployeeStatus.TERMINATED);
        employeeRepository.save(employee);
        
        // Set completion date
        checklist.setCompletionDate(LocalDateTime.now());
        exitChecklistRepository.save(checklist);
        
        auditLogRepository.save(AuditLog.builder()
                .action("EXIT_PROCESS_COMPLETED")
                .entityName("ResignationRequest")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Exit process completed for employee " + employee.getFirstName() + 
                        " " + employee.getLastName() + ". Employee status set to TERMINATED.")
                .build());
    }
    
    // ===== Helper Methods =====
    
    private ExitChecklist getOrCreateExitChecklist(Long resignationId) {
        ExitChecklist checklist = exitChecklistRepository.findByResignationId(resignationId);
        if (checklist == null) {
            initializeExitChecklist(resignationId);
            checklist = exitChecklistRepository.findByResignationId(resignationId);
        }
        return checklist;
    }
    
    private void logChecklistUpdate(String action, Long resignationId) {
        auditLogRepository.save(AuditLog.builder()
                .action("EXIT_CHECKLIST_" + action)
                .entityName("ExitChecklist")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Resignation ID " + resignationId + " checklist updated")
                .build());
    }
    
    private ResignationRequestDTO mapToDTO(ResignationRequest resignation) {
        return ResignationRequestDTO.builder()
                .id(resignation.getId())
                .employeeId(resignation.getEmployee().getId())
                .employeeName(resignation.getEmployee().getFirstName() + " " + resignation.getEmployee().getLastName())
                .submissionDate(resignation.getSubmissionDate())
                .lastWorkingDay(resignation.getLastWorkingDay())
                .reason(resignation.getReason())
                .status(resignation.getStatus())
                .managerApprovalDate(resignation.getManagerApprovalDate())
                .hrApprovalDate(resignation.getHrApprovalDate())
                .managerComments(resignation.getManagerComments())
                .hrComments(resignation.getHrComments())
                .createdAt(resignation.getCreatedAt())
                .updatedAt(resignation.getUpdatedAt())
                .build();
    }
    
    private ExitChecklistDTO mapExitChecklistToDTO(ExitChecklist checklist) {
        return ExitChecklistDTO.builder()
                .id(checklist.getId())
                .resignationId(checklist.getResignation().getId())
                .assetsReturned(checklist.getAssetsReturned())
                .leaveSettled(checklist.getLeaveSettled())
                .finalPayrollProcessed(checklist.getFinalPayrollProcessed())
                .userAccountDeactivated(checklist.getUserAccountDeactivated())
                .dataArchived(checklist.getDataArchived())
                .completionDate(checklist.getCompletionDate())
                .notes(checklist.getNotes())
                .createdAt(checklist.getCreatedAt())
                .updatedAt(checklist.getUpdatedAt())
                .build();
    }
    
    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "SYSTEM";
    }
}
