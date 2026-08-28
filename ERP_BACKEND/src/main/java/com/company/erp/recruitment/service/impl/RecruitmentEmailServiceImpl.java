package com.company.erp.recruitment.service.impl;

import com.company.erp.common.exception.BusinessLogicException;
import com.company.erp.common.exception.ResourceNotFoundException;
import com.company.erp.notification.dto.EmailRequest;
import com.company.erp.notification.service.NotificationService;
import com.company.erp.recruitment.entity.*;
import com.company.erp.recruitment.repository.EmailAuditLogRepository;
import com.company.erp.recruitment.repository.EmailTemplateRepository;
import com.company.erp.recruitment.service.RecruitmentEmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class RecruitmentEmailServiceImpl implements RecruitmentEmailService {
    
    private final EmailTemplateRepository emailTemplateRepository;
    private final EmailAuditLogRepository emailAuditLogRepository;
    private final NotificationService notificationService;
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    
    @Override
    public void sendStatusChangeEmail(JobApplication application, JobApplicationStatus newStatus, String notes) {
        try {
            RecruitmentStage stage = mapStatusToStage(newStatus);
            EmailTemplate template = getTemplateForStage(stage, 1L);
            
            if (template == null) {
                log.warn("No email template found for stage: {}", stage);
                return;
            }
            
            EmailTemplateData data = buildTemplateData(application);
            String subject = template.fillSubject(data);
            String body = template.fillTemplate(data);
            
            sendEmail(application, subject, body, stage);
            
        } catch (Exception e) {
            log.error("Failed to send status change email for application {}: {}", 
                    application.getId(), e.getMessage(), e);
        }
    }
    
    @Override
    public void sendInterviewScheduleEmail(JobApplication application, InterviewSchedule schedule) {
        log.info("[INTERVIEW_SCHEDULE] Starting sendInterviewScheduleEmail for application ID: {} to: {}", 
                application.getId(), application.getEmail());
        
        try {
            RecruitmentStage stage = RecruitmentStage.INTERVIEW_SCHEDULED;
            EmailTemplate template = getTemplateForStage(stage, 1L);
            
            if (template == null) {
                log.warn("[INTERVIEW_SCHEDULE] No email template found for stage {}, using default", stage);
                sendDefaultInterviewScheduleEmail(application, schedule);
                return;
            }
            
            // Build and log template data for debugging
            EmailTemplateData data = buildTemplateDataWithSchedule(application, schedule);
            log.info("[INTERVIEW_SCHEDULE] Building email data - Date: {}, Time: {}, Manager: {}, Email: {}", 
                data.getScheduledDate(), data.getScheduledTime(), data.getRecruitmentManager(), data.getRecruitmentManagerEmail());
            
            String subject = template.fillSubject(data);
            String body = template.fillTemplate(data);
            
            log.debug("[INTERVIEW_SCHEDULE] Email body before sending: {}", body);
            log.info("[INTERVIEW_SCHEDULE] About to call sendEmail() for application {}", application.getId());
            
            sendEmail(application, subject, body, stage);
            
            log.info("[INTERVIEW_SCHEDULE] sendEmail() completed for application {}", application.getId());
            schedule.setReminderSent(true);
            
        } catch (Exception e) {
            log.error("[INTERVIEW_SCHEDULE] FAILED to send interview schedule email for application {}: {} - {}", 
                    application.getId(), e.getClass().getName(), e.getMessage(), e);
        }
    }
    
    @Override
    public void sendRejectionEmail(JobApplication application, String rejectionReason) {
        try {
            RecruitmentStage stage = determineRejectionStage(application);
            EmailTemplate template = getTemplateForStage(stage, 1L);
            
            if (template == null) {
                // Use default rejection template
                sendDefaultRejectionEmail(application, rejectionReason);
                return;
            }
            
            EmailTemplateData data = buildTemplateData(application);
            String subject = template.fillSubject(data);
            String body = template.fillTemplate(data);
            
            sendEmail(application, subject, body, stage);
            
        } catch (Exception e) {
            log.error("Failed to send rejection email for application {}: {}", 
                    application.getId(), e.getMessage(), e);
        }
    }
    
    @Override
    public void sendOfferEmail(JobApplication application) {
        try {
            RecruitmentStage stage = RecruitmentStage.OFFER_EXTENDED;
            EmailTemplate template = getTemplateForStage(stage, 1L);
            
            if (template == null) {
                sendDefaultOfferEmail(application);
                return;
            }
            
            EmailTemplateData data = buildTemplateData(application);
            data.setSalaryRange(application.getJobOffer().getSalaryMin() + " - " + 
                              application.getJobOffer().getSalaryMax());
            
            String subject = template.fillSubject(data);
            String body = template.fillTemplate(data);
            
            sendEmail(application, subject, body, stage);
            
        } catch (Exception e) {
            log.error("Failed to send offer email for application {}: {}", 
                    application.getId(), e.getMessage(), e);
        }
    }
    
    @Override
    public EmailTemplate createOrUpdateTemplate(RecruitmentStage stage, String subject, 
                                               String bodyTemplate, Long companyId) {
        EmailTemplate template = emailTemplateRepository
            .findByStageAndCompanyId(stage, companyId)
            .orElse(EmailTemplate.builder()
                .stage(stage)
                .companyId(companyId)
                .isActive(true)
                .build());
        
        template.setSubject(subject);
        template.setBodyTemplate(bodyTemplate);
        template.setIsActive(true);
        
        return emailTemplateRepository.save(template);
    }
    
    @Override
    public EmailTemplate getTemplateForStage(RecruitmentStage stage, Long companyId) {
        return emailTemplateRepository
            .findByStageAndCompanyIdAndIsActiveTrue(stage, companyId)
            .orElse(null);
    }
    
    @Override
    public List<EmailTemplate> getAllTemplatesForCompany(Long companyId) {
        return emailTemplateRepository.findAll()
            .stream()
            .filter(t -> t.getCompanyId().equals(companyId) && t.getIsActive())
            .toList();
    }
    
    @Override
    public List<EmailAuditLog> getEmailHistoryFor(JobApplication application) {
        return emailAuditLogRepository.findByJobApplication(application);
    }
    
    @Override
    public List<EmailAuditLog> getEmailHistoryForCandidate(String candidateEmail) {
        return emailAuditLogRepository.findByRecipientEmail(candidateEmail);
    }
    
    @Override
    public void resendEmail(Long auditLogId) {
        EmailAuditLog auditLog = emailAuditLogRepository.findById(auditLogId)
            .orElseThrow(() -> new ResourceNotFoundException("Email audit log not found"));
        
        EmailRequest emailRequest = EmailRequest.builder()
            .to(auditLog.getRecipientEmail())
            .subject(auditLog.getSubject())
            .body(auditLog.getBody())
            .isHtml(false)
            .build();
        
        try {
            notificationService.sendEmail(emailRequest);
            auditLog.setStatus(EmailAuditLog.EmailStatus.SENT);
            auditLog.setErrorMessage(null);
            log.info("Email resent successfully for application {}", auditLog.getJobApplication().getId());
        } catch (Exception e) {
            auditLog.setStatus(EmailAuditLog.EmailStatus.FAILED);
            auditLog.setErrorMessage(e.getMessage());
            log.error("Failed to resend email: {}", e.getMessage());
        }
        
        emailAuditLogRepository.save(auditLog);
    }
    
    // ============== Private Helper Methods ==============
    
    private void sendEmail(JobApplication application, String subject, String body, RecruitmentStage stage) {
        log.info("[EMAIL_SEND] Starting email send for application {} - Stage: {} - To: {}", 
                application.getId(), stage, application.getEmail());
        
        EmailRequest emailRequest = EmailRequest.builder()
            .to(application.getEmail())
            .subject(subject)
            .body(body)
            .isHtml(false)
            .build();
        
        try {
            log.info("[EMAIL_SEND] Calling notificationService.sendEmail() for {}", application.getEmail());
            notificationService.sendEmail(emailRequest);
            log.info("[EMAIL_SEND] notificationService.sendEmail() completed for {}", application.getEmail());
            
            // Log the successful email
            EmailAuditLog auditLog = EmailAuditLog.builder()
                .jobApplication(application)
                .recipientEmail(application.getEmail())
                .subject(subject)
                .body(body)
                .stage(stage)
                .sentAt(LocalDateTime.now())
                .status(EmailAuditLog.EmailStatus.SENT)
                .companyId(1L)
                .build();
            
            emailAuditLogRepository.save(auditLog);
            log.info("[EMAIL_SEND] Email sent successfully to {} for stage {}", application.getEmail(), stage);
            
        } catch (Exception e) {
            log.error("[EMAIL_SEND] ERROR sending email to {}: {} - {}", 
                    application.getEmail(), e.getClass().getName(), e.getMessage(), e);
            
            // Log the failed email attempt
            EmailAuditLog auditLog = EmailAuditLog.builder()
                .jobApplication(application)
                .recipientEmail(application.getEmail())
                .subject(subject)
                .body(body)
                .stage(stage)
                .sentAt(LocalDateTime.now())
                .status(EmailAuditLog.EmailStatus.FAILED)
                .errorMessage(e.getMessage())
                .companyId(1L)
                .build();
            
            emailAuditLogRepository.save(auditLog);
        }
    }
    
    private EmailTemplateData buildTemplateData(JobApplication application) {
        return EmailTemplateData.builder()
            .candidateName(application.getApplicantName())
            .positionTitle(application.getJobOffer().getTitle())
            .companyName("Company")
            .jobDescription(application.getJobOffer().getDescription())
            .salaryRange(application.getJobOffer().getSalaryMin() + " - " + 
                        application.getJobOffer().getSalaryMax())
            .build();
    }
    
    private EmailTemplateData buildTemplateDataWithSchedule(JobApplication application, InterviewSchedule schedule) {
        EmailTemplateData data = buildTemplateData(application);
        
        if (schedule.getScheduledDateTime() != null) {
            data.setScheduledDate(schedule.getScheduledDateTime().format(DATE_FORMATTER));
            data.setScheduledTime(schedule.getScheduledDateTime().format(TIME_FORMATTER));
        }
        
        if (schedule.getMeetingLink() != null) {
            data.setMeetingLink(schedule.getMeetingLink());
        }
        
        // Only include interviewer info for interview types, not for tests
        if (schedule.getType() != null && isInterviewType(schedule.getType())) {
            if (schedule.getInterviewerName() != null) {
                data.setRecruitmentManager(schedule.getInterviewerName());
            }
            
            if (schedule.getInterviewerEmail() != null) {
                data.setRecruitmentManagerEmail(schedule.getInterviewerEmail());
            }
        }
        
        return data;
    }
    
    private boolean isInterviewType(InterviewSchedule.ScheduleType type) {
        return type == InterviewSchedule.ScheduleType.PHONE_SCREENING ||
               type == InterviewSchedule.ScheduleType.TECHNICAL_INTERVIEW ||
               type == InterviewSchedule.ScheduleType.BEHAVIORAL_INTERVIEW ||
               type == InterviewSchedule.ScheduleType.FINAL_INTERVIEW;
    }
    
    private RecruitmentStage mapStatusToStage(JobApplicationStatus status) {
        return switch (status) {
            case PENDING -> RecruitmentStage.APPLICATION_RECEIVED;
            case REVIEWED -> RecruitmentStage.APPLICATION_RECEIVED;
            case INTERVIEW_1_SCHEDULED -> RecruitmentStage.INTERVIEW_SCHEDULED;
            case INTERVIEW_1_COMPLETED -> RecruitmentStage.INTERVIEW_COMPLETED;
            case INTERVIEW_2_SCHEDULED -> RecruitmentStage.INTERVIEW_SCHEDULED;
            case INTERVIEW_2_COMPLETED -> RecruitmentStage.INTERVIEW_COMPLETED;
            case INTERVIEW_3_SCHEDULED -> RecruitmentStage.INTERVIEW_SCHEDULED;
            case INTERVIEW_3_COMPLETED -> RecruitmentStage.INTERVIEW_COMPLETED;
            case TEST_SCHEDULED -> RecruitmentStage.TEST_SCHEDULED;
            case TEST_COMPLETED -> RecruitmentStage.TEST_COMPLETED;
            case OFFER_EXTENDED -> RecruitmentStage.OFFER_EXTENDED;
            case ACCEPTED -> RecruitmentStage.OFFER_ACCEPTED;
            case REJECTED -> RecruitmentStage.REJECTED;
            case REJECTED_AFTER_INTERVIEW -> RecruitmentStage.REJECTED_AFTER_INTERVIEW;
            case REJECTED_FINAL -> RecruitmentStage.REJECTED_FINAL;
        };
    }
    
    private RecruitmentStage determineRejectionStage(JobApplication application) {
        JobApplicationStatus status = application.getStatus();
        
        return switch (status) {
            case REJECTED, PENDING, REVIEWED -> RecruitmentStage.REJECTED;
            case REJECTED_AFTER_INTERVIEW, INTERVIEW_1_COMPLETED, INTERVIEW_2_COMPLETED, 
                 INTERVIEW_3_COMPLETED -> RecruitmentStage.REJECTED_AFTER_INTERVIEW;
            case REJECTED_FINAL, TEST_COMPLETED, OFFER_EXTENDED -> RecruitmentStage.REJECTED_FINAL;
            default -> RecruitmentStage.REJECTED;
        };
    }
    
    private void sendDefaultInterviewScheduleEmail(JobApplication application, InterviewSchedule schedule) {
        String subject = "Interview Scheduled - " + application.getJobOffer().getTitle();
        String body = String.format(
            "Dear %s,\n\n" +
            "We are pleased to invite you for an interview for the position of %s.\n\n" +
            "Interview Details:\n" +
            "Date: %s\n" +
            "Time: %s\n" +
            "Type: %s\n" +
            "Location: %s\n" +
            "%s" +
            "\nPlease confirm your availability.\n\n" +
            "Best regards,\n" +
            "HR Team",
            application.getApplicantName(),
            application.getJobOffer().getTitle(),
            schedule.getScheduledDateTime().format(DATE_FORMATTER),
            schedule.getScheduledDateTime().format(TIME_FORMATTER),
            schedule.getType().getDisplayName(),
            schedule.getLocation() != null ? schedule.getLocation() : "To be confirmed",
            schedule.getMeetingLink() != null ? "\nMeeting Link: " + schedule.getMeetingLink() : ""
        );
        
        sendEmail(application, subject, body, RecruitmentStage.INTERVIEW_SCHEDULED);
    }
    
    private void sendDefaultRejectionEmail(JobApplication application, String rejectionReason) {
        String subject = "Application Status Update - " + application.getJobOffer().getTitle();
        String body = String.format(
            "Dear %s,\n\n" +
            "Thank you for your interest in the position of %s.\n\n" +
            "After careful consideration, we regret to inform you that we have decided to move forward with other candidates.\n\n" +
            "We appreciate the time and effort you invested in the application process and encourage you to apply for future opportunities.\n\n" +
            "Best regards,\n" +
            "HR Team",
            application.getApplicantName(),
            application.getJobOffer().getTitle()
        );
        
        sendEmail(application, subject, body, RecruitmentStage.REJECTED);
    }
    
    private void sendDefaultOfferEmail(JobApplication application) {
        String subject = "Job Offer - " + application.getJobOffer().getTitle();
        String body = String.format(
            "Dear %s,\n\n" +
            "Congratulations! We are delighted to offer you the position of %s.\n\n" +
            "Position Details:\n" +
            "Title: %s\n" +
            "Salary Range: %s - %s\n" +
            "\nPlease review the attached offer letter and get back to us with your acceptance.\n\n" +
            "Best regards,\n" +
            "HR Team",
            application.getApplicantName(),
            application.getJobOffer().getTitle(),
            application.getJobOffer().getTitle(),
            application.getJobOffer().getSalaryMin(),
            application.getJobOffer().getSalaryMax()
        );
        
        sendEmail(application, subject, body, RecruitmentStage.OFFER_EXTENDED);
    }
}
