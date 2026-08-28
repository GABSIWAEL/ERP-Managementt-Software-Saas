package com.company.erp.accounting.entity;

import com.company.erp.common.entity.AbstractAuditableEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "accounting_parameters")
public class AccountingParameter extends AbstractAuditableEntity {

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal taxPercentage;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal insurancePercentage;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal overtimeRate;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal bonusPercentage;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal leavePayoutPercentage;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal remoteAllowance;

}
