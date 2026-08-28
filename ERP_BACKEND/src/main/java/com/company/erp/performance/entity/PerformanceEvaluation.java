package com.company.erp.performance.entity;

import com.company.erp.common.entity.AbstractAuditableEntity;
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
@Table(name = "performance_evaluations")
public class PerformanceEvaluation extends AbstractAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evaluator_id", nullable = false)
    private Employee evaluator;

    @Column(nullable = false)
    private Integer technicalScore;

    @Column(nullable = false)
    private Integer teamworkScore;

    @Column(nullable = false)
    private Integer productivityScore;

    private String comments;

    @Column(nullable = false)
    private LocalDateTime evaluationDate;

}
