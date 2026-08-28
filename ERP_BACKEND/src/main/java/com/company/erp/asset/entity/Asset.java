package com.company.erp.asset.entity;

import com.company.erp.common.entity.AbstractAuditableEntity;
import com.company.erp.common.enums.AssetStatus;
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
@Table(name = "assets")
public class Asset extends AbstractAuditableEntity {

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String assetCode;

    @Column(unique = true)
    private String serialNumber;

    @Column(nullable = false)
    private String category;

    private String type;

    private Double value;

    @Temporal(TemporalType.DATE)
    private java.util.Date purchaseDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id")
    private Employee assignedTo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssetStatus status;

}
