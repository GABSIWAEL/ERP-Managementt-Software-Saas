package com.company.erp.exit.controller;

import com.company.erp.common.dto.ApiResponse;
import com.company.erp.exit.dto.ExitChecklistDTO;
import com.company.erp.exit.dto.ResignationRequestDTO;
import com.company.erp.exit.service.EmployeeExitService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * REST Controller for employee exit/resignation management
 */
@Slf4j
@RestController
@RequestMapping("/api/exit")
@RequiredArgsConstructor
public class EmployeeExitController {
    
    private final EmployeeExitService exitService;
    
    // ===== Resignation Endpoints =====
    
    @PostMapping("/resign")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<ApiResponse<ResignationRequestDTO>> submitResignation(
            @RequestParam Long employeeId,
            @RequestParam LocalDate lastWorkingDay,
            @RequestParam String reason) {
        log.info("POST /api/exit/resign - Employee ID: {}", employeeId);
        
        ResignationRequestDTO resignation = exitService.submitResignation(employeeId, lastWorkingDay, reason);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(resignation, "Resignation submitted successfully", HttpStatus.CREATED.value()));
    }
    
    @PutMapping("/resign/{resignationId}/approve-manager")
    @PreAuthorize("hasAnyRole('MANAGER', 'HR')")
    public ResponseEntity<ApiResponse<ResignationRequestDTO>> approveByManager(
            @PathVariable Long resignationId,
            @RequestParam(required = false) String comments) {
        log.info("PUT /api/exit/resign/{}/approve-manager", resignationId);
        
        ResignationRequestDTO resignation = exitService.approveResignationByManager(resignationId, comments);
        return ResponseEntity.ok(ApiResponse.success(resignation, "Resignation approved by manager"));
    }
    
    @PutMapping("/resign/{resignationId}/approve-hr")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<ApiResponse<ResignationRequestDTO>> approveByHR(
            @PathVariable Long resignationId,
            @RequestParam(required = false) String comments) {
        log.info("PUT /api/exit/resign/{}/approve-hr", resignationId);
        
        ResignationRequestDTO resignation = exitService.approveResignationByHR(resignationId, comments);
        return ResponseEntity.ok(ApiResponse.success(resignation, "Resignation approved by HR. Exit checklist initialized."));
    }
    
    @PutMapping("/resign/{resignationId}/reject")
    @PreAuthorize("hasAnyRole('MANAGER', 'HR')")
    public ResponseEntity<ApiResponse<ResignationRequestDTO>> rejectResignation(
            @PathVariable Long resignationId,
            @RequestParam String reason) {
        log.info("PUT /api/exit/resign/{}/reject", resignationId);
        
        ResignationRequestDTO resignation = exitService.rejectResignation(resignationId, reason);
        return ResponseEntity.ok(ApiResponse.success(resignation, "Resignation rejected"));
    }
    
    @PutMapping("/resign/{resignationId}/cancel")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<ApiResponse<ResignationRequestDTO>> cancelResignation(
            @PathVariable Long resignationId) {
        log.info("PUT /api/exit/resign/{}/cancel", resignationId);
        
        ResignationRequestDTO resignation = exitService.cancelResignation(resignationId);
        return ResponseEntity.ok(ApiResponse.success(resignation, "Resignation cancelled"));
    }
    
    @GetMapping("/resign/{resignationId}")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('HR')")
    public ResponseEntity<ApiResponse<ResignationRequestDTO>> getResignation(
            @PathVariable Long resignationId) {
        log.info("GET /api/exit/resign/{}", resignationId);
        
        ResignationRequestDTO resignation = exitService.getResignationById(resignationId);
        return ResponseEntity.ok(ApiResponse.success(resignation, "Resignation retrieved successfully"));
    }
    
    @GetMapping("/resign/employee/{employeeId}")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('HR')")
    public ResponseEntity<ApiResponse<List<ResignationRequestDTO>>> getEmployeeResignations(
            @PathVariable Long employeeId) {
        log.info("GET /api/exit/resign/employee/{}", employeeId);
        
        List<ResignationRequestDTO> resignations = exitService.getResignationsByEmployeeId(employeeId);
        return ResponseEntity.ok(ApiResponse.success(resignations, "Resignations retrieved successfully"));
    }
    
    @GetMapping("/resign/status/{status}")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<ApiResponse<List<ResignationRequestDTO>>> getResignationsByStatus(
            @PathVariable String status) {
        log.info("GET /api/exit/resign/status/{}", status);
        
        List<ResignationRequestDTO> resignations = exitService.getResignationsByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(resignations, "Resignations retrieved successfully"));
    }
    
    @GetMapping("/resign/pending")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<ApiResponse<List<ResignationRequestDTO>>> getPendingResignations() {
        log.info("GET /api/exit/resign/pending");
        
        List<ResignationRequestDTO> resignations = exitService.getPendingResignations();
        return ResponseEntity.ok(ApiResponse.success(resignations, "Pending resignations retrieved successfully"));
    }
    
    // ===== Exit Checklist Endpoints =====
    
    @PostMapping("/checklist/{resignationId}")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<ApiResponse<ExitChecklistDTO>> initializeChecklist(
            @PathVariable Long resignationId) {
        log.info("POST /api/exit/checklist/{}", resignationId);
        
        ExitChecklistDTO checklist = exitService.initializeExitChecklist(resignationId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(checklist, "Exit checklist initialized", HttpStatus.CREATED.value()));
    }
    
    @PutMapping("/checklist/{resignationId}/mark-assets-returned")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<ApiResponse<ExitChecklistDTO>> markAssetsReturned(
            @PathVariable Long resignationId) {
        log.info("PUT /api/exit/checklist/{}/mark-assets-returned", resignationId);
        
        ExitChecklistDTO checklist = exitService.markAssetsReturned(resignationId);
        return ResponseEntity.ok(ApiResponse.success(checklist, "Assets marked as returned"));
    }
    
    @PutMapping("/checklist/{resignationId}/mark-leave-settled")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<ApiResponse<ExitChecklistDTO>> markLeaveSettled(
            @PathVariable Long resignationId) {
        log.info("PUT /api/exit/checklist/{}/mark-leave-settled", resignationId);
        
        ExitChecklistDTO checklist = exitService.markLeaveSettled(resignationId);
        return ResponseEntity.ok(ApiResponse.success(checklist, "Leave balance marked as settled"));
    }
    
    @PutMapping("/checklist/{resignationId}/mark-payroll-processed")
    @PreAuthorize("hasRole('HR') or hasRole('FINANCE')")
    public ResponseEntity<ApiResponse<ExitChecklistDTO>> markPayrollProcessed(
            @PathVariable Long resignationId) {
        log.info("PUT /api/exit/checklist/{}/mark-payroll-processed", resignationId);
        
        ExitChecklistDTO checklist = exitService.markFinalPayrollProcessed(resignationId);
        return ResponseEntity.ok(ApiResponse.success(checklist, "Final payroll marked as processed"));
    }
    
    @PutMapping("/checklist/{resignationId}/mark-account-deactivated")
    @PreAuthorize("hasRole('HR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ExitChecklistDTO>> markAccountDeactivated(
            @PathVariable Long resignationId) {
        log.info("PUT /api/exit/checklist/{}/mark-account-deactivated", resignationId);
        
        ExitChecklistDTO checklist = exitService.markUserAccountDeactivated(resignationId);
        return ResponseEntity.ok(ApiResponse.success(checklist, "User account marked as deactivated"));
    }
    
    @PutMapping("/checklist/{resignationId}/mark-data-archived")
    @PreAuthorize("hasRole('HR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ExitChecklistDTO>> markDataArchived(
            @PathVariable Long resignationId) {
        log.info("PUT /api/exit/checklist/{}/mark-data-archived", resignationId);
        
        ExitChecklistDTO checklist = exitService.markDataArchived(resignationId);
        return ResponseEntity.ok(ApiResponse.success(checklist, "Employee data marked as archived"));
    }
    
    @GetMapping("/checklist/{resignationId}")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<ApiResponse<ExitChecklistDTO>> getChecklist(
            @PathVariable Long resignationId) {
        log.info("GET /api/exit/checklist/{}", resignationId);
        
        ExitChecklistDTO checklist = exitService.getExitChecklist(resignationId);
        return ResponseEntity.ok(ApiResponse.success(checklist, "Exit checklist retrieved successfully"));
    }
    
    @PostMapping("/checklist/{resignationId}/complete")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<ApiResponse<Void>> completeExitProcess(
            @PathVariable Long resignationId) {
        log.info("POST /api/exit/checklist/{}/complete", resignationId);
        
        exitService.completeExitProcess(resignationId);
        return ResponseEntity.ok(ApiResponse.success(null, "Exit process completed successfully"));
    }
}
