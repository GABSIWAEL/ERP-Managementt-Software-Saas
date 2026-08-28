package com.company.erp.recruitment.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobApplicationDTO {
    private Long id;
    private Long jobOfferId;
    private String jobOfferTitle;
    private String applicantName;
    private String email;
    private String phone;
    private String coverLetter;
    private String resumeUrl;
    private String portfolio;
    private String status;
    private LocalDateTime applicationDate;
    private LocalDateTime reviewedDate;
    private String reviewNotes;
    private String linkedinUrl;
    private String website;
    private Integer yearsOfExperience;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
