package com.company.erp.leave.controller;

import com.company.erp.common.dto.ApiResponse;
import com.company.erp.leave.dto.LeaveRequestDTO;
import com.company.erp.leave.service.LeaveService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
public class LeaveController {
    
    private final LeaveService leaveService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<LeaveRequestDTO>> createLeaveRequest(
            @Valid @RequestBody LeaveRequestDTO leaveRequestDTO) {
        log.info("Creating new leave request");
        log.info("Request body - employeeId: {}, leaveType: {}, startDate: {}, endDate: {}, status: {}", 
                 leaveRequestDTO.getEmployeeId(),
                 leaveRequestDTO.getLeaveType(),
                 leaveRequestDTO.getStartDate(),
                 leaveRequestDTO.getEndDate(),
                 leaveRequestDTO.getStatus());
        
        try {
            LeaveRequestDTO createdLeave = leaveService.createLeaveRequest(leaveRequestDTO);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(createdLeave, "Leave request created successfully", 201));
        } catch (Exception e) {
            log.error("Error creating leave request", e);
            throw e;
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    public ResponseEntity<ApiResponse<LeaveRequestDTO>> updateLeaveRequest(
            @PathVariable Long id,
            @Valid @RequestBody LeaveRequestDTO leaveRequestDTO) {
        log.info("Updating leave request with ID: {}", id);
        LeaveRequestDTO updatedLeave = leaveService.updateLeaveRequest(id, leaveRequestDTO);
        return ResponseEntity.ok(ApiResponse.success(updatedLeave, "Leave request updated successfully"));
    }
    
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<LeaveRequestDTO>> approveLeave(
            @PathVariable Long id,
            @RequestParam(required = false) String comment) {
        log.info("Approving leave request with ID: {}", id);
        LeaveRequestDTO approvedLeave = leaveService.approveLeave(id, comment);
        return ResponseEntity.ok(ApiResponse.success(approvedLeave, "Leave request approved"));
    }
    
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<LeaveRequestDTO>> rejectLeave(
            @PathVariable Long id,
            @RequestParam(required = false) String comment) {
        log.info("Rejecting leave request with ID: {}", id);
        LeaveRequestDTO rejectedLeave = leaveService.rejectLeave(id, comment);
        return ResponseEntity.ok(ApiResponse.success(rejectedLeave, "Leave request rejected"));
    }
    
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> cancelLeave(@PathVariable Long id) {
        log.info("Cancelling leave request with ID: {}", id);
        leaveService.cancelLeave(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Leave request cancelled"));
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'HR', 'ACCOUNTANT', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<LeaveRequestDTO>>> getAllLeaves(
            @RequestParam(required = false) String status) {
        log.info("Fetching all leave requests with status filter: {}", status);
        List<LeaveRequestDTO> leaves = leaveService.getAllLeaves(status);
        return ResponseEntity.ok(ApiResponse.success(leaves, "All leaves fetched successfully"));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<LeaveRequestDTO>> getLeaveById(@PathVariable Long id) {
        log.info("Fetching leave request with ID: {}", id);
        LeaveRequestDTO leave = leaveService.getLeaveById(id);
        return ResponseEntity.ok(ApiResponse.success(leave, "Leave request fetched successfully"));
    }
    
    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<LeaveRequestDTO>>> getLeavesByEmployee(@PathVariable Long employeeId) {
        log.info("Fetching leaves for employee ID: {}", employeeId);
        List<LeaveRequestDTO> leaves = leaveService.getLeavesByEmployeeId(employeeId);
        return ResponseEntity.ok(ApiResponse.success(leaves, "Leaves fetched successfully"));
    }
    
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'HR')")
    public ResponseEntity<ApiResponse<List<LeaveRequestDTO>>> getLeavesByStatus(@PathVariable String status) {
        log.info("Fetching leaves with status: {}", status);
        List<LeaveRequestDTO> leaves = leaveService.getLeavesByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(leaves, "Leaves fetched successfully"));
    }
    
    @GetMapping("/range")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<LeaveRequestDTO>>> getLeavesByDateRange(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        log.info("Fetching leaves between {} and {}", startDate, endDate);
        List<LeaveRequestDTO> leaves = leaveService.getLeavesByDateRange(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(leaves, "Leaves fetched successfully"));
    }
    
    @GetMapping("/overlap")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public ResponseEntity<ApiResponse<Boolean>> checkOverlappingLeave(
            @RequestParam Long employeeId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        log.info("Checking overlapping leave for employee: {}", employeeId);
        boolean hasOverlap = leaveService.hasOverlappingLeave(employeeId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(hasOverlap, "Overlap check completed"));
    }
    
    @GetMapping("/calculate-days")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> calculateLeaveDays(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        log.info("Calculating leave days between {} and {}", startDate, endDate);
        long days = leaveService.calculateLeaveDays(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(
                Map.of("startDate", startDate, "endDate", endDate, "totalDays", days),
                "Days calculated successfully"));
    }
}
