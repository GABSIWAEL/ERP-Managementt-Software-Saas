package com.company.erp.recruitment.initialization;

import com.company.erp.recruitment.entity.EmailTemplate;
import com.company.erp.recruitment.entity.RecruitmentStage;
import com.company.erp.recruitment.repository.EmailTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Initializes default email templates when the application starts
 */
@Component
public class EmailTemplateInitializer implements ApplicationRunner {
    
    @Autowired
    private EmailTemplateRepository emailTemplateRepository;
    
    private static final Long COMPANY_ID = 1L; // Default company

    @Override
    public void run(org.springframework.boot.ApplicationArguments args) throws Exception {
        initializeDefaultTemplates();
    }

    private void initializeDefaultTemplates() {
        // Application Received
        createTemplateIfNotExists(
            RecruitmentStage.APPLICATION_RECEIVED,
            "Thank You for Your Application - {positionTitle}",
            "Dear {candidateName},\n\n" +
            "Thank you for submitting your application for the position of {positionTitle} at {companyName}.\n\n" +
            "We have received your application and it is currently under review. Our recruitment team will evaluate your qualifications and get back to you shortly.\n\n" +
            "We appreciate your interest in joining our team.\n\n" +
            "Best regards,\n" +
            "{recruitmentManager}\n" +
            "{recruitmentManagerEmail}"
        );

        // Interview Scheduled
        createTemplateIfNotExists(
            RecruitmentStage.INTERVIEW_SCHEDULED,
            "Interview Invitation - {positionTitle}",
            "Dear {candidateName},\n\n" +
            "We are pleased to invite you for an interview for the position of {positionTitle}.\n\n" +
            "Interview Details:\n" +
            "Date: {scheduledDate}\n" +
            "Time: {scheduledTime}\n" +
            "Position: {positionTitle}\n\n" +
            "Interviewer: {recruitmentManager}\n" +
            "Email: {recruitmentManagerEmail}\n\n" +
            "{meetingLink}\n\n" +
            "Please confirm your availability by replying to this email.\n\n" +
            "We look forward to speaking with you soon.\n\n" +
            "Best regards,\n" +
            "HR Team"
        );

        // Interview Completed
        createTemplateIfNotExists(
            RecruitmentStage.INTERVIEW_COMPLETED,
            "Interview Completed - Next Steps",
            "Dear {candidateName},\n\n" +
            "Thank you for taking the time to interview with us for the {positionTitle} position.\n\n" +
            "We appreciated the opportunity to learn more about your background and experience.\n\n" +
            "Our team will review the interview and contact you with next steps within the next few days.\n\n" +
            "Best regards,\n" +
            "HR Team"
        );

        // Test Scheduled
        createTemplateIfNotExists(
            RecruitmentStage.TEST_SCHEDULED,
            "Assessment Test Scheduled - {positionTitle}",
            "Dear {candidateName},\n\n" +
            "Congratulations on progressing to the next stage! We would like to invite you to take an assessment test.\n\n" +
            "Test Details:\n" +
            "Date: {scheduledDate}\n" +
            "Time: {scheduledTime}\n" +
            "Duration: 60 minutes\n\n" +
            "Test Link: {meetingLink}\n\n" +
            "Please ensure you have a stable internet connection and adequate time to complete the test.\n\n" +
            "Best regards,\n" +
            "HR Team"
        );

        // Test Completed
        createTemplateIfNotExists(
            RecruitmentStage.TEST_COMPLETED,
            "Assessment Test Completed",
            "Dear {candidateName},\n\n" +
            "Thank you for completing the assessment test for the {positionTitle} position.\n\n" +
            "We will review your results and provide feedback soon.\n\n" +
            "Best regards,\n" +
            "HR Team"
        );

        // Offer Extended
        createTemplateIfNotExists(
            RecruitmentStage.OFFER_EXTENDED,
            "Job Offer - {positionTitle}",
            "Dear {candidateName},\n\n" +
            "Congratulations! We are pleased to offer you the position of {positionTitle} at {companyName}.\n\n" +
            "Offer Details:\n" +
            "Position: {positionTitle}\n" +
            "Start Date: {startDate}\n" +
            "Salary Range: {salaryRange}\n\n" +
            "Please find the complete offer letter attached to this email.\n\n" +
            "We look forward to welcoming you to our team!\n\n" +
            "Best regards,\n" +
            "{recruitmentManager}\n" +
            "{recruitmentManagerEmail}\n" +
            "{recruitmentManagerPhone}"
        );

        // Offer Accepted
        createTemplateIfNotExists(
            RecruitmentStage.OFFER_ACCEPTED,
            "Welcome to {companyName}!",
            "Dear {candidateName},\n\n" +
            "Welcome to {companyName}! We are thrilled to have you join our team.\n\n" +
            "Your account has been created and you will receive your login credentials shortly.\n\n" +
            "Please familiarize yourself with the company policies and procedures.\n\n" +
            "If you have any questions, please don't hesitate to contact us.\n\n" +
            "Best regards,\n" +
            "HR Team"
        );

        // Rejected
        createTemplateIfNotExists(
            RecruitmentStage.REJECTED,
            "Application Status Update - {positionTitle}",
            "Dear {candidateName},\n\n" +
            "Thank you for your interest in the {positionTitle} position at {companyName}.\n\n" +
            "After careful consideration, we regret to inform you that we have decided to move forward with other candidates at this time.\n\n" +
            "We encourage you to apply for future opportunities with us.\n\n" +
            "Best regards,\n" +
            "HR Team"
        );

        // Rejected After Interview
        createTemplateIfNotExists(
            RecruitmentStage.REJECTED_AFTER_INTERVIEW,
            "Interview Feedback - {positionTitle}",
            "Dear {candidateName},\n\n" +
            "Thank you for interviewing with us for the {positionTitle} position.\n\n" +
            "While we were impressed with your qualifications, we have decided to proceed with other candidates who better matched our current requirements.\n\n" +
            "We would like to keep your profile on file for future opportunities.\n\n" +
            "Best regards,\n" +
            "HR Team"
        );

        // Final Rejection
        createTemplateIfNotExists(
            RecruitmentStage.REJECTED_FINAL,
            "Final Status Update - {positionTitle}",
            "Dear {candidateName},\n\n" +
            "Thank you for your continued interest in the {positionTitle} position at {companyName}.\n\n" +
            "After final review of all candidates, we have made a decision to move forward with another candidate.\n\n" +
            "We appreciate your patience and understanding throughout this process.\n\n" +
            "Best regards,\n" +
            "HR Team"
        );
    }

    private void createTemplateIfNotExists(RecruitmentStage stage, String subject, String body) {
        boolean exists = emailTemplateRepository
            .findByStageAndCompanyId(stage, COMPANY_ID)
            .isPresent();
        
        if (!exists) {
            EmailTemplate template = EmailTemplate.builder()
                .stage(stage)
                .subject(subject)
                .bodyTemplate(body)
                .isActive(true)
                .companyId(COMPANY_ID)
                .build();
            
            emailTemplateRepository.save(template);
        }
    }
}
