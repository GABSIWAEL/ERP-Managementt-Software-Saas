package com.company.erp.accounting.service.impl;

import com.company.erp.accounting.entity.AccountingParameterAuditLog;
import com.company.erp.accounting.repository.AccountingParameterAuditLogRepository;
import com.company.erp.accounting.service.AccountingParameterVersioningService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Implementation of accounting parameter versioning service
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AccountingParameterVersioningServiceImpl implements AccountingParameterVersioningService {
    
    private final AccountingParameterAuditLogRepository repository;
    
    @Override
    public AccountingParameterAuditLog logParameterChange(String parameterCode, String parameterName,
                                                         String previousValue, String currentValue,
                                                         LocalDate effectiveDate, String changeReason) {
        log.info("Logging parameter change for code: {}, effective date: {}", parameterCode, effectiveDate);
        
        // Get the current version to determine the next version number
        List<AccountingParameterAuditLog> existingVersions = repository.findByParameterCodeOrderByVersionNumberDesc(parameterCode);
        int nextVersionNumber = existingVersions.isEmpty() ? 1 : existingVersions.get(0).getVersionNumber() + 1;
        
        // If there's a current active version, mark it as inactive with end date
        if (!existingVersions.isEmpty()) {
            AccountingParameterAuditLog lastVersion = existingVersions.get(0);
            if (lastVersion.getIsActive()) {
                lastVersion.setIsActive(false);
                lastVersion.setEndDate(effectiveDate.minusDays(1));
                repository.save(lastVersion);
                log.info("Retired previous version {} for parameter: {}", lastVersion.getVersionNumber(), parameterCode);
            }
        }
        
        // Create and save new version
        AccountingParameterAuditLog newVersion = AccountingParameterAuditLog.builder()
                .parameterCode(parameterCode)
                .parameterName(parameterName)
                .previousValue(previousValue)
                .currentValue(currentValue)
                .effectiveDate(effectiveDate)
                .versionNumber(nextVersionNumber)
                .changeReason(changeReason)
                .isActive(true)
                .build();
        
        AccountingParameterAuditLog saved = repository.save(newVersion);
        log.info("Created new version {} for parameter: {} with effective date: {}", 
                nextVersionNumber, parameterCode, effectiveDate);
        
        return saved;
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<AccountingParameterAuditLog> getCurrentVersion(String parameterCode) {
        log.debug("Retrieving current version for parameter: {}", parameterCode);
        return repository.findCurrentVersion(parameterCode);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<AccountingParameterAuditLog> getVersionByDate(String parameterCode, LocalDate date) {
        log.debug("Retrieving parameter version for code: {} on date: {}", parameterCode, date);
        return repository.findVersionByDate(parameterCode, date);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AccountingParameterAuditLog> getVersionHistory(String parameterCode) {
        log.debug("Retrieving version history for parameter: {}", parameterCode);
        return repository.findByParameterCodeOrderByVersionNumberDesc(parameterCode);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AccountingParameterAuditLog> getVersionsInDateRange(String parameterCode,
                                                                    LocalDate startDate, LocalDate endDate) {
        log.debug("Retrieving parameter versions for code: {} between {} and {}", 
                parameterCode, startDate, endDate);
        return repository.findVersionsInDateRange(parameterCode, startDate, endDate);
    }
    
    @Override
    public AccountingParameterAuditLog retireVersion(String parameterCode, int versionNumber, LocalDate retirementDate) {
        log.info("Retiring version {} for parameter: {} effective date: {}", 
                versionNumber, parameterCode, retirementDate);
        
        AccountingParameterAuditLog version = repository.findAll().stream()
                .filter(v -> v.getParameterCode().equals(parameterCode) && 
                           v.getVersionNumber().equals(versionNumber))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "Parameter version not found: " + parameterCode + " v" + versionNumber));
        
        version.setIsActive(false);
        version.setEndDate(retirementDate);
        
        return repository.save(version);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AccountingParameterAuditLog> getAllActiveVersions() {
        log.debug("Retrieving all active parameter versions");
        return repository.findByIsActiveTrue();
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AccountingParameterAuditLog> searchParametersByName(String parameterName) {
        log.debug("Searching parameters by name: {}", parameterName);
        return repository.findByParameterNameContainingIgnoreCase(parameterName);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<String> getParameterValueForDate(String parameterCode, LocalDate calculationDate) {
        log.debug("Retrieving parameter value for code: {} on date: {}", parameterCode, calculationDate);
        return repository.findVersionByDate(parameterCode, calculationDate)
                .map(AccountingParameterAuditLog::getCurrentValue);
    }
}
