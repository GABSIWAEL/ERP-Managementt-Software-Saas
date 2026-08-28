package com.company.erp.performance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerformanceEvaluationDTO {

    private Long id;

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    private String employeeName;

    @NotNull(message = "Evaluator ID is required")
    private Long evaluatorId;

    private String evaluatorName;

    @NotNull(message = "Technical score is required")
    @Min(1)
    @Max(5)
    private Integer technicalScore;

    @NotNull(message = "Teamwork score is required")
    @Min(1)
    @Max(5)
    private Integer teamworkScore;

    @NotNull(message = "Productivity score is required")
    @Min(1)
    @Max(5)
    private Integer productivityScore;

    private String comments;

    @NotNull(message = "Evaluation date is required")
    private LocalDateTime evaluationDate;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
