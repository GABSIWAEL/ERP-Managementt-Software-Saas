package com.company.erp.recruitment.entity;

import com.company.erp.common.entity.AbstractAuditableEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Email template for automated recruitment notifications
 * Supports dynamic fields like {candidateName}, {positionTitle}, {scheduledDate}, etc.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "email_templates", uniqueConstraints = @UniqueConstraint(columnNames = {"stage", "companyId"}))
public class EmailTemplate extends AbstractAuditableEntity {

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private RecruitmentStage stage;

    @Column(nullable = false, length = 500)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String bodyTemplate;

    @Column(nullable = false)
    private Boolean isActive;

    @Column(length = 500)
    private String description;

    /**
     * Company ID for multi-tenant support
     */
    @Column(nullable = false)
    private Long companyId;

    public String fillTemplate(EmailTemplateData data) {
        String result = this.bodyTemplate;
        
        // Replace all dynamic fields
        if (data.getCandidateName() != null) {
            result = result.replace("{candidateName}", data.getCandidateName());
        }
        if (data.getPositionTitle() != null) {
            result = result.replace("{positionTitle}", data.getPositionTitle());
        }
        if (data.getScheduledDate() != null) {
            result = result.replace("{scheduledDate}", data.getScheduledDate());
        }
        if (data.getScheduledTime() != null) {
            result = result.replace("{scheduledTime}", data.getScheduledTime());
        }
        if (data.getMeetingLink() != null) {
            result = result.replace("{meetingLink}", data.getMeetingLink());
        }
        if (data.getCompanyName() != null) {
            result = result.replace("{companyName}", data.getCompanyName());
        }
        if (data.getRecruitmentManager() != null) {
            result = result.replace("{recruitmentManager}", data.getRecruitmentManager());
        }
        if (data.getRecruitmentManagerEmail() != null) {
            result = result.replace("{recruitmentManagerEmail}", data.getRecruitmentManagerEmail());
        }
        if (data.getRecruitmentManagerPhone() != null) {
            result = result.replace("{recruitmentManagerPhone}", data.getRecruitmentManagerPhone());
        }
        if (data.getJobDescription() != null) {
            result = result.replace("{jobDescription}", data.getJobDescription());
        }
        if (data.getSalaryRange() != null) {
            result = result.replace("{salaryRange}", data.getSalaryRange());
        }
        if (data.getStartDate() != null) {
            result = result.replace("{startDate}", data.getStartDate());
        }
        
        return result;
    }

    public String fillSubject(EmailTemplateData data) {
        String result = this.subject;
        
        if (data.getCandidateName() != null) {
            result = result.replace("{candidateName}", data.getCandidateName());
        }
        if (data.getPositionTitle() != null) {
            result = result.replace("{positionTitle}", data.getPositionTitle());
        }
        if (data.getCompanyName() != null) {
            result = result.replace("{companyName}", data.getCompanyName());
        }
        
        return result;
    }
}
