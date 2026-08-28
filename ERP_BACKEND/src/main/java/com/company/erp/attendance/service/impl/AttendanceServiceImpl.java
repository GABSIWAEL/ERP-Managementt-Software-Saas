package com.company.erp.attendance.service.impl;

import com.company.erp.audit.entity.AuditLog;
import com.company.erp.audit.repository.AuditLogRepository;
import com.company.erp.attendance.dto.AttendanceDTO;
import com.company.erp.attendance.entity.Attendance;
import com.company.erp.attendance.repository.AttendanceRepository;
import com.company.erp.attendance.service.AttendanceService;
import com.company.erp.common.enums.AttendanceStatus;
import com.company.erp.common.enums.WorkMode;
import com.company.erp.common.exception.BusinessLogicException;
import com.company.erp.common.exception.ResourceNotFoundException;
import com.company.erp.employee.entity.Employee;
import com.company.erp.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AttendanceServiceImpl implements AttendanceService {
    
    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final AuditLogRepository auditLogRepository;
    
    @Override
    public AttendanceDTO createAttendance(AttendanceDTO attendanceDTO) {
        log.info("Creating attendance record for employee ID: {}", attendanceDTO.getEmployeeId());
        
        Employee employee = employeeRepository.findById(attendanceDTO.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        
        // Check if attendance already exists for this date
        Optional<Attendance> existingAttendance = attendanceRepository.findByEmployeeIdAndDate(
                employee.getId(), attendanceDTO.getDate());
        
        if (existingAttendance.isPresent()) {
            throw new BusinessLogicException("Attendance already recorded for this employee on " + attendanceDTO.getDate());
        }
        
        Attendance attendance = Attendance.builder()
                .employee(employee)
                .date(attendanceDTO.getDate())
                .checkInTime(attendanceDTO.getCheckInTime())
                .checkOutTime(attendanceDTO.getCheckOutTime())
                .workMode(attendanceDTO.getWorkMode())
                .status(attendanceDTO.getStatus())
                .build();
        
        attendance = attendanceRepository.save(attendance);
        
        auditLogRepository.save(AuditLog.builder()
                .action("ATTENDANCE_RECORDED")
                .entityName("Attendance")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Attendance recorded for employee on " + attendanceDTO.getDate())
                .build());
        
        log.info("Attendance created successfully");
        return mapToDTO(attendance);
    }
    
    @Override
    public AttendanceDTO updateAttendance(Long id, AttendanceDTO attendanceDTO) {
        log.info("Updating attendance with ID: {}", id);
        
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance not found"));
        
        attendance.setCheckInTime(attendanceDTO.getCheckInTime());
        attendance.setCheckOutTime(attendanceDTO.getCheckOutTime());
        attendance.setWorkMode(attendanceDTO.getWorkMode());
        attendance.setStatus(attendanceDTO.getStatus());
        
        attendance = attendanceRepository.save(attendance);
        
        auditLogRepository.save(AuditLog.builder()
                .action("ATTENDANCE_UPDATED")
                .entityName("Attendance")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Attendance updated")
                .build());
        
        return mapToDTO(attendance);
    }
    
    @Override
    public void deleteAttendance(Long id) {
        log.info("Deleting attendance with ID: {}", id);
        
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance not found"));
        
        attendanceRepository.delete(attendance);
        
        auditLogRepository.save(AuditLog.builder()
                .action("ATTENDANCE_DELETED")
                .entityName("Attendance")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Attendance deleted")
                .build());
    }
    
    @Override
    @Transactional(readOnly = true)
    public AttendanceDTO getAttendanceById(Long id) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance not found"));
        return mapToDTO(attendance);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AttendanceDTO> getAllAttendance() {
        log.info("Fetching all attendance records");
        return attendanceRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AttendanceDTO> getAttendanceByEmployeeId(Long employeeId) {
        log.info("Fetching attendance for employee ID: {}", employeeId);
        return attendanceRepository.findByEmployeeId(employeeId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AttendanceDTO> getAttendanceByDateRange(Long employeeId, LocalDate startDate, LocalDate endDate) {
        log.info("Fetching attendance for employee {} between {} and {}", employeeId, startDate, endDate);
        return attendanceRepository.findByEmployeeIdAndDateBetween(employeeId, startDate, endDate).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AttendanceDTO> getAttendanceByStatus(String status) {
        log.info("Fetching attendance with status: {}", status);
        return attendanceRepository.findAll().stream()
                .filter(a -> a.getStatus().name().equalsIgnoreCase(status))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public AttendanceDTO markCheckIn(Long employeeId, WorkMode workMode) {
        log.info("Marking check-in for employee ID: {} with work mode {}", employeeId, workMode);
        
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        
        // Check if attendance already exists for today
        Optional<Attendance> existingAttendance = attendanceRepository
                .findByEmployeeIdAndDate(employeeId, LocalDate.now());
        
        if (existingAttendance.isPresent()) {
            throw new BusinessLogicException("Attendance already marked for today");
        }
        
        Attendance attendance = Attendance.builder()
                .employee(employee)
                .date(LocalDate.now())
                .checkInTime(LocalTime.now())
                .workMode(workMode != null ? workMode : attendanceRepository.findByEmployeeId(employeeId).stream()
                        .findFirst()
                        .map(Attendance::getWorkMode)
                        .orElse(WorkMode.OFFICE))
                .status(AttendanceStatus.PRESENT)
                .build();
        
        attendance = attendanceRepository.save(attendance);
        
        auditLogRepository.save(AuditLog.builder()
                .action("CHECK_IN")
                .entityName("Attendance")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Employee checked in")
                .build());
        
        return mapToDTO(attendance);
    }
    
    @Override
    public AttendanceDTO markCheckOut(Long employeeId) {
        log.info("Marking check-out for employee ID: {}", employeeId);
        
        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employeeId, LocalDate.now())
                .orElseThrow(() -> new BusinessLogicException("No check-in record found for today"));
        
        attendance.setCheckOutTime(LocalTime.now());
        attendance = attendanceRepository.save(attendance);
        
        auditLogRepository.save(AuditLog.builder()
                .action("CHECK_OUT")
                .entityName("Attendance")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Employee checked out")
                .build());
        
        return mapToDTO(attendance);
    }
    
    private AttendanceDTO mapToDTO(Attendance attendance) {
        return AttendanceDTO.builder()
                .id(attendance.getId())
                .employeeId(attendance.getEmployee().getId())
                .employeeName(attendance.getEmployee().getFirstName() + " " + attendance.getEmployee().getLastName())
                .date(attendance.getDate())
                .checkInTime(attendance.getCheckInTime())
                .checkOutTime(attendance.getCheckOutTime())
                .workMode(attendance.getWorkMode())
                .status(attendance.getStatus())
                .createdAt(attendance.getCreatedAt())
                .updatedAt(attendance.getUpdatedAt())
                .build();
    }
    
    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "SYSTEM";
    }
}
