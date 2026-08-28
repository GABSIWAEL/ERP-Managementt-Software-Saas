package com.company.erp.payroll.controller;

import com.company.erp.common.dto.ApiResponse;
import com.company.erp.payroll.dto.PayrollDTO;
import com.company.erp.payroll.service.PayrollService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/payroll")
@RequiredArgsConstructor
public class PayrollController {
    
    private final PayrollService payrollService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'ADMIN')")
    public ResponseEntity<ApiResponse<PayrollDTO>> createPayroll(
            @Valid @RequestBody PayrollDTO payrollDTO) {
        log.info("Creating payroll");
        PayrollDTO createdPayroll = payrollService.createPayroll(payrollDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(createdPayroll, "Payroll created successfully", 201));
    }
    
    @PostMapping("/generate/{employeeId}")
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'ADMIN')")
    public ResponseEntity<ApiResponse<PayrollDTO>> generatePayroll(
            @PathVariable Long employeeId,
            @RequestParam int month,
            @RequestParam int year) {
        log.info("Generating payroll for employee: {}", employeeId);
        PayrollDTO generatedPayroll = payrollService.generatePayroll(employeeId, month, year);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(generatedPayroll, "Payroll generated successfully", 201));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'ADMIN')")
    public ResponseEntity<ApiResponse<PayrollDTO>> updatePayroll(
            @PathVariable Long id,
            @Valid @RequestBody PayrollDTO payrollDTO) {
        log.info("Updating payroll with ID: {}", id);
        PayrollDTO updatedPayroll = payrollService.updatePayroll(id, payrollDTO);
        return ResponseEntity.ok(ApiResponse.success(updatedPayroll, "Payroll updated successfully"));
    }
    
    @PostMapping("/{id}/lock")
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> lockPayroll(@PathVariable Long id) {
        log.info("Locking payroll with ID: {}", id);
        payrollService.lockPayroll(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Payroll locked successfully"));
    }
    
    @PostMapping("/{id}/unlock")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> unlockPayroll(@PathVariable Long id) {
        log.info("Unlocking payroll with ID: {}", id);
        payrollService.unlockPayroll(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Payroll unlocked successfully"));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePayroll(@PathVariable Long id) {
        log.info("Deleting payroll with ID: {}", id);
        payrollService.deletePayroll(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Payroll deleted successfully"));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PayrollDTO>> getPayrollById(@PathVariable Long id) {
        log.info("Fetching payroll with ID: {}", id);
        PayrollDTO payroll = payrollService.getPayrollById(id);
        return ResponseEntity.ok(ApiResponse.success(payroll, "Payroll fetched successfully"));
    }
    
    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<PayrollDTO>>> getPayrollsByEmployee(
            @PathVariable Long employeeId) {
        log.info("Fetching payrolls for employee: {}", employeeId);
        List<PayrollDTO> payrolls = payrollService.getPayrollsByEmployeeId(employeeId);
        return ResponseEntity.ok(ApiResponse.success(payrolls, "Payrolls fetched successfully"));
    }
    
    @GetMapping("/month/{month}/{year}")
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<PayrollDTO>>> getPayrollsByMonth(
            @PathVariable int month,
            @PathVariable int year) {
        log.info("Fetching payrolls for month: {}/{}", month, year);
        List<PayrollDTO> payrolls = payrollService.getPayrollsByMonth(month, year);
        return ResponseEntity.ok(ApiResponse.success(payrolls, "Payrolls fetched successfully"));
    }
    
    @GetMapping("/unlocked")
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<PayrollDTO>>> getUnlockedPayrolls() {
        log.info("Fetching unlocked payrolls");
        List<PayrollDTO> payrolls = payrollService.getUnlockedPayrolls();
        return ResponseEntity.ok(ApiResponse.success(payrolls, "Unlocked payrolls fetched successfully"));
    }
}
