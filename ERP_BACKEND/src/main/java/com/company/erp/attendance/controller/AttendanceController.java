package com.company.erp.attendance.controller;

import com.company.erp.attendance.dto.AttendanceDTO;
import com.company.erp.attendance.dto.DeviceAttendanceEventRequest;
import com.company.erp.attendance.service.AttendanceService;
import com.company.erp.attendance.service.AttendanceEventService;
import com.company.erp.common.dto.ApiResponse;
import com.company.erp.common.enums.WorkMode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {
    
    private final AttendanceService attendanceService;
    private final AttendanceEventService attendanceEventService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<AttendanceDTO>> createAttendance(
            @Valid @RequestBody AttendanceDTO attendanceDTO) {
        log.info("Creating attendance record");
        AttendanceDTO createdAttendance = attendanceService.createAttendance(attendanceDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(createdAttendance, "Attendance created successfully", 201));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<ApiResponse<AttendanceDTO>> updateAttendance(
            @PathVariable Long id,
            @Valid @RequestBody AttendanceDTO attendanceDTO) {
        log.info("Updating attendance with ID: {}", id);
        AttendanceDTO updatedAttendance = attendanceService.updateAttendance(id, attendanceDTO);
        return ResponseEntity.ok(ApiResponse.success(updatedAttendance, "Attendance updated successfully"));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAttendance(@PathVariable Long id) {
        log.info("Deleting attendance with ID: {}", id);
        attendanceService.deleteAttendance(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Attendance deleted successfully"));
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'ACCOUNTANT', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<AttendanceDTO>>> getAllAttendance() {
        log.info("Fetching all attendance records");
        List<AttendanceDTO> attendances = attendanceService.getAllAttendance();
        return ResponseEntity.ok(ApiResponse.success(attendances, "All attendances fetched successfully"));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<AttendanceDTO>> getAttendanceById(@PathVariable Long id) {
        log.info("Fetching attendance with ID: {}", id);
        AttendanceDTO attendance = attendanceService.getAttendanceById(id);
        return ResponseEntity.ok(ApiResponse.success(attendance, "Attendance fetched successfully"));
    }
    
    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<AttendanceDTO>>> getAttendanceByEmployee(
            @PathVariable Long employeeId) {
        log.info("Fetching attendance for employee ID: {}", employeeId);
        List<AttendanceDTO> attendances = attendanceService.getAttendanceByEmployeeId(employeeId);
        return ResponseEntity.ok(ApiResponse.success(attendances, "Attendances fetched successfully"));
    }
    
    @GetMapping("/employee/{employeeId}/range")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<AttendanceDTO>>> getAttendanceByDateRange(
            @PathVariable Long employeeId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        log.info("Fetching attendance between {} and {}", startDate, endDate);
        List<AttendanceDTO> attendances = attendanceService.getAttendanceByDateRange(employeeId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(attendances, "Attendances fetched successfully"));
    }
    
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<AttendanceDTO>>> getAttendanceByStatus(
            @PathVariable String status) {
        log.info("Fetching attendance with status: {}", status);
        List<AttendanceDTO> attendances = attendanceService.getAttendanceByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(attendances, "Attendances fetched successfully"));
    }
    
    @PostMapping("/events")
    public ResponseEntity<ApiResponse<AttendanceDTO>> receiveDeviceEvent(
            @Valid @RequestBody DeviceAttendanceEventRequest request) {
        log.info("Receiving attendance event for employee {} from device {}", request.getEmployeeId(), request.getDeviceId());
        AttendanceDTO attendance = attendanceEventService.processDeviceEvent(request);
        return ResponseEntity.ok(ApiResponse.success(attendance, "Attendance event processed successfully"));
    }
    
    @PostMapping("/check-in/{employeeId}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'HR', 'ADMIN')")
    public ResponseEntity<ApiResponse<AttendanceDTO>> markCheckIn(
            @PathVariable Long employeeId,
            @RequestParam(required = false) WorkMode workMode) {
        log.info("Marking check-in for employee ID: {} with work mode {}", employeeId, workMode);
        AttendanceDTO attendance = attendanceService.markCheckIn(employeeId, workMode);
        return ResponseEntity.ok(ApiResponse.success(attendance, "Check-in recorded successfully"));
    }
    
    @PostMapping("/check-out/{employeeId}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'HR', 'ADMIN')")
    public ResponseEntity<ApiResponse<AttendanceDTO>> markCheckOut(@PathVariable Long employeeId) {
        log.info("Marking check-out for employee ID: {}", employeeId);
        AttendanceDTO attendance = attendanceService.markCheckOut(employeeId);
        return ResponseEntity.ok(ApiResponse.success(attendance, "Check-out recorded successfully"));
    }
}
