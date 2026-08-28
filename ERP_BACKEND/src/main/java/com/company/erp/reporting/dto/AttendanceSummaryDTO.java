package com.company.erp.reporting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for attendance summary report
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceSummaryDTO {
    
    private Long employeeId;
    private String employeeName;
    private String department;
    private int totalWorkDays;
    private int attendanceDays;
    private int absentDays;
    private int lateDays;
    private double attendancePercentage;
    private int month;
    private int year;
}
