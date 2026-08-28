package com.company.erp.accounting.service;

import com.company.erp.accounting.entity.AccountingParameterAuditLog;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Service for managing accounting parameter versioning
 */
public interface AccountingParameterVersioningService {
    
    /**
     * Log a change to an accounting parameter
     */
    AccountingParameterAuditLog logParameterChange(String parameterCode, String parameterName, 
                                                   String previousValue, String currentValue,
                                                   LocalDate effectiveDate, String changeReason);
    
    /**
     * Get the current active version of a parameter
     */
    Optional<AccountingParameterAuditLog> getCurrentVersion(String parameterCode);
    
    /**
     * Get parameter version for a specific date (point-in-time query)
     */
    Optional<AccountingParameterAuditLog> getVersionByDate(String parameterCode, LocalDate date);
    
    /**
     * Get all versions of a parameter
     */
    List<AccountingParameterAuditLog> getVersionHistory(String parameterCode);
    
    /**
     * Get all versions in a date range
     */
    List<AccountingParameterAuditLog> getVersionsInDateRange(String parameterCode, 
                                                             LocalDate startDate, LocalDate endDate);
    
    /**
     * Retire a parameter version
     */
    AccountingParameterAuditLog retireVersion(String parameterCode, int versionNumber, LocalDate retirementDate);
    
    /**
     * Get all active parameter versions
     */
    List<AccountingParameterAuditLog> getAllActiveVersions();
    
    /**
     * Search parameters by name
     */
    List<AccountingParameterAuditLog> searchParametersByName(String parameterName);
    
    /**
     * Get parameter value for payroll calculation on a specific date
     */
    Optional<String> getParameterValueForDate(String parameterCode, LocalDate calculationDate);
}
