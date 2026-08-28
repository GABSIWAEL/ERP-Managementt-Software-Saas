package com.company.erp.asset.repository;

import com.company.erp.asset.entity.AssetRequest;
import com.company.erp.common.enums.AssetRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetRequestRepository extends JpaRepository<AssetRequest, Long> {

    List<AssetRequest> findByRequestedById(Long requestedById);

    List<AssetRequest> findByRequestedByIdAndStatus(Long requestedById, AssetRequestStatus status);

    List<AssetRequest> findByStatus(AssetRequestStatus status);
}
