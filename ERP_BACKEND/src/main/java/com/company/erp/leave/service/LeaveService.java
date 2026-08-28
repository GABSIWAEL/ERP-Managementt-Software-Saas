package com.company.erp.leave.service;

import com.company.erp.leave.dto.LeaveRequestDTO;

import java.time.LocalDate;
import java.util.List;

public interface LeaveService {
    
    LeaveRequestDTO createLeaveRequest(LeaveRequestDTO leaveRequestDTO);
    
    LeaveRequestDTO updateLeaveRequest(Long id, LeaveRequestDTO leaveRequestDTO);
    
    LeaveRequestDTO approveLeave(Long id, String managerComment);
    
    LeaveRequestDTO rejectLeave(Long id, String managerComment);
    
    void cancelLeave(Long id);
    
    LeaveRequestDTO getLeaveById(Long id);
    
    List<LeaveRequestDTO> getAllLeaves();
    
    List<LeaveRequestDTO> getAllLeaves(String status);
    
    List<LeaveRequestDTO> getLeavesByEmployeeId(Long employeeId);
    
    List<LeaveRequestDTO> getLeavesByStatus(String status);
    
    List<LeaveRequestDTO> getLeavesByDateRange(LocalDate startDate, LocalDate endDate);
    
    boolean hasOverlappingLeave(Long employeeId, LocalDate startDate, LocalDate endDate);
    
    long calculateLeaveDays(LocalDate startDate, LocalDate endDate);
}
