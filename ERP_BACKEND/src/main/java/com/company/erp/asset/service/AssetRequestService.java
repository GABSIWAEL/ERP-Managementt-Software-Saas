package com.company.erp.asset.service;

import com.company.erp.asset.dto.AssetRequestDTO;

import java.util.List;

public interface AssetRequestService {

    AssetRequestDTO createAssetRequest(AssetRequestDTO assetRequestDTO);

    List<AssetRequestDTO> getAllAssetRequests();

    AssetRequestDTO getAssetRequestById(Long id);

    List<AssetRequestDTO> getAssetRequestsByStatus(String status);

    AssetRequestDTO approveAssetRequest(Long id, String comment);

    AssetRequestDTO rejectAssetRequest(Long id, String reason);
}
