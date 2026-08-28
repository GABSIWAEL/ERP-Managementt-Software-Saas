package com.company.erp.remotework.dto;

import com.company.erp.common.enums.RemoteWorkStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RemoteWorkRequestDTO {

    private Long id;

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    private String employeeName;

    @NotNull(message = "Date is required")
    private LocalDate date;

    private String reason;

    @NotNull(message = "Status is required")
    private RemoteWorkStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
