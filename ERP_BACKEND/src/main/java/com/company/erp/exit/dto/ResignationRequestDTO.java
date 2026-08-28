package com.company.erp.exit.dto;

import com.company.erp.common.enums.ResignationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for ResignationRequest entity
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResignationRequestDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private LocalDate submissionDate;
    private LocalDate lastWorkingDay;
    private String reason;
    private ResignationStatus status;
    private LocalDateTime managerApprovalDate;
    private LocalDateTime hrApprovalDate;
    private String managerComments;
    private String hrComments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
