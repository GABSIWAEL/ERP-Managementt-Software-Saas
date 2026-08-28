package com.company.erp.reporting.service;

import com.company.erp.reporting.dto.*;

import java.util.List;

/**
 * Service for generating various ERP reports and analytics
 */
public interface ReportingService {
    
    /**
     * Get payroll summary for a specific month/year
     */
    List<PayrollSummaryDTO> getPayrollSummary(int month, int year);
    
    /**
     * Get payroll summary for a specific employee
     */
    PayrollSummaryDTO getEmployeePayrollSummary(Long employeeId, int month, int year);
    
    /**
     * Get payroll summary for a specific department
     */
    List<PayrollSummaryDTO> getDepartmentPayrollSummary(Long departmentId, int month, int year);
    
    /**
     * Get attendance summary for a specific month/year
     */
    List<AttendanceSummaryDTO> getAttendanceSummary(int month, int year);
    
    /**
     * Get attendance summary for a specific employee
     */
    AttendanceSummaryDTO getEmployeeAttendanceSummary(Long employeeId, int month, int year);
    
    /**
     * Get attendance summary for a specific department
     */
    List<AttendanceSummaryDTO> getDepartmentAttendanceSummary(Long departmentId, int month, int year);
    
    /**
     * Get leave summary for a specific month/year
     */
    List<LeaveSummaryDTO> getLeaveSummary(int month, int year);
    
    /**
     * Get leave summary for a specific employee
     */
    LeaveSummaryDTO getEmployeeLeaveSummary(Long employeeId, int month, int year);
    
    /**
     * Get leave summary for a specific department
     */
    List<LeaveSummaryDTO> getDepartmentLeaveSummary(Long departmentId, int month, int year);
    
    /**
     * Get department summary for all departments
     */
    List<DepartmentSummaryDTO> getDepartmentSummary();
    
    /**
     * Get department summary for a specific department
     */
    DepartmentSummaryDTO getDepartmentSummary(Long departmentId);
    
    /**
     * Get performance summary for a specific period
     */
    List<PerformanceSummaryDTO> getPerformanceSummary(int month, int year);
    
    /**
     * Get performance summary for a specific employee
     */
    PerformanceSummaryDTO getEmployeePerformanceSummary(Long employeeId, int month, int year);
    
    /**
     * Get performance summary for a specific department
     */
    List<PerformanceSummaryDTO> getDepartmentPerformanceSummary(Long departmentId, int month, int year);
}
