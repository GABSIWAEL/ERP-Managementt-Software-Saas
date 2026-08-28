package com.company.erp.payroll.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayrollDTO {

    private Long id;

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    private String employeeName;

    @NotNull(message = "Month is required")
    private String month;

    private Integer year;

    @NotNull(message = "Base salary is required")
    private BigDecimal baseSalary;

    private BigDecimal overtimeAmount;

    private BigDecimal bonusAmount;

    private BigDecimal deductions;

    private BigDecimal netSalary;

    private Boolean locked;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
