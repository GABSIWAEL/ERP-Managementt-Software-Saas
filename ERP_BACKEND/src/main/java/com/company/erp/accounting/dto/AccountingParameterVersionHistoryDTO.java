package com.company.erp.accounting.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for accounting parameter version history
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountingParameterVersionHistoryDTO {
    
    private Long id;
    
    private String parameterName;
    
    private String parameterCode;
    
    private String previousValue;
    
    private String currentValue;
    
    private Integer versionNumber;
    
    private LocalDate effectiveDate;
    
    private LocalDate endDate;
    
    private String changeReason;
    
    private Boolean isActive;
    
    private LocalDateTime createdAt;
    
    private String createdBy;
    
    private LocalDateTime updatedAt;
    
    private String updatedBy;
    
    /**
     * Get numeric value if applicable
     */
    public BigDecimal getNumericValue() {
        try {
            return new BigDecimal(currentValue);
        } catch (NumberFormatException e) {
            return null;
        }
    }
    
    /**
     * Check if version is currently active
     */
    public boolean isCurrent() {
        return isActive && LocalDate.now().isAfter(effectiveDate) && 
               (endDate == null || LocalDate.now().isBefore(endDate));
    }
}
