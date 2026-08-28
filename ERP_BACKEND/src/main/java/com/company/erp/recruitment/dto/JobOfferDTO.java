package com.company.erp.recruitment.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobOfferDTO {
    private Long id;
    private String title;
    private String description;
    private String requirements;
    private String department;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String jobLocation;
    private String jobType;
    private String status;
    private LocalDateTime postedDate;
    private LocalDateTime deadline;
    private Integer numberOfPositions;
    private Integer filledPositions;
    private Boolean isActive;
    private String benefits;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
