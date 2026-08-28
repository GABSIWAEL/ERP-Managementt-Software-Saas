package com.company.erp.accounting.entity;

import com.company.erp.common.entity.AuditEntity;
import lombok.*;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Entity for tracking versions/history of accounting parameters
 * Provides audit trail of accounting parameter changes
 */
@Entity
@Table(name = "accounting_parameter_audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class AccountingParameterAuditLog extends AuditEntity {
    
    @Column(name = "parameter_name", nullable = false)
    private String parameterName;
    
    @Column(name = "parameter_code", nullable = false, unique = true)
    private String parameterCode;
    
    @Column(name = "previous_value", columnDefinition = "TEXT")
    private String previousValue;
    
    @Column(name = "current_value", columnDefinition = "TEXT", nullable = false)
    private String currentValue;
    
    @Column(name = "effective_date", nullable = false)
    private LocalDate effectiveDate;
    
    @Column(name = "end_date")
    private LocalDate endDate;
    
    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;
    
    @Column(name = "change_reason", columnDefinition = "TEXT")
    private String changeReason;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    /**
     * Check if this version is currently active
     */
    public boolean isCurrentVersion() {
        return isActive && LocalDate.now().isAfter(effectiveDate) && 
               (endDate == null || LocalDate.now().isBefore(endDate));
    }
    
    /**
     * Calculate the numeric value if stored as string
     */
    public BigDecimal getNumericValue() {
        try {
            return new BigDecimal(currentValue);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
