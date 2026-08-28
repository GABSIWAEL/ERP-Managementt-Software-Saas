package com.company.erp.asset.controller;

import com.company.erp.asset.dto.AssetRequestDTO;
import com.company.erp.asset.service.AssetRequestService;
import com.company.erp.common.dto.ApiResponse;
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
@RequestMapping("/api/asset-requests")
@RequiredArgsConstructor
public class AssetRequestController {

    private final AssetRequestService assetRequestService;

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<AssetRequestDTO>> createAssetRequest(
            @Valid @RequestBody AssetRequestDTO assetRequestDTO) {
        log.info("Creating asset request");
        AssetRequestDTO createdRequest = assetRequestService.createAssetRequest(assetRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(createdRequest, "Asset request created successfully", HttpStatus.CREATED.value()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ACCOUNTANT', 'ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<AssetRequestDTO>>> getAssetRequests() {
        log.info("Fetching asset requests");
        List<AssetRequestDTO> requests = assetRequestService.getAllAssetRequests();
        return ResponseEntity.ok(ApiResponse.success(requests, "Asset requests fetched successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ACCOUNTANT', 'ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<AssetRequestDTO>> getAssetRequestById(@PathVariable Long id) {
        log.info("Fetching asset request with ID: {}", id);
        AssetRequestDTO request = assetRequestService.getAssetRequestById(id);
        return ResponseEntity.ok(ApiResponse.success(request, "Asset request fetched successfully"));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<AssetRequestDTO>>> getAssetRequestsByStatus(@PathVariable String status) {
        log.info("Fetching asset requests with status: {}", status);
        List<AssetRequestDTO> requests = assetRequestService.getAssetRequestsByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(requests, "Asset requests fetched successfully"));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'ADMIN')")
    public ResponseEntity<ApiResponse<AssetRequestDTO>> approveAssetRequest(
            @PathVariable Long id,
            @RequestParam(required = false) String comment) {
        log.info("Approving asset request with ID: {}", id);
        AssetRequestDTO request = assetRequestService.approveAssetRequest(id, comment);
        return ResponseEntity.ok(ApiResponse.success(request, "Asset request approved successfully"));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'ADMIN')")
    public ResponseEntity<ApiResponse<AssetRequestDTO>> rejectAssetRequest(
            @PathVariable Long id,
            @RequestParam String reason) {
        log.info("Rejecting asset request with ID: {}", id);
        AssetRequestDTO request = assetRequestService.rejectAssetRequest(id, reason);
        return ResponseEntity.ok(ApiResponse.success(request, "Asset request rejected successfully"));
    }
}
