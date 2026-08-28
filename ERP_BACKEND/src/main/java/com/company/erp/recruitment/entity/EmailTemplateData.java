package com.company.erp.recruitment.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data holder for email template dynamic fields
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailTemplateData {
    private String candidateName;
    private String positionTitle;
    private String scheduledDate;
    private String scheduledTime;
    private String meetingLink;
    private String companyName;
    private String recruitmentManager;
    private String recruitmentManagerEmail;
    private String recruitmentManagerPhone;
    private String jobDescription;
    private String salaryRange;
    private String startDate;
}
