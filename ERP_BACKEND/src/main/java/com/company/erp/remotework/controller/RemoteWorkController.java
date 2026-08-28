package com.company.erp.remotework.controller;

import com.company.erp.common.dto.ApiResponse;
import com.company.erp.remotework.dto.RemoteWorkRequestDTO;
import com.company.erp.remotework.service.RemoteWorkService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/remote-work")
@RequiredArgsConstructor
public class RemoteWorkController {
    
    private final RemoteWorkService remoteWorkService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    public ResponseEntity<ApiResponse<RemoteWorkRequestDTO>> createRemoteWorkRequest(
            @Valid @RequestBody RemoteWorkRequestDTO remoteWorkRequestDTO) {
        log.info("Creating remote work request");
        RemoteWorkRequestDTO createdRequest = remoteWorkService.createRemoteWorkRequest(remoteWorkRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(createdRequest, "Remote work request created successfully", 201));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    public ResponseEntity<ApiResponse<RemoteWorkRequestDTO>> updateRemoteWorkRequest(
            @PathVariable Long id,
            @Valid @RequestBody RemoteWorkRequestDTO remoteWorkRequestDTO) {
        log.info("Updating remote work request with ID: {}", id);
        RemoteWorkRequestDTO updatedRequest = remoteWorkService.updateRemoteWorkRequest(id, remoteWorkRequestDTO);
        return ResponseEntity.ok(ApiResponse.success(updatedRequest, "Remote work request updated successfully"));
    }
    
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<RemoteWorkRequestDTO>> approveRemoteWorkRequest(
            @PathVariable Long id,
            @RequestParam(required = false) String comment) {
        log.info("Approving remote work request with ID: {}", id);
        RemoteWorkRequestDTO approvedRequest = remoteWorkService.approveRemoteWorkRequest(id, comment);
        return ResponseEntity.ok(ApiResponse.success(approvedRequest, "Remote work request approved"));
    }
    
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<RemoteWorkRequestDTO>> rejectRemoteWorkRequest(
            @PathVariable Long id,
            @RequestParam(required = false) String comment) {
        log.info("Rejecting remote work request with ID: {}", id);
        RemoteWorkRequestDTO rejectedRequest = remoteWorkService.rejectRemoteWorkRequest(id, comment);
        return ResponseEntity.ok(ApiResponse.success(rejectedRequest, "Remote work request rejected"));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> cancelRemoteWorkRequest(@PathVariable Long id) {
        log.info("Cancelling remote work request with ID: {}", id);
        remoteWorkService.cancelRemoteWorkRequest(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Remote work request cancelled"));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'HR')")
    public ResponseEntity<ApiResponse<List<RemoteWorkRequestDTO>>> getAllRemoteWorkRequests() {
        log.info("Fetching all remote work requests");
        List<RemoteWorkRequestDTO> requests = remoteWorkService.getAllRemoteWorkRequests();
        return ResponseEntity.ok(ApiResponse.success(requests, "All remote work requests fetched successfully"));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<RemoteWorkRequestDTO>> getRemoteWorkRequestById(@PathVariable Long id) {
        log.info("Fetching remote work request with ID: {}", id);
        RemoteWorkRequestDTO request = remoteWorkService.getRemoteWorkRequestById(id);
        return ResponseEntity.ok(ApiResponse.success(request, "Remote work request fetched successfully"));
    }
    
    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<RemoteWorkRequestDTO>>> getRemoteWorkRequestsByEmployee(
            @PathVariable Long employeeId) {
        log.info("Fetching remote work requests for employee: {}", employeeId);
        List<RemoteWorkRequestDTO> requests = remoteWorkService.getRemoteWorkRequestsByEmployeeId(employeeId);
        return ResponseEntity.ok(ApiResponse.success(requests, "Remote work requests fetched"));
    }
    
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<RemoteWorkRequestDTO>>> getRemoteWorkRequestsByStatus(
            @PathVariable String status) {
        log.info("Fetching remote work requests with status: {}", status);
        List<RemoteWorkRequestDTO> requests = remoteWorkService.getRemoteWorkRequestsByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(requests, "Remote work requests fetched"));
    }
    
    @GetMapping("/range")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<RemoteWorkRequestDTO>>> getRemoteWorkRequestsByDateRange(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        log.info("Fetching remote work requests between {} and {}", startDate, endDate);
        List<RemoteWorkRequestDTO> requests = remoteWorkService.getRemoteWorkRequestsByDateRange(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(requests, "Remote work requests fetched"));
    }
    
    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'HR')")
    public ResponseEntity<ApiResponse<List<RemoteWorkRequestDTO>>> getPendingRemoteWorkRequests() {
        log.info("Fetching pending remote work requests");
        List<RemoteWorkRequestDTO> requests = remoteWorkService.getPendingRemoteWorkRequests();
        return ResponseEntity.ok(ApiResponse.success(requests, "Pending remote work requests fetched"));
    }
}
