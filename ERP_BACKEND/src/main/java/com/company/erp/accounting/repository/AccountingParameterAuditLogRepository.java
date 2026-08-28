package com.company.erp.accounting.repository;

import com.company.erp.accounting.entity.AccountingParameterAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository for AccountingParameterAuditLog
 */
@Repository
public interface AccountingParameterAuditLogRepository extends JpaRepository<AccountingParameterAuditLog, Long> {
    
    /**
     * Find all versions of a specific parameter
     */
    List<AccountingParameterAuditLog> findByParameterCodeOrderByVersionNumberDesc(String parameterCode);
    
    /**
     * Find the current active version of a parameter
     */
    @Query("SELECT a FROM AccountingParameterAuditLog a WHERE a.parameterCode = :code AND a.isActive = true " +
           "AND a.effectiveDate <= CURRENT_DATE AND (a.endDate IS NULL OR a.endDate > CURRENT_DATE) " +
           "ORDER BY a.versionNumber DESC LIMIT 1")
    Optional<AccountingParameterAuditLog> findCurrentVersion(@Param("code") String parameterCode);
    
    /**
     * Find parameter version by date (point-in-time query)
     */
    @Query("SELECT a FROM AccountingParameterAuditLog a WHERE a.parameterCode = :code " +
           "AND a.effectiveDate <= :date AND (a.endDate IS NULL OR a.endDate > :date) " +
           "ORDER BY a.versionNumber DESC LIMIT 1")
    Optional<AccountingParameterAuditLog> findVersionByDate(@Param("code") String parameterCode, 
                                                             @Param("date") LocalDate date);
    
    /**
     * Find all active versions
     */
    List<AccountingParameterAuditLog> findByIsActiveTrue();
    
    /**
     * Find all versions of a parameter in a date range
     */
    @Query("SELECT a FROM AccountingParameterAuditLog a WHERE a.parameterCode = :code " +
           "AND a.effectiveDate <= :endDate AND (a.endDate IS NULL OR a.endDate >= :startDate) " +
           "ORDER BY a.effectiveDate ASC")
    List<AccountingParameterAuditLog> findVersionsInDateRange(@Param("code") String parameterCode,
                                                               @Param("startDate") LocalDate startDate,
                                                               @Param("endDate") LocalDate endDate);
    
    /**
     * Find all versions changed after a certain date
     */
    List<AccountingParameterAuditLog> findByEffectiveDateGreaterThanEqualOrderByEffectiveDateDesc(LocalDate effectiveDate);
    
    /**
     * Find parameter by parameter name
     */
    List<AccountingParameterAuditLog> findByParameterNameContainingIgnoreCase(String parameterName);
}
