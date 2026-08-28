package com.company.erp.common.entity;

import jakarta.persistence.MappedSuperclass;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Base entity class with audit trail support
 * Provides createdAt and updatedAt timestamps automatically
 * Extends AbstractAuditableEntity to include audit fields
 */
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@MappedSuperclass
public class AuditEntity extends AbstractAuditableEntity {
    // This class simply extends AbstractAuditableEntity
    // to provide a more explicit audit entity base class
    // for entities that need full audit trail tracking
}
