package com.company.erp.employee.dto;

import com.company.erp.common.enums.EmployeeStatus;
import com.company.erp.common.enums.EmploymentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeDTO {

    private Long id;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    private String phone;

    @NotNull(message = "Hire date is required")
    private LocalDate hireDate;

    private LocalDate dateOfBirth;

    @NotNull(message = "Salary is required")
    private BigDecimal salary;

    @NotNull(message = "Employment type is required")
    private EmploymentType employmentType;

    @NotNull(message = "Status is required")
    private EmployeeStatus status;

    private Long departmentId;

    private String jobPosition;

    private String systemRole;

    private String departmentName;

    private Long userId;

    private Integer annualLeaveBalance;

    private Integer sickLeaveBalance;

    private Integer casualLeaveBalance;

    private Integer maternityLeaveBalance;

    private Integer paternityLeaveBalance;

}
