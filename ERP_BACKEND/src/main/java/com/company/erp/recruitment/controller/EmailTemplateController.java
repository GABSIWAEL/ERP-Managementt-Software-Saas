package com.company.erp.recruitment.controller;

import com.company.erp.common.dto.ApiResponse;
import com.company.erp.recruitment.dto.EmailTemplateDTO;
import com.company.erp.recruitment.entity.EmailTemplate;
import com.company.erp.recruitment.entity.RecruitmentStage;
import com.company.erp.recruitment.service.RecruitmentEmailService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/recruitment/email-templates")
@CrossOrigin(origins = "*", maxAge = 3600)
public class EmailTemplateController {

    @Autowired
    private RecruitmentEmailService recruitmentEmailService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<EmailTemplateDTO>> createTemplate(
            @Valid @RequestBody EmailTemplateDTO templateDTO) {
        log.info("Creating email template for stage: {}", templateDTO.getStage());
        
        EmailTemplate template = recruitmentEmailService.createOrUpdateTemplate(
            templateDTO.getStage(),
            templateDTO.getSubject(),
            templateDTO.getBodyTemplate(),
            1L // Assuming company ID = 1 for now, should be from context
        );
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(mapToDTO(template), "Email template created successfully"));
    }

    @GetMapping("/stage/{stage}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<EmailTemplateDTO>> getTemplate(
            @PathVariable RecruitmentStage stage) {
        log.info("Fetching email template for stage: {}", stage);
        
        EmailTemplate template = recruitmentEmailService.getTemplateForStage(stage, 1L);
        
        if (template == null) {
            return ResponseEntity.ok()
                    .body(ApiResponse.success(null, "No template configured for this stage"));
        }
        
        return ResponseEntity.ok()
                .body(ApiResponse.success(mapToDTO(template), "Template retrieved successfully"));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<List<EmailTemplateDTO>>> getAllTemplates() {
        log.info("Fetching all email templates");
        
        List<EmailTemplateDTO> templates = recruitmentEmailService.getAllTemplatesForCompany(1L)
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok()
                .body(ApiResponse.success(templates, "Templates retrieved successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<EmailTemplateDTO>> updateTemplate(
            @PathVariable Long id,
            @Valid @RequestBody EmailTemplateDTO templateDTO) {
        log.info("Updating email template: {}", id);
        
        EmailTemplate template = recruitmentEmailService.createOrUpdateTemplate(
            templateDTO.getStage(),
            templateDTO.getSubject(),
            templateDTO.getBodyTemplate(),
            1L
        );
        
        return ResponseEntity.ok()
                .body(ApiResponse.success(mapToDTO(template), "Email template updated successfully"));
    }

    @GetMapping("/help/available-fields")
    public ResponseEntity<ApiResponse<String>> getAvailableFields() {
        String fields = "Available dynamic fields for email templates:\n" +
            "{candidateName} - Candidate's full name\n" +
            "{positionTitle} - Job position title\n" +
            "{scheduledDate} - Interview/test date (dd-MM-yyyy)\n" +
            "{scheduledTime} - Interview/test time (HH:mm)\n" +
            "{meetingLink} - Virtual meeting link\n" +
            "{companyName} - Company name\n" +
            "{recruitmentManager} - Recruitment manager name\n" +
            "{recruitmentManagerEmail} - Recruitment manager email\n" +
            "{recruitmentManagerPhone} - Recruitment manager phone\n" +
            "{jobDescription} - Job description\n" +
            "{salaryRange} - Salary range\n" +
            "{startDate} - Job start date";
        
        return ResponseEntity.ok()
                .body(ApiResponse.success(fields, "Available template fields"));
    }

    private EmailTemplateDTO mapToDTO(EmailTemplate template) {
        return EmailTemplateDTO.builder()
            .id(template.getId())
            .stage(template.getStage())
            .subject(template.getSubject())
            .bodyTemplate(template.getBodyTemplate())
            .isActive(template.getIsActive())
            .description(template.getDescription())
            .build();
    }
}
