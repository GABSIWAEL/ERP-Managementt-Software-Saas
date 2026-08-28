package com.company.erp.asset.dto;

import com.company.erp.common.enums.AssetStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetDTO {

    private Long id;

    @NotBlank(message = "Asset name is required")
    private String name;

    private String assetCode;

    private String serialNumber;

    @NotBlank(message = "Asset category is required")
    private String category;

    private String type;

    private Double value;

    private Date purchaseDate;

    private Long assignedToId;

    private String assignedToName;

    private AssetStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
