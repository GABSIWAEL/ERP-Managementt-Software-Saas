package com.company.erp.accounting.controller;

import com.company.erp.accounting.dto.AccountingParameterVersionHistoryDTO;
import com.company.erp.accounting.entity.AccountingParameterAuditLog;
import com.company.erp.accounting.service.AccountingParameterVersioningService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * REST Controller for accounting parameter versioning
 * Manages versions and history of accounting parameters
 */
@Slf4j
@RestController
@RequestMapping("/api/accounting/parameters/versions")
@RequiredArgsConstructor
public class AccountingParameterVersioningController {
    
    private final AccountingParameterVersioningService versioningService;
    
    /**
     * POST /api/accounting/parameters/versions
     * Log a new parameter version/change
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE')")
    public ResponseEntity<AccountingParameterAuditLog> logParameterChange(
            @RequestParam @NotBlank String parameterCode,
            @RequestParam @NotBlank String parameterName,
            @RequestParam(required = false) String previousValue,
            @RequestParam @NotBlank String currentValue,
            @RequestParam LocalDate effectiveDate,
            @RequestParam(required = false) String changeReason) {
        
        log.info("Logging parameter change for code: {}", parameterCode);
        
        AccountingParameterAuditLog result = versioningService.logParameterChange(
                parameterCode, parameterName, previousValue, currentValue, effectiveDate, changeReason);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }
    
    /**
     * GET /api/accounting/parameters/versions/{parameterCode}/current
     * Get the current active version of a parameter
     */
    @GetMapping("/{parameterCode}/current")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE', 'HR')")
    public ResponseEntity<AccountingParameterAuditLog> getCurrentVersion(
            @PathVariable @NotBlank String parameterCode) {
        
        log.info("Fetching current version for parameter: {}", parameterCode);
        
        Optional<AccountingParameterAuditLog> result = versioningService.getCurrentVersion(parameterCode);
        
        return result.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * GET /api/accounting/parameters/versions/{parameterCode}/by-date?date=2024-01-15
     * Get parameter version for a specific date (point-in-time query)
     */
    @GetMapping("/{parameterCode}/by-date")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE', 'HR')")
    public ResponseEntity<AccountingParameterAuditLog> getVersionByDate(
            @PathVariable @NotBlank String parameterCode,
            @RequestParam LocalDate date) {
        
        log.info("Fetching parameter version for code: {} on date: {}", parameterCode, date);
        
        Optional<AccountingParameterAuditLog> result = versioningService.getVersionByDate(parameterCode, date);
        
        return result.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * GET /api/accounting/parameters/versions/{parameterCode}/history
     * Get complete version history for a parameter
     */
    @GetMapping("/{parameterCode}/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE', 'HR')")
    public ResponseEntity<List<AccountingParameterAuditLog>> getVersionHistory(
            @PathVariable @NotBlank String parameterCode) {
        
        log.info("Fetching version history for parameter: {}", parameterCode);
        
        List<AccountingParameterAuditLog> result = versioningService.getVersionHistory(parameterCode);
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * GET /api/accounting/parameters/versions/{parameterCode}/date-range?startDate=2024-01-01&endDate=2024-12-31
     * Get all versions of a parameter in a date range
     */
    @GetMapping("/{parameterCode}/date-range")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE', 'HR')")
    public ResponseEntity<List<AccountingParameterAuditLog>> getVersionsInDateRange(
            @PathVariable @NotBlank String parameterCode,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        
        log.info("Fetching parameter versions for code: {} between {} and {}", 
                parameterCode, startDate, endDate);
        
        List<AccountingParameterAuditLog> result = versioningService.getVersionsInDateRange(
                parameterCode, startDate, endDate);
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * DELETE /api/accounting/parameters/versions/{parameterCode}/{versionNumber}
     * Retire a parameter version
     */
    @DeleteMapping("/{parameterCode}/{versionNumber}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE')")
    public ResponseEntity<AccountingParameterAuditLog> retireVersion(
            @PathVariable @NotBlank String parameterCode,
            @PathVariable Integer versionNumber,
            @RequestParam LocalDate retirementDate) {
        
        log.info("Retiring version {} for parameter: {} effective date: {}", 
                versionNumber, parameterCode, retirementDate);
        
        AccountingParameterAuditLog result = versioningService.retireVersion(
                parameterCode, versionNumber, retirementDate);
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * GET /api/accounting/parameters/versions/active
     * Get all active parameter versions
     */
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE', 'HR')")
    public ResponseEntity<List<AccountingParameterAuditLog>> getAllActiveVersions() {
        
        log.info("Fetching all active parameter versions");
        
        List<AccountingParameterAuditLog> result = versioningService.getAllActiveVersions();
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * GET /api/accounting/parameters/versions/search?name=tax
     * Search parameters by name
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE', 'HR')")
    public ResponseEntity<List<AccountingParameterAuditLog>> searchParametersByName(
            @RequestParam @NotBlank String name) {
        
        log.info("Searching parameters by name: {}", name);
        
        List<AccountingParameterAuditLog> result = versioningService.searchParametersByName(name);
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * GET /api/accounting/parameters/versions/{parameterCode}/value?date=2024-01-15
     * Get parameter value for a specific date (for payroll calculations)
     */
    @GetMapping("/{parameterCode}/value")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE', 'HR')")
    public ResponseEntity<String> getParameterValueForDate(
            @PathVariable @NotBlank String parameterCode,
            @RequestParam LocalDate date) {
        
        log.info("Fetching parameter value for code: {} on date: {}", parameterCode, date);
        
        Optional<String> result = versioningService.getParameterValueForDate(parameterCode, date);
        
        return result.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
