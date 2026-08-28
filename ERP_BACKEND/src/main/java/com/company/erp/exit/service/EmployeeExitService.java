package com.company.erp.exit.service;

import com.company.erp.exit.dto.ExitChecklistDTO;
import com.company.erp.exit.dto.ResignationRequestDTO;

import java.time.LocalDate;
import java.util.List;

/**
 * Service interface for employee exit/resignation workflows
 * Handles resignation submissions, approvals, and exit process management
 */
public interface EmployeeExitService {
    
    // ===== Resignation Management =====
    
    /**
     * Submit a resignation request by an employee
     */
    ResignationRequestDTO submitResignation(Long employeeId, LocalDate lastWorkingDay, String reason);
    
    /**
     * Approve resignation at manager level
     */
    ResignationRequestDTO approveResignationByManager(Long resignationId, String managerComments);
    
    /**
     * Approve resignation at HR level
     */
    ResignationRequestDTO approveResignationByHR(Long resignationId, String hrComments);
    
    /**
     * Reject a resignation request
     */
    ResignationRequestDTO rejectResignation(Long resignationId, String rejectionReason);
    
    /**
     * Cancel a previously submitted resignation
     */
    ResignationRequestDTO cancelResignation(Long resignationId);
    
    /**
     * Get resignation by ID
     */
    ResignationRequestDTO getResignationById(Long resignationId);
    
    /**
     * Get all resignations for an employee
     */
    List<ResignationRequestDTO> getResignationsByEmployeeId(Long employeeId);
    
    /**
     * Get all resignations with a specific status
     */
    List<ResignationRequestDTO> getResignationsByStatus(String status);
    
    /**
     * Get all pending resignations (awaiting approval)
     */
    List<ResignationRequestDTO> getPendingResignations();
    
    /**
     * Get all resignations regardless of status
     */
    List<ResignationRequestDTO> getAllResignations();
    
    // ===== Exit Checklist Management =====
    
    /**
     * Initialize exit checklist when resignation is approved by HR
     */
    ExitChecklistDTO initializeExitChecklist(Long resignationId);
    
    /**
     * Mark assets as returned for the employee
     */
    ExitChecklistDTO markAssetsReturned(Long resignationId);
    
    /**
     * Mark leave balance as settled
     */
    ExitChecklistDTO markLeaveSettled(Long resignationId);
    
    /**
     * Mark final payroll as processed
     */
    ExitChecklistDTO markFinalPayrollProcessed(Long resignationId);
    
    /**
     * Mark user account as deactivated
     */
    ExitChecklistDTO markUserAccountDeactivated(Long resignationId);
    
    /**
     * Mark employee data as archived
     */
    ExitChecklistDTO markDataArchived(Long resignationId);
    
    /**
     * Get exit checklist for a resignation
     */
    ExitChecklistDTO getExitChecklist(Long resignationId);
    
    /**
     * Complete exit process when all checklist items are done
     */
    void completeExitProcess(Long resignationId);
}
