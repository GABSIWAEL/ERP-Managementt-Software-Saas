package com.company.erp.reporting.controller;

import com.company.erp.reporting.dto.*;
import com.company.erp.reporting.service.ReportingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.List;

/**
 * REST Controller for reporting endpoints
 * Provides access to various ERP reports and analytics
 */
@Slf4j
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportingController {
    
    private final ReportingService reportingService;
    
    // ============ Payroll Reports ============
    
    /**
     * GET /api/reports/payroll?month=1&year=2024
     * Get payroll summary for all employees for a specific month
     */
    @GetMapping("/payroll")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'FINANCE', 'ACCOUNTANT')")
    public ResponseEntity<List<PayrollSummaryDTO>> getPayrollSummary(
            @RequestParam(required = false, defaultValue = "1") @Min(1) @Max(12) int month,
            @RequestParam(required = false, defaultValue = "2024") int year) {
        log.info("Fetching payroll summary for month: {}, year: {}", month, year);
        List<PayrollSummaryDTO> payrollSummary = reportingService.getPayrollSummary(month, year);
        return ResponseEntity.ok(payrollSummary);
    }

    /**
     * Alias endpoint for /api/reports/payroll
     * GET /api/reports/payroll/summary?month=1&year=2024
     */
    @GetMapping("/payroll/summary")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'FINANCE', 'ACCOUNTANT')")
    public ResponseEntity<List<PayrollSummaryDTO>> getPayrollSummarySummary(
            @RequestParam(required = false, defaultValue = "1") @Min(1) @Max(12) int month,
            @RequestParam(required = false, defaultValue = "2024") int year) {
        log.info("Fetching payroll summary for month: {}, year: {} (via /summary endpoint)", month, year);
        List<PayrollSummaryDTO> payrollSummary = reportingService.getPayrollSummary(month, year);
        return ResponseEntity.ok(payrollSummary);
    }
    
    /**
     * GET /api/reports/payroll/employee/{employeeId}?month=1&year=2024
     * Get payroll summary for a specific employee
     */
    @GetMapping("/payroll/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'FINANCE') or @employeeService.getEmployeeById(#employeeId).getUser().getUsername() == authentication.principal.username")
    public ResponseEntity<PayrollSummaryDTO> getEmployeePayrollSummary(
            @PathVariable Long employeeId,
            @RequestParam(required = false, defaultValue = "1") @Min(1) @Max(12) int month,
            @RequestParam(required = false, defaultValue = "2024") int year) {
        log.info("Fetching payroll summary for employee: {}, month: {}, year: {}", employeeId, month, year);
        PayrollSummaryDTO payrollSummary = reportingService.getEmployeePayrollSummary(employeeId, month, year);
        return ResponseEntity.ok(payrollSummary);
    }
    
    /**
     * GET /api/reports/payroll/department/{departmentId}?month=1&year=2024
     * Get payroll summary for a specific department
     */
    @GetMapping("/payroll/department/{departmentId}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'FINANCE')")
    public ResponseEntity<List<PayrollSummaryDTO>> getDepartmentPayrollSummary(
            @PathVariable Long departmentId,
            @RequestParam(required = false, defaultValue = "1") @Min(1) @Max(12) int month,
            @RequestParam(required = false, defaultValue = "2024") int year) {
        log.info("Fetching payroll summary for department: {}, month: {}, year: {}", departmentId, month, year);
        List<PayrollSummaryDTO> payrollSummary = reportingService.getDepartmentPayrollSummary(departmentId, month, year);
        return ResponseEntity.ok(payrollSummary);
    }
    
    // ============ Attendance Reports ============
    
    /**
     * GET /api/reports/attendance?month=1&year=2024
     * Get attendance summary for all employees for a specific month
     */
    @GetMapping("/attendance")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<List<AttendanceSummaryDTO>> getAttendanceSummary(
            @RequestParam(required = false, defaultValue = "1") @Min(1) @Max(12) int month,
            @RequestParam(required = false, defaultValue = "2024") int year) {
        log.info("Fetching attendance summary for month: {}, year: {}", month, year);
        List<AttendanceSummaryDTO> attendanceSummary = reportingService.getAttendanceSummary(month, year);
        return ResponseEntity.ok(attendanceSummary);
    }
    
    /**
     * GET /api/reports/attendance/employee/{employeeId}?month=1&year=2024
     * Get attendance summary for a specific employee
     */
    @GetMapping("/attendance/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN') or @employeeService.getEmployeeById(#employeeId).getUser().getUsername() == authentication.principal.username")
    public ResponseEntity<AttendanceSummaryDTO> getEmployeeAttendanceSummary(
            @PathVariable Long employeeId,
            @RequestParam(required = false, defaultValue = "1") @Min(1) @Max(12) int month,
            @RequestParam(required = false, defaultValue = "2024") int year) {
        log.info("Fetching attendance summary for employee: {}, month: {}, year: {}", employeeId, month, year);
        AttendanceSummaryDTO attendanceSummary = reportingService.getEmployeeAttendanceSummary(employeeId, month, year);
        return ResponseEntity.ok(attendanceSummary);
    }
    
    /**
     * GET /api/reports/attendance/department/{departmentId}?month=1&year=2024
     * Get attendance summary for a specific department
     */
    @GetMapping("/attendance/department/{departmentId}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<List<AttendanceSummaryDTO>> getDepartmentAttendanceSummary(
            @PathVariable Long departmentId,
            @RequestParam(required = false, defaultValue = "1") @Min(1) @Max(12) int month,
            @RequestParam(required = false, defaultValue = "2024") int year) {
        log.info("Fetching attendance summary for department: {}, month: {}, year: {}", departmentId, month, year);
        List<AttendanceSummaryDTO> attendanceSummary = reportingService.getDepartmentAttendanceSummary(departmentId, month, year);
        return ResponseEntity.ok(attendanceSummary);
    }
    
    // ============ Leave Reports ============
    
    /**
     * GET /api/reports/leave?month=1&year=2024
     * Get leave summary for all employees for a specific month
     */
    @GetMapping("/leave")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<List<LeaveSummaryDTO>> getLeaveSummary(
            @RequestParam(required = false, defaultValue = "1") @Min(1) @Max(12) int month,
            @RequestParam(required = false, defaultValue = "2024") int year) {
        log.info("Fetching leave summary for month: {}, year: {}", month, year);
        List<LeaveSummaryDTO> leaveSummary = reportingService.getLeaveSummary(month, year);
        return ResponseEntity.ok(leaveSummary);
    }
    
    /**
     * GET /api/reports/leave/employee/{employeeId}?month=1&year=2024
     * Get leave summary for a specific employee
     */
    @GetMapping("/leave/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN') or @employeeService.getEmployeeById(#employeeId).getUser().getUsername() == authentication.principal.username")
    public ResponseEntity<LeaveSummaryDTO> getEmployeeLeaveSummary(
            @PathVariable Long employeeId,
            @RequestParam(required = false, defaultValue = "1") @Min(1) @Max(12) int month,
            @RequestParam(required = false, defaultValue = "2024") int year) {
        log.info("Fetching leave summary for employee: {}, month: {}, year: {}", employeeId, month, year);
        LeaveSummaryDTO leaveSummary = reportingService.getEmployeeLeaveSummary(employeeId, month, year);
        return ResponseEntity.ok(leaveSummary);
    }
    
    /**
     * GET /api/reports/leave/department/{departmentId}?month=1&year=2024
     * Get leave summary for a specific department
     */
    @GetMapping("/leave/department/{departmentId}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<List<LeaveSummaryDTO>> getDepartmentLeaveSummary(
            @PathVariable Long departmentId,
            @RequestParam(required = false, defaultValue = "1") @Min(1) @Max(12) int month,
            @RequestParam(required = false, defaultValue = "2024") int year) {
        log.info("Fetching leave summary for department: {}, month: {}, year: {}", departmentId, month, year);
        List<LeaveSummaryDTO> leaveSummary = reportingService.getDepartmentLeaveSummary(departmentId, month, year);
        return ResponseEntity.ok(leaveSummary);
    }
    
    // ============ Department Reports ============
    
    /**
     * GET /api/reports/departments
     * Get summary for all departments
     */
    @GetMapping("/departments")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<List<DepartmentSummaryDTO>> getDepartmentSummary() {
        log.info("Fetching department summary");
        List<DepartmentSummaryDTO> departmentSummary = reportingService.getDepartmentSummary();
        return ResponseEntity.ok(departmentSummary);
    }
    
    /**
     * GET /api/reports/departments/{departmentId}
     * Get summary for a specific department
     */
    @GetMapping("/departments/{departmentId}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<DepartmentSummaryDTO> getDepartmentSummaryById(@PathVariable Long departmentId) {
        log.info("Fetching department summary for department: {}", departmentId);
        DepartmentSummaryDTO departmentSummary = reportingService.getDepartmentSummary(departmentId);
        return ResponseEntity.ok(departmentSummary);
    }
    
    // ============ Performance Reports ============
    
    /**
     * GET /api/reports/performance?month=1&year=2024
     * Get performance summary for all employees for a specific period
     */
    @GetMapping("/performance")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'MANAGER')")
    public ResponseEntity<List<PerformanceSummaryDTO>> getPerformanceSummary(
            @RequestParam(required = false, defaultValue = "1") @Min(1) @Max(12) int month,
            @RequestParam(required = false, defaultValue = "2024") int year) {
        log.info("Fetching performance summary for month: {}, year: {}", month, year);
        List<PerformanceSummaryDTO> performanceSummary = reportingService.getPerformanceSummary(month, year);
        return ResponseEntity.ok(performanceSummary);
    }
    
    /**
     * GET /api/reports/performance/employee/{employeeId}?month=1&year=2024
     * Get performance summary for a specific employee
     */
    @GetMapping("/performance/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'MANAGER') or @employeeService.getEmployeeById(#employeeId).getUser().getUsername() == authentication.principal.username")
    public ResponseEntity<PerformanceSummaryDTO> getEmployeePerformanceSummary(
            @PathVariable Long employeeId,
            @RequestParam(required = false, defaultValue = "1") @Min(1) @Max(12) int month,
            @RequestParam(required = false, defaultValue = "2024") int year) {
        log.info("Fetching performance summary for employee: {}, month: {}, year: {}", employeeId, month, year);
        PerformanceSummaryDTO performanceSummary = reportingService.getEmployeePerformanceSummary(employeeId, month, year);
        return ResponseEntity.ok(performanceSummary);
    }
    
    /**
     * GET /api/reports/performance/department/{departmentId}?month=1&year=2024
     * Get performance summary for a specific department
     */
    @GetMapping("/performance/department/{departmentId}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'MANAGER')")
    public ResponseEntity<List<PerformanceSummaryDTO>> getDepartmentPerformanceSummary(
            @PathVariable Long departmentId,
            @RequestParam(required = false, defaultValue = "1") @Min(1) @Max(12) int month,
            @RequestParam(required = false, defaultValue = "2024") int year) {
        log.info("Fetching performance summary for department: {}, month: {}, year: {}", departmentId, month, year);
        List<PerformanceSummaryDTO> performanceSummary = reportingService.getDepartmentPerformanceSummary(departmentId, month, year);
        return ResponseEntity.ok(performanceSummary);
    }
}
