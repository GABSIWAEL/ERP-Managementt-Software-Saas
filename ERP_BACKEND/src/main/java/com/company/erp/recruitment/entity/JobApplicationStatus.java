package com.company.erp.recruitment.entity;

public enum JobApplicationStatus {
    // Initial stages
    PENDING("Application Pending Review"),
    REVIEWED("Application Reviewed"),
    
    // Interview stages
    INTERVIEW_1_SCHEDULED("1st Interview Scheduled"),
    INTERVIEW_1_COMPLETED("1st Interview Completed"),
    INTERVIEW_2_SCHEDULED("2nd Interview Scheduled"),
    INTERVIEW_2_COMPLETED("2nd Interview Completed"),
    INTERVIEW_3_SCHEDULED("3rd Interview Scheduled"),
    INTERVIEW_3_COMPLETED("3rd Interview Completed"),
    
    // Testing stages
    TEST_SCHEDULED("Assessment Test Scheduled"),
    TEST_COMPLETED("Assessment Test Completed"),
    
    // Final stages
    OFFER_EXTENDED("Job Offer Extended"),
    ACCEPTED("Job Offer Accepted - Employee Created"),
    
    // Rejection reasons
    REJECTED("Application Rejected"),
    REJECTED_AFTER_INTERVIEW("Rejected After Interview"),
    REJECTED_FINAL("Final Stage Rejection");

    private final String displayName;

    JobApplicationStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
