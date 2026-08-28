package com.company.erp.asset.repository;

import com.company.erp.asset.entity.Asset;
import com.company.erp.common.enums.AssetStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {

    List<Asset> findByAssignedToId(Long employeeId);

    List<Asset> findByStatus(AssetStatus status);

    boolean existsBySerialNumber(String serialNumber);

    @Query("SELECT COUNT(a) FROM Asset a WHERE a.assignedTo.id = :employeeId AND a.status != 'RETURNED'")
    long countByAssignedToIdAndStatusNot(@Param("employeeId") Long employeeId);

    List<Asset> findByAssignedToIdAndStatus(Long employeeId, AssetStatus status);

}
