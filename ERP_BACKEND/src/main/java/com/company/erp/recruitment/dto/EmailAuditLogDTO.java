package com.company.erp.recruitment.dto;

import com.company.erp.recruitment.entity.EmailAuditLog;
import com.company.erp.recruitment.entity.RecruitmentStage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailAuditLogDTO {
    private Long id;
    
    private Long jobApplicationId;
    
    private String recipientEmail;
    
    private String subject;
    
    private String body;
    
    private RecruitmentStage stage;
    
    private LocalDateTime sentAt;
    
    private EmailAuditLog.EmailStatus status;
    
    private String errorMessage;
    
    private String sentBy;
    
    private String candidateName;
    
    private String positionTitle;
}
