package com.company.erp.recruitment.service;

import com.company.erp.recruitment.entity.JobApplication;
import com.company.erp.recruitment.entity.JobApplicationStatus;
import com.company.erp.recruitment.entity.RecruitmentStage;
import com.company.erp.recruitment.entity.EmailTemplate;
import com.company.erp.recruitment.entity.InterviewSchedule;
import com.company.erp.recruitment.entity.EmailAuditLog;

import java.util.List;

/**
 * Service for managing automated email notifications in the recruitment pipeline
 */
public interface RecruitmentEmailService {
    
    /**
     * Send email when job application status changes
     */
    void sendStatusChangeEmail(JobApplication application, JobApplicationStatus newStatus, String notes);
    
    /**
     * Send interview scheduling notification email
     */
    void sendInterviewScheduleEmail(JobApplication application, InterviewSchedule schedule);
    
    /**
     * Send rejection email
     */
    void sendRejectionEmail(JobApplication application, String rejectionReason);
    
    /**
     * Send offer letter
     */
    void sendOfferEmail(JobApplication application);
    
    /**
     * Create or update email template for a stage
     */
    EmailTemplate createOrUpdateTemplate(RecruitmentStage stage, String subject, String bodyTemplate, Long companyId);
    
    /**
     * Get email template for a stage
     */
    EmailTemplate getTemplateForStage(RecruitmentStage stage, Long companyId);
    
    /**
     * Get all templates for a company
     */
    List<EmailTemplate> getAllTemplatesForCompany(Long companyId);
    
    /**
     * Get email history for an application
     */
    List<EmailAuditLog> getEmailHistoryFor(JobApplication application);
    
    /**
     * Get email history for a candidate
     */
    List<EmailAuditLog> getEmailHistoryForCandidate(String candidateEmail);
    
    /**
     * Resend an email from audit log
     */
    void resendEmail(Long auditLogId);
}
