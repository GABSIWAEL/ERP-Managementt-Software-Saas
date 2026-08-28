package com.company.erp.recruitment.entity;

import jakarta.persistence.*;
import lombok.*;
import com.company.erp.common.entity.AbstractAuditableEntity;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_offers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobOffer extends AbstractAuditableEntity {

    @Column(nullable = false, length = 500)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    @Column(nullable = false, length = 500)
    private String department;

    @Column(name = "salary_min")
    private BigDecimal salaryMin;

    @Column(name = "salary_max")
    private BigDecimal salaryMax;

    @Column(name = "job_location", length = 500)
    private String jobLocation;

    @Column(name = "job_type", length = 50)
    private String jobType; // FULL_TIME, PART_TIME, CONTRACT, TEMPORARY

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobOfferStatus status; // OPEN, CLOSED, ARCHIVED

    @Column(name = "posted_date", nullable = false)
    private LocalDateTime postedDate;

    @Column(name = "deadline")
    private LocalDateTime deadline;

    @Column(name = "number_of_positions")
    private Integer numberOfPositions;

    @Column(name = "filled_positions")
    private Integer filledPositions;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(columnDefinition = "TEXT")
    private String benefits;

    @PrePersist
    public void prePersist() {
        if (this.postedDate == null) {
            this.postedDate = LocalDateTime.now();
        }
        if (this.isActive == null) {
            this.isActive = true;
        }
        if (this.status == null) {
            this.status = JobOfferStatus.OPEN;
        }
        if (this.filledPositions == null) {
            this.filledPositions = 0;
        }
    }
}
