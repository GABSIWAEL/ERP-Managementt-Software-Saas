package com.company.erp.recruitment.controller;

import com.company.erp.common.dto.ApiResponse;
import com.company.erp.recruitment.dto.EmailAuditLogDTO;
import com.company.erp.recruitment.entity.EmailAuditLog;
import com.company.erp.recruitment.entity.JobApplication;
import com.company.erp.recruitment.repository.EmailAuditLogRepository;
import com.company.erp.recruitment.repository.JobApplicationRepository;
import com.company.erp.recruitment.service.RecruitmentEmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/recruitment/email-audit")
@CrossOrigin(origins = "*", maxAge = 3600)
public class EmailAuditLogController {

    @Autowired
    private EmailAuditLogRepository emailAuditLogRepository;
    
    @Autowired
    private JobApplicationRepository jobApplicationRepository;
    
    @Autowired
    private RecruitmentEmailService recruitmentEmailService;

    @GetMapping("/application/{applicationId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<EmailAuditLogDTO>>> getApplicationEmailHistory(
            @PathVariable Long applicationId) {
        log.info("Fetching email history for application: {}", applicationId);
        
        JobApplication application = jobApplicationRepository.findById(applicationId)
            .orElseThrow(() -> new RuntimeException("Application not found"));
        
        List<EmailAuditLogDTO> emailHistory = recruitmentEmailService.getEmailHistoryFor(application)
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok()
                .body(ApiResponse.success(emailHistory, "Email history retrieved successfully"));
    }

    @GetMapping("/candidate/{candidateEmail}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<List<EmailAuditLogDTO>>> getCandidateEmailHistory(
            @PathVariable String candidateEmail) {
        log.info("Fetching email history for candidate: {}", candidateEmail);
        
        List<EmailAuditLogDTO> emailHistory = recruitmentEmailService.getEmailHistoryForCandidate(candidateEmail)
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok()
                .body(ApiResponse.success(emailHistory, "Email history retrieved successfully"));
    }

    @PostMapping("/{auditLogId}/resend")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<String>> resendEmail(@PathVariable Long auditLogId) {
        log.info("Resending email with audit log ID: {}", auditLogId);
        
        try {
            recruitmentEmailService.resendEmail(auditLogId);
            return ResponseEntity.ok()
                    .body(ApiResponse.success(null, "Email resent successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to resend email: " + e.getMessage(), 400));
        }
    }

    @GetMapping("/{auditLogId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<EmailAuditLogDTO>> getEmailAuditLog(@PathVariable Long auditLogId) {
        log.info("Fetching email audit log: {}", auditLogId);
        
        EmailAuditLog auditLog = emailAuditLogRepository.findById(auditLogId)
            .orElseThrow(() -> new RuntimeException("Audit log not found"));
        
        return ResponseEntity.ok()
                .body(ApiResponse.success(mapToDTO(auditLog), "Audit log retrieved successfully"));
    }

    private EmailAuditLogDTO mapToDTO(EmailAuditLog auditLog) {
        return EmailAuditLogDTO.builder()
            .id(auditLog.getId())
            .jobApplicationId(auditLog.getJobApplication().getId())
            .recipientEmail(auditLog.getRecipientEmail())
            .subject(auditLog.getSubject())
            .body(auditLog.getBody())
            .stage(auditLog.getStage())
            .sentAt(auditLog.getSentAt())
            .status(auditLog.getStatus())
            .errorMessage(auditLog.getErrorMessage())
            .sentBy(auditLog.getSentBy())
            .candidateName(auditLog.getJobApplication().getApplicantName())
            .positionTitle(auditLog.getJobApplication().getJobOffer().getTitle())
            .build();
    }
}
