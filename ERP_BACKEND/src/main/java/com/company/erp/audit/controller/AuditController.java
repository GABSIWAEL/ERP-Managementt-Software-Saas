package com.company.erp.audit.controller;

import com.company.erp.audit.dto.AuditLogDTO;
import com.company.erp.audit.service.AuditService;
import com.company.erp.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@Slf4j
@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditController {
    
    private final AuditService auditService;
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<ApiResponse<AuditLogDTO>> getAuditLogById(@PathVariable Long id) {
        log.info("Fetching audit log with ID: {}", id);
        AuditLogDTO auditLog = auditService.getAuditLogById(id);
        return ResponseEntity.ok(ApiResponse.success(auditLog, "Audit log fetched successfully"));
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<AuditLogDTO>>> getAllAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {
        log.info("Fetching all audit logs - page: {}, size: {}", page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<AuditLogDTO> auditLogs = auditService.getAllAuditLogsPaginated(pageable);
        return ResponseEntity.ok(ApiResponse.success(auditLogs, "Audit logs fetched successfully"));
    }
    
    @GetMapping("/action")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<AuditLogDTO>>> getAuditLogsByAction(
            @RequestParam String action,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {
        log.info("Fetching audit logs by action: {} - page: {}, size: {}", action, page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<AuditLogDTO> auditLogs = auditService.getAuditLogsByActionPaginated(action, pageable);
        return ResponseEntity.ok(ApiResponse.success(auditLogs, "Audit logs fetched successfully"));
    }
    
    @GetMapping("/user/{username}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<AuditLogDTO>>> getAuditLogsByPerformedBy(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {
        log.info("Fetching audit logs performed by: {} - page: {}, size: {}", username, page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<AuditLogDTO> auditLogs = auditService.getAuditLogsByPerformedByPaginated(username, pageable);
        return ResponseEntity.ok(ApiResponse.success(auditLogs, "Audit logs fetched successfully"));
    }
    
    @GetMapping("/entity/{entityName}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<AuditLogDTO>>> getAuditLogsByEntity(
            @PathVariable String entityName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {
        log.info("Fetching audit logs for entity: {} - page: {}, size: {}", entityName, page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<AuditLogDTO> auditLogs = auditService.getAuditLogsByEntityPaginated(entityName, pageable);
        return ResponseEntity.ok(ApiResponse.success(auditLogs, "Audit logs fetched successfully"));
    }
    
    @GetMapping("/range")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<AuditLogDTO>>> getAuditLogsByDateRange(
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {
        log.info("Fetching audit logs between {} and {} - page: {}, size: {}", startDate, endDate, page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<AuditLogDTO> auditLogs = auditService.getAuditLogsByDateRangePaginated(startDate, endDate, pageable);
        return ResponseEntity.ok(ApiResponse.success(auditLogs, "Audit logs fetched successfully"));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAuditLog(@PathVariable Long id) {
        log.info("Deleting audit log with ID: {}", id);
        auditService.deleteAuditLog(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Audit log deleted successfully"));
    }
}
