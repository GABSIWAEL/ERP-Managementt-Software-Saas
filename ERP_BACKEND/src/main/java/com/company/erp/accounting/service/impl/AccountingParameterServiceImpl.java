package com.company.erp.accounting.service.impl;

import com.company.erp.accounting.dto.AccountingParameterDTO;
import com.company.erp.accounting.entity.AccountingParameter;
import com.company.erp.accounting.repository.AccountingParameterRepository;
import com.company.erp.accounting.service.AccountingParameterService;
import com.company.erp.audit.entity.AuditLog;
import com.company.erp.audit.repository.AuditLogRepository;
import com.company.erp.common.exception.BusinessLogicException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AccountingParameterServiceImpl implements AccountingParameterService {
    
    private final AccountingParameterRepository accountingParameterRepository;
    private final AuditLogRepository auditLogRepository;
    
    @Override
    @Transactional(readOnly = true)
    public AccountingParameterDTO getAccountingParameters() {
        log.info("Fetching accounting parameters");
        List<AccountingParameter> parameters = accountingParameterRepository.findAll();
        if (parameters.isEmpty()) {
            throw new BusinessLogicException("Accounting parameters not configured");
        }
        return mapToDTO(parameters.get(0));
    }
    
    @Override
    public AccountingParameterDTO updateAccountingParameters(AccountingParameterDTO accountingParameterDTO) {
        log.info("Updating accounting parameters");
        
        List<AccountingParameter> parameters = accountingParameterRepository.findAll();
        AccountingParameter parameter;
        
        if (parameters.isEmpty()) {
            parameter = AccountingParameter.builder()
                    .taxPercentage(accountingParameterDTO.getTaxPercentage())
                    .insurancePercentage(accountingParameterDTO.getInsurancePercentage())
                    .overtimeRate(accountingParameterDTO.getOvertimeRate())
                    .bonusPercentage(accountingParameterDTO.getBonusPercentage())
                    .leavePayoutPercentage(accountingParameterDTO.getLeavePayoutPercentage())
                    .remoteAllowance(accountingParameterDTO.getRemoteAllowance())
                    .build();
        } else {
            parameter = parameters.get(0);
            parameter.setTaxPercentage(accountingParameterDTO.getTaxPercentage());
            parameter.setInsurancePercentage(accountingParameterDTO.getInsurancePercentage());
            parameter.setOvertimeRate(accountingParameterDTO.getOvertimeRate());
            parameter.setBonusPercentage(accountingParameterDTO.getBonusPercentage());
            parameter.setLeavePayoutPercentage(accountingParameterDTO.getLeavePayoutPercentage());
            parameter.setRemoteAllowance(accountingParameterDTO.getRemoteAllowance());
        }
        
        parameter = accountingParameterRepository.save(parameter);
        
        auditLogRepository.save(AuditLog.builder()
                .action("ACCOUNTING_PARAMETERS_UPDATED")
                .entityName("AccountingParameter")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Accounting parameters updated")
                .build());
        
        return mapToDTO(parameter);
    }
    
    private AccountingParameterDTO mapToDTO(AccountingParameter parameter) {
        return AccountingParameterDTO.builder()
                .id(parameter.getId())
                .taxPercentage(parameter.getTaxPercentage())
                .insurancePercentage(parameter.getInsurancePercentage())
                .overtimeRate(parameter.getOvertimeRate())
                .bonusPercentage(parameter.getBonusPercentage())
                .leavePayoutPercentage(parameter.getLeavePayoutPercentage())
                .remoteAllowance(parameter.getRemoteAllowance())
                .createdAt(parameter.getCreatedAt())
                .updatedAt(parameter.getUpdatedAt())
                .build();
    }
    
    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "SYSTEM";
    }
}
