package com.company.erp.accounting.service;

import com.company.erp.accounting.dto.AccountingParameterDTO;

public interface AccountingParameterService {
    
    AccountingParameterDTO getAccountingParameters();
    
    AccountingParameterDTO updateAccountingParameters(AccountingParameterDTO accountingParameterDTO);
}
