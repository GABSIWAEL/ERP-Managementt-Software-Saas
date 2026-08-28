package com.company.erp.accounting.dto;

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
public class AccountingParameterDTO {

    private Long id;

    @NotNull(message = "Tax percentage is required")
    private BigDecimal taxPercentage;

    @NotNull(message = "Insurance percentage is required")
    private BigDecimal insurancePercentage;

    @NotNull(message = "Overtime rate is required")
    private BigDecimal overtimeRate;

    @NotNull(message = "Bonus percentage is required")
    private BigDecimal bonusPercentage;

    @NotNull(message = "Leave payout percentage is required")
    private BigDecimal leavePayoutPercentage;

    @NotNull(message = "Remote allowance is required")
    private BigDecimal remoteAllowance;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
