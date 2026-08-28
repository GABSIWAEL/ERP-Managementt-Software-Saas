package com.company.erp.reporting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for leave summary report
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveSummaryDTO {
    
    private Long employeeId;
    private String employeeName;
    private String department;
    private int totalLeaveBalance;
    private int leaveUsed;
    private int leaveRemaining;
    private int pendingRequests;
    private int approvedRequests;
    private int rejectedRequests;
    private int month;
    private int year;
}
