package com.company.erp.leave.dto;

import com.company.erp.common.enums.LeaveStatus;
import com.company.erp.common.enums.LeaveType;
import com.company.erp.employee.dto.EmployeeDTO;
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
public class LeaveRequestDTO {

    private Long id;

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    private EmployeeDTO employee;

    private String employeeName;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    private Integer totalDays;

    @NotNull(message = "Leave type is required")
    private LeaveType leaveType;

    @NotNull(message = "Status is required")
    private LeaveStatus status;

    private String managerComment;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
