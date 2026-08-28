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

/**
 * DTO for updating existing employees.
 * Has less strict validation than CreateEmployeeDTO since some fields shouldn't change after creation.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateEmployeeDTO {

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    private String phone;

    private LocalDate dateOfBirth;

    private BigDecimal salary;

    private EmploymentType employmentType;

    private EmployeeStatus status;

    private Long departmentId;

    private String jobPosition;

    private String systemRole;
}
