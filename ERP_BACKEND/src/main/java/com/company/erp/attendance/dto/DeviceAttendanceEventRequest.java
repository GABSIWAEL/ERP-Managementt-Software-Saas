package com.company.erp.attendance.dto;

import com.company.erp.common.enums.AttendanceEventType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceAttendanceEventRequest {

    @NotBlank(message = "Company ID is required")
    private String companyId;

    @NotBlank(message = "Employee ID is required")
    private String employeeId;

    @NotBlank(message = "Device ID is required")
    private String deviceId;

    @NotBlank(message = "Device type is required")
    private String deviceType;

    @NotNull(message = "Event type is required")
    private AttendanceEventType event;

    @NotNull(message = "Timestamp is required")
    private OffsetDateTime timestamp;

    private String deviceSecret;
}
