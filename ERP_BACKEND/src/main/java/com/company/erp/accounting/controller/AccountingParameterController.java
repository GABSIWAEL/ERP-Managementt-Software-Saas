package com.company.erp.accounting.controller;

import com.company.erp.accounting.dto.AccountingParameterDTO;
import com.company.erp.accounting.service.AccountingParameterService;
import com.company.erp.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@Slf4j
@RestController
@RequestMapping("/api/accounting-parameters")
@RequiredArgsConstructor
public class AccountingParameterController {
    
    private final AccountingParameterService accountingParameterService;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<AccountingParameterDTO>> getAccountingParameters() {
        log.info("Fetching accounting parameters");
        AccountingParameterDTO parameters = accountingParameterService.getAccountingParameters();
        return ResponseEntity.ok(ApiResponse.success(parameters, "Parameters fetched successfully"));
    }
    
    @PutMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<AccountingParameterDTO>> updateAccountingParameters(
            @Valid @RequestBody AccountingParameterDTO accountingParameterDTO) {
        log.info("Updating accounting parameters");
        AccountingParameterDTO updatedParameters = accountingParameterService.updateAccountingParameters(accountingParameterDTO);
        return ResponseEntity.ok(ApiResponse.success(updatedParameters, "Parameters updated successfully"));
    }
}
