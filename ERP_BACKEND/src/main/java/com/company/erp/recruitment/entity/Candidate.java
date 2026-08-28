package com.company.erp.recruitment.entity;

import com.company.erp.common.entity.AbstractAuditableEntity;
import com.company.erp.common.enums.CandidateStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "candidates")
public class Candidate extends AbstractAuditableEntity {

    @Column(nullable = false, length = 500)
    private String candidateName;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false, length = 500)
    private String position;

    @Column(nullable = true)
    private Long jobOfferId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CandidateStatus status;

    @Column(columnDefinition = "TEXT")
    private String notes;

}
