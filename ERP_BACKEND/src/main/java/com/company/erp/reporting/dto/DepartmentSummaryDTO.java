package com.company.erp.reporting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for department summary report
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentSummaryDTO {
    
    private Long departmentId;
    private String departmentName;
    private int totalEmployees;
    private int activeEmployees;
    private int inactiveEmployees;
    private double averageAttendancePercentage;
    private int totalLeavePending;
    private int totalLeaveTaken;
}
