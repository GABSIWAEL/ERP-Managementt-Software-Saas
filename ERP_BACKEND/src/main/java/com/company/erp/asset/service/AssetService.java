package com.company.erp.asset.service;

import com.company.erp.asset.dto.AssetDTO;
import java.util.List;

public interface AssetService {
    
    AssetDTO createAsset(AssetDTO assetDTO);
    
    AssetDTO updateAsset(Long id, AssetDTO assetDTO);
    
    AssetDTO assignAsset(Long id, Long employeeId);
    
    AssetDTO returnAsset(Long id);
    
    void deleteAsset(Long id);
    
    AssetDTO getAssetById(Long id);
    
    List<AssetDTO> getAllAssets();
    
    List<AssetDTO> getAssetsByStatus(String status);
    
    List<AssetDTO> getAssetsByEmployeeId(Long employeeId);
    
    AssetDTO markAssetAsDamaged(Long id, String reason);
    
    AssetDTO markAssetAsSold(Long id, String reason);
}
