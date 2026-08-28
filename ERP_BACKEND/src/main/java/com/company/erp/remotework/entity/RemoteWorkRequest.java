package com.company.erp.remotework.entity;

import com.company.erp.common.entity.AbstractAuditableEntity;
import com.company.erp.common.enums.RemoteWorkStatus;
import com.company.erp.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "remote_work_requests")
public class RemoteWorkRequest extends AbstractAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private LocalDate date;

    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RemoteWorkStatus status;

}
