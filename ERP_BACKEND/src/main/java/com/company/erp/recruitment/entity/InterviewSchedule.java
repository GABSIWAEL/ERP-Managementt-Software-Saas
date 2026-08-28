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
 * Represents scheduled interviews and tests within the recruitment pipeline
 * Allows recruiters to schedule candidate assessments with calendar integration
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "interview_schedules")
public class InterviewSchedule extends AbstractAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_application_id", nullable = false)
    private JobApplication jobApplication;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ScheduleType type;

    @Column(nullable = false, columnDefinition = "TIMESTAMP")
    private LocalDateTime scheduledDateTime;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 500)
    private String location;

    @Column(length = 1000)
    private String meetingLink;

    @Column(length = 500)
    private String interviewerName;

    @Column(length = 500)
    private String interviewerEmail;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ScheduleStatus status;

    @Column(length = 500)
    private String feedbackNotes;

    @Column
    private Integer ratingScore;

    @Column
    private Boolean reminderSent;

    /**
     * Company ID for multi-tenant support
     */
    @Column(nullable = false)
    private Long companyId;

    public enum ScheduleType {
        PHONE_SCREENING("Phone Screening"),
        TECHNICAL_INTERVIEW("Technical Interview"),
        BEHAVIORAL_INTERVIEW("Behavioral Interview"),
        FINAL_INTERVIEW("Final Interview"),
        ASSESSMENT_TEST("Assessment Test"),
        PRACTICAL_TEST("Practical Test");

        private final String displayName;

        ScheduleType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    public enum ScheduleStatus {
        SCHEDULED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED,
        RESCHEDULED
    }
}
