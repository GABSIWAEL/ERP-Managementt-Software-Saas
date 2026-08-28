package com.company.erp.attendance.dto;

import com.company.erp.common.enums.AttendanceStatus;
import com.company.erp.common.enums.WorkMode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceDTO {

    private Long id;

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    private String employeeName;

    @NotNull(message = "Date is required")
    private LocalDate date;

    private LocalTime checkInTime;

    private LocalTime checkOutTime;

    private WorkMode workMode;

    @NotNull(message = "Status is required")
    private AttendanceStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
