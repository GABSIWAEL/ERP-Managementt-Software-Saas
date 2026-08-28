package com.company.erp.asset.dto;

import com.company.erp.common.enums.AssetRequestStatus;
import com.company.erp.common.enums.AssetRequestType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetRequestDTO {

    private Long id;

    @NotNull(message = "Request type is required")
    private AssetRequestType requestType;

    private AssetRequestStatus status;

    @NotBlank(message = "Reason is required")
    private String reason;

    private String details;
    private String assetName;
    private String assetCode;
    private String category;
    private String type;
    private Double estimatedValue;

    private Long assetId;
    private Long requestedById;
    private String requestedByName;
    private Long requestedForEmployeeId;
    private String requestedForEmployeeName;

    private String responseComment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
