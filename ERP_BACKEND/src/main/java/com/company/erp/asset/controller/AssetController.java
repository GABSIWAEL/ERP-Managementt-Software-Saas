package com.company.erp.asset.controller;

import com.company.erp.asset.dto.AssetDTO;
import com.company.erp.asset.service.AssetService;
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
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {
    
    private final AssetService assetService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<AssetDTO>> createAsset(
            @Valid @RequestBody AssetDTO assetDTO) {
        log.info("Creating asset");
        AssetDTO createdAsset = assetService.createAsset(assetDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(createdAsset, "Asset created successfully", 201));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<AssetDTO>> updateAsset(
            @PathVariable Long id,
            @Valid @RequestBody AssetDTO assetDTO) {
        log.info("Updating asset with ID: {}", id);
        AssetDTO updatedAsset = assetService.updateAsset(id, assetDTO);
        return ResponseEntity.ok(ApiResponse.success(updatedAsset, "Asset updated successfully"));
    }
    
    @PostMapping("/{id}/assign/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<AssetDTO>> assignAsset(
            @PathVariable Long id,
            @PathVariable Long employeeId) {
        log.info("Assigning asset: {} to employee: {}", id, employeeId);
        AssetDTO assignedAsset = assetService.assignAsset(id, employeeId);
        return ResponseEntity.ok(ApiResponse.success(assignedAsset, "Asset assigned successfully"));
    }
    
    @PostMapping("/{id}/return")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<AssetDTO>> returnAsset(@PathVariable Long id) {
        log.info("Returning asset with ID: {}", id);
        AssetDTO returnedAsset = assetService.returnAsset(id);
        return ResponseEntity.ok(ApiResponse.success(returnedAsset, "Asset returned successfully"));
    }
    
    @PostMapping("/{id}/mark-damaged")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<AssetDTO>> markAssetAsDamaged(
            @PathVariable Long id,
            @RequestParam(defaultValue = "") String reason) {
        log.info("Marking asset ID: {} as damaged", id);
        AssetDTO damagedAsset = assetService.markAssetAsDamaged(id, reason);
        return ResponseEntity.ok(ApiResponse.success(damagedAsset, "Asset marked as damaged"));
    }
    
    @PostMapping("/{id}/mark-sold")
    @PreAuthorize("hasRole('ACCOUNTANT')")
    public ResponseEntity<ApiResponse<AssetDTO>> markAssetAsSold(
            @PathVariable Long id,
            @RequestParam(defaultValue = "") String reason) {
        log.info("Marking asset ID: {} as sold", id);
        AssetDTO soldAsset = assetService.markAssetAsSold(id, reason);
        return ResponseEntity.ok(ApiResponse.success(soldAsset, "Asset marked as sold"));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<Void>> deleteAsset(@PathVariable Long id) {
        log.info("Deleting asset with ID: {}", id);
        assetService.deleteAsset(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Asset deleted successfully"));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'ACCOUNTANT', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<AssetDTO>> getAssetById(@PathVariable Long id) {
        log.info("Fetching asset with ID: {}", id);
        AssetDTO asset = assetService.getAssetById(id);
        return ResponseEntity.ok(ApiResponse.success(asset, "Asset fetched successfully"));
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<List<AssetDTO>>> getAllAssets() {
        log.info("Fetching all assets");
        List<AssetDTO> assets = assetService.getAllAssets();
        return ResponseEntity.ok(ApiResponse.success(assets, "Assets fetched successfully"));
    }
    
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<List<AssetDTO>>> getAssetsByStatus(
            @PathVariable String status) {
        log.info("Fetching assets with status: {}", status);
        List<AssetDTO> assets = assetService.getAssetsByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(assets, "Assets fetched successfully"));
    }
    
    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'ACCOUNTANT', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<AssetDTO>>> getAssetsByEmployee(
            @PathVariable Long employeeId) {
        log.info("Fetching assets for employee: {}", employeeId);
        List<AssetDTO> assets = assetService.getAssetsByEmployeeId(employeeId);
        return ResponseEntity.ok(ApiResponse.success(assets, "Assets fetched successfully"));
    }
}
