package com.company.erp.asset.entity;

import com.company.erp.common.entity.AbstractAuditableEntity;
import com.company.erp.common.enums.AssetRequestStatus;
import com.company.erp.common.enums.AssetRequestType;
import com.company.erp.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "asset_requests")
public class AssetRequest extends AbstractAuditableEntity {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssetRequestType requestType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssetRequestStatus status;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(columnDefinition = "TEXT")
    private String details;

    private String assetName;
    private String assetCode;
    private String category;
    private String type;
    private Double estimatedValue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by_id", nullable = false)
    private Employee requestedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_for_employee_id")
    private Employee requestedForEmployee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id")
    private Asset asset;

    @Column(columnDefinition = "TEXT")
    private String responseComment;
}
