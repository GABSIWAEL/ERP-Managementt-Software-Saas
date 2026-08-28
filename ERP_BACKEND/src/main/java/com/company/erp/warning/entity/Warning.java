package com.company.erp.warning.entity;

import com.company.erp.common.entity.AbstractAuditableEntity;
import com.company.erp.common.enums.WarningSeverity;
import com.company.erp.common.enums.WarningStatus;
import com.company.erp.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "warnings")
public class Warning extends AbstractAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private String reason;

    @Column(length = 1000)
    private String comments;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WarningSeverity severity;

    @Column(nullable = false)
    private LocalDate dateIssued;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WarningStatus status;

    @Column(length = 1000)
    private String hrComment;

    @Column(name = "reunion_scheduled_at")
    private LocalDateTime reunionScheduledAt;

    @Column(name = "reunion_report", length = 2000)
    private String reunionReport;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

}
