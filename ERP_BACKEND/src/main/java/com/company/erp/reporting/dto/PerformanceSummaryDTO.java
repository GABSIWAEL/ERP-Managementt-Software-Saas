package com.company.erp.reporting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for performance summary report
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerformanceSummaryDTO {
    
    private Long employeeId;
    private String employeeName;
    private String department;
    private double technicalScore;
    private double teamworkScore;
    private double productivityScore;
    private double averageScore;
    private String performanceRating; // EXCELLENT, GOOD, AVERAGE, POOR
    private int evaluationsCount;
    private int month;
    private int year;
}
