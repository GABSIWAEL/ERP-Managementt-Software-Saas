package com.company.erp.employee.entity;

import com.company.erp.common.entity.AbstractAuditableEntity;
import com.company.erp.common.enums.EmployeeStatus;
import com.company.erp.common.enums.EmploymentType;
import com.company.erp.department.entity.Department;
import com.company.erp.security.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "employees")
public class Employee extends AbstractAuditableEntity {

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    @Column(nullable = false)
    private LocalDate hireDate;

    private LocalDate dateOfBirth;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal salary;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmploymentType employmentType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmployeeStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(length = 100)
    private String jobPosition;

    @Builder.Default
    @Column(nullable = false)
    private Integer annualLeaveBalance = 20;

    @Builder.Default
    @Column(nullable = false)
    private Integer sickLeaveBalance = 8;

    @Builder.Default
    @Column(nullable = false)
    private Integer casualLeaveBalance = 5;

    @Builder.Default
    @Column(nullable = false)
    private Integer maternityLeaveBalance = 180;

    @Builder.Default
    @Column(nullable = false)
    private Integer paternityLeaveBalance = 10;

}
