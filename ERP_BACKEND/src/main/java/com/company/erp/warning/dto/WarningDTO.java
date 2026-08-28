package com.company.erp.warning.dto;

import com.company.erp.common.enums.WarningSeverity;
import com.company.erp.common.enums.WarningStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class WarningDTO {

    private Long id;

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    private String employeeName;

    @NotBlank(message = "Reason is required")
    private String reason;

    @NotNull(message = "Severity is required")
    private WarningSeverity severity;

    private String comments;

    private LocalDate dateIssued;

    private WarningStatus status;

    private String hrComment;

    private LocalDateTime reunionScheduledAt;

    private String reunionReport;

    private LocalDateTime resolvedAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
