package com.company.erp.reporting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for payroll summary report
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayrollSummaryDTO {
    
    private Long employeeId;
    private String employeeName;
    private String department;
    private BigDecimal baseSalary;
    private BigDecimal totalOvertime;
    private BigDecimal totalDeductions;
    private BigDecimal netSalary;
    private int month;
    private int year;
    private boolean locked;
}
