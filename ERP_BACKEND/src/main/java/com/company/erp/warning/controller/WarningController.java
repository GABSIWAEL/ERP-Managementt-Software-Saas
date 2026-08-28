package com.company.erp.warning.controller;

import com.company.erp.common.dto.ApiResponse;
import com.company.erp.warning.dto.WarningDTO;
import com.company.erp.warning.service.WarningService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/warnings")
@RequiredArgsConstructor
public class WarningController {
    
    private final WarningService warningService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<WarningDTO>> createWarning(
            @Valid @RequestBody WarningDTO warningDTO) {
        log.info("Creating warning");
        WarningDTO createdWarning = warningService.createWarning(warningDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(createdWarning, "Warning created successfully", 201));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<WarningDTO>> updateWarning(
            @PathVariable Long id,
            @Valid @RequestBody WarningDTO warningDTO) {
        log.info("Updating warning with ID: {}", id);
        WarningDTO updatedWarning = warningService.updateWarning(id, warningDTO);
        return ResponseEntity.ok(ApiResponse.success(updatedWarning, "Warning updated successfully"));
    }
    
    @PostMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<WarningDTO>> resolveWarning(@PathVariable Long id) {
        log.info("Resolving warning with ID: {}", id);
        WarningDTO resolvedWarning = warningService.resolveWarning(id);
        return ResponseEntity.ok(ApiResponse.success(resolvedWarning, "Warning resolved"));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteWarning(@PathVariable Long id) {
        log.info("Deleting warning with ID: {}", id);
        warningService.deleteWarning(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Warning deleted successfully"));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'HR', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<WarningDTO>> getWarningById(@PathVariable Long id) {
        log.info("Fetching warning with ID: {}", id);
        WarningDTO warning = warningService.getWarningById(id);
        return ResponseEntity.ok(ApiResponse.success(warning, "Warning fetched successfully"));
    }
    
    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'HR', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<WarningDTO>>> getWarningsByEmployee(
            @PathVariable Long employeeId) {
        log.info("Fetching warnings for employee: {}", employeeId);
        List<WarningDTO> warnings = warningService.getWarningsByEmployeeId(employeeId);
        return ResponseEntity.ok(ApiResponse.success(warnings, "Warnings fetched successfully"));
    }
    
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<WarningDTO>>> getWarningsByStatus(
            @PathVariable String status) {
        log.info("Fetching warnings with status: {}", status);
        List<WarningDTO> warnings = warningService.getWarningsByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(warnings, "Warnings fetched successfully"));
    }
    
    @GetMapping("/severity/{severity}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<WarningDTO>>> getWarningsBySeverity(
            @PathVariable String severity) {
        log.info("Fetching warnings with severity: {}", severity);
        List<WarningDTO> warnings = warningService.getWarningsBySeverity(severity);
        return ResponseEntity.ok(ApiResponse.success(warnings, "Warnings fetched successfully"));
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'HR')")
    public ResponseEntity<ApiResponse<List<WarningDTO>>> getAllWarnings() {
        log.info("Fetching all warnings");
        List<WarningDTO> warnings = warningService.getAllWarnings();
        return ResponseEntity.ok(ApiResponse.success(warnings, "Warnings fetched successfully"));
    }
    
    @PatchMapping("/{id}/escalate")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<ApiResponse<WarningDTO>> escalateWarning(@PathVariable Long id) {
        log.info("Escalating warning with ID: {}", id);
        WarningDTO escalatedWarning = warningService.escalateWarning(id);
        return ResponseEntity.ok(ApiResponse.success(escalatedWarning, "Warning escalated successfully"));
    }
    
    @PatchMapping("/{id}/schedule-reunion")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<ApiResponse<WarningDTO>> scheduleReunion(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        log.info("Scheduling reunion for warning with ID: {}", id);
        String reunionDateStr = request.get("reunionScheduledAt");
        if (reunionDateStr == null || reunionDateStr.isBlank()) {
            throw new IllegalArgumentException("Reunion date is required");
        }

        LocalDateTime reunionScheduledAt;
        try {
            reunionScheduledAt = LocalDateTime.parse(reunionDateStr);
        } catch (DateTimeParseException ex) {
            reunionScheduledAt = OffsetDateTime.parse(reunionDateStr).toLocalDateTime();
        }

        WarningDTO updatedWarning = warningService.scheduleReunion(id, reunionScheduledAt);
        return ResponseEntity.ok(ApiResponse.success(updatedWarning, "Reunion scheduled successfully"));
    }
    
    @PatchMapping("/{id}/submit-report")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<ApiResponse<WarningDTO>> submitReunionReport(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        log.info("Submitting reunion report for warning with ID: {}", id);
        String reunionReport = request.get("reunionReport");
        WarningDTO updatedWarning = warningService.submitReunionReport(id, reunionReport);
        return ResponseEntity.ok(ApiResponse.success(updatedWarning, "Reunion report submitted successfully"));
    }
}
