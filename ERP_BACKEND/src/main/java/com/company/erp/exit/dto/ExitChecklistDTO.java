package com.company.erp.exit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for ExitChecklist entity
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExitChecklistDTO {
    private Long id;
    private Long resignationId;
    private Boolean assetsReturned;
    private Boolean leaveSettled;
    private Boolean finalPayrollProcessed;
    private Boolean userAccountDeactivated;
    private Boolean dataArchived;
    private LocalDateTime completionDate;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
