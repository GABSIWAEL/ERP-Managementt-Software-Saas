package com.company.erp.common.enums;

/**
 * Enumeration for resignation statuses during the exit process
 */
public enum ResignationStatus {
    SUBMITTED,           // Initial submission by employee
    MANAGER_APPROVED,    // Approved by direct manager
    HR_APPROVED,         // Approved by HR department
    REJECTED,            // Rejection by any party
    COMPLETED,           // Exit process fully completed
    CANCELLED            // Resignation cancelled by employee
}
