package com.company.erp.recruitment.entity;

import com.company.erp.common.entity.AbstractAuditableEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Audit log for tracking all emails sent during the recruitment process
 * Provides traceability and history of communications with candidates
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "email_audit_logs")
public class EmailAuditLog extends AbstractAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_application_id", nullable = false)
    private JobApplication jobApplication;

    @Column(nullable = false, length = 500)
    private String recipientEmail;

    @Column(nullable = false, length = 500)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private RecruitmentStage stage;

    @Column(nullable = false, columnDefinition = "TIMESTAMP")
    private LocalDateTime sentAt;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private EmailStatus status;

    @Column(length = 1000)
    private String errorMessage;

    @Column(length = 500)
    private String sentBy;

    @Column(length = 1000)
    private String relatedScheduleId;

    /**
     * Company ID for multi-tenant support
     */
    @Column(nullable = false)
    private Long companyId;

    public enum EmailStatus {
        SENT,
        PENDING,
        FAILED,
        BOUNCED
    }
}
