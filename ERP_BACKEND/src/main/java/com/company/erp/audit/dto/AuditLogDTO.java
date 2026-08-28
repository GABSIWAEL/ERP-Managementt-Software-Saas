package com.company.erp.audit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogDTO {

    private Long id;

    private String action;

    private String entityName;

    private String performedBy;

    private LocalDateTime timestamp;

    private String details;

    private String ipAddress;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
