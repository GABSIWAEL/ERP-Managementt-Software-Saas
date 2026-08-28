package com.company.erp.exit.entity;

import com.company.erp.common.entity.AbstractAuditableEntity;
import com.company.erp.common.enums.ResignationStatus;
import com.company.erp.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity representing an employee's resignation request
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "resignation_requests")
public class ResignationRequest extends AbstractAuditableEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;
    
    @Column(nullable = false)
    private LocalDate submissionDate;
    
    @Column(nullable = false)
    private LocalDate lastWorkingDay;
    
    @Column(columnDefinition = "TEXT")
    private String reason;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResignationStatus status;
    
    private LocalDateTime managerApprovalDate;
    
    private LocalDateTime hrApprovalDate;
    
    @Column(columnDefinition = "TEXT")
    private String managerComments;
    
    @Column(columnDefinition = "TEXT")
    private String hrComments;
    
    @OneToOne(mappedBy = "resignation", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private ExitChecklist exitChecklist;
}
