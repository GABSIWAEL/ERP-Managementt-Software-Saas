package com.company.erp.recruitment.entity;

import jakarta.persistence.*;
import lombok.*;
import com.company.erp.common.entity.AbstractAuditableEntity;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobApplication extends AbstractAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_offer_id", nullable = false)
    private JobOffer jobOffer;

    @Column(nullable = false, length = 500)
    private String applicantName;

    @Column(nullable = false, unique = false, length = 255)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String coverLetter;

    @Column(columnDefinition = "TEXT")
    private String resumeUrl;

    @Column(columnDefinition = "TEXT")
    private String portfolio;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobApplicationStatus status; // PENDING, REVIEWED, ACCEPTED, REJECTED

    @Column(name = "application_date", nullable = false)
    private LocalDateTime applicationDate;

    @Column(name = "reviewed_date")
    private LocalDateTime reviewedDate;

    @Column(columnDefinition = "TEXT")
    private String reviewNotes;

    @Column(columnDefinition = "TEXT")
    private String linkedinUrl;

    @Column(columnDefinition = "TEXT")
    private String website;

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    @PrePersist
    public void prePersist() {
        if (this.applicationDate == null) {
            this.applicationDate = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = JobApplicationStatus.PENDING;
        }
    }
}
