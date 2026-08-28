package com.company.erp.recruitment.entity;

/**
 * Recruitment pipeline stages for email notifications
 */
public enum RecruitmentStage {
    APPLICATION_RECEIVED("Application Received"),
    INTERVIEW_SCHEDULED("Interview Scheduled"),
    INTERVIEW_COMPLETED("Interview Completed"),
    TEST_SCHEDULED("Test Scheduled"),
    TEST_COMPLETED("Test Completed"),
    OFFER_EXTENDED("Offer Extended"),
    OFFER_ACCEPTED("Offer Accepted"),
    REJECTED("Rejected - Early Stage"),
    REJECTED_AFTER_INTERVIEW("Rejected - After Interview"),
    REJECTED_FINAL("Rejected - Final Stage");

    private final String displayName;

    RecruitmentStage(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
