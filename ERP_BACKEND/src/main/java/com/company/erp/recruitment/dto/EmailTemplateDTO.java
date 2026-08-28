package com.company.erp.recruitment.dto;

import com.company.erp.recruitment.entity.RecruitmentStage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailTemplateDTO {
    private Long id;
    
    @NotNull(message = "Stage is required")
    private RecruitmentStage stage;
    
    @NotBlank(message = "Subject is required")
    private String subject;
    
    @NotBlank(message = "Body template is required")
    private String bodyTemplate;
    
    private Boolean isActive;
    
    private String description;
    
    private String availableFields;
}
