package com.company.erp.exit.entity;

import com.company.erp.common.entity.AbstractAuditableEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity representing the exit checklist for an employee resignation
 * Tracks completion status of all required exit activities
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "exit_checklists")
public class ExitChecklist extends AbstractAuditableEntity {
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resignation_id", nullable = false)
    private ResignationRequest resignation;
    
    @Column(nullable = false)
    private Boolean assetsReturned = false;
    
    @Column(nullable = false)
    private Boolean leaveSettled = false;
    
    @Column(nullable = false)
    private Boolean finalPayrollProcessed = false;
    
    @Column(nullable = false)
    private Boolean userAccountDeactivated = false;
    
    @Column(nullable = false)
    private Boolean dataArchived = false;
    
    private LocalDateTime completionDate;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    /**
     * Check if all exit items are completed
     */
    public boolean isFullyCompleted() {
        return assetsReturned && leaveSettled && finalPayrollProcessed 
               && userAccountDeactivated && dataArchived;
    }
}
