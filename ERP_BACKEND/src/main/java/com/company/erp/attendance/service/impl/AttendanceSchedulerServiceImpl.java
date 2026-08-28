package com.company.erp.attendance.service.impl;

import com.company.erp.attendance.entity.Attendance;
import com.company.erp.attendance.repository.AttendanceRepository;
import com.company.erp.attendance.service.AttendanceSchedulerService;
import com.company.erp.common.enums.AttendanceStatus;
import com.company.erp.common.enums.EmployeeStatus;
import com.company.erp.employee.entity.Employee;
import com.company.erp.employee.repository.EmployeeRepository;
import com.company.erp.warning.dto.WarningDTO;
import com.company.erp.warning.service.WarningService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Scheduled service for automated attendance operations
 * Handles auto-marking absences, detecting late arrivals, etc.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AttendanceSchedulerServiceImpl implements AttendanceSchedulerService {
    
    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final WarningService warningService;
    
    /**
     * Run at 9:00 AM daily to mark employees as absent if they haven't clocked in
     */
    @Override
    @Scheduled(cron = "0 0 9 * * *")
    public void autoMarkAbsentForMissedClockIn() {
        log.info("Starting auto-mark absent job for missed clock-ins");
        
        LocalDate today = LocalDate.now();
        
        // Get all active employees
        List<Employee> activeEmployees = employeeRepository.findAll().stream()
                .filter(e -> e.getStatus() == EmployeeStatus.ACTIVE)
                .toList();
        
        int markedAbsentCount = 0;
        for (Employee employee : activeEmployees) {
            // Check if employee has an attendance record for today
            var existingAttendance = attendanceRepository.findByEmployeeIdAndDate(employee.getId(), today);
            
            if (existingAttendance.isEmpty()) {
                // No attendance record found, mark as absent
                Attendance absent = Attendance.builder()
                        .employee(employee)
                        .date(today)
                        .status(AttendanceStatus.ABSENT)
                        .build();
                
                attendanceRepository.save(absent);
                markedAbsentCount++;
                
                log.info("Auto-marked employee {} as absent for date {}", employee.getId(), today);
            }
        }
        
        log.info("Auto-mark absent job completed. Marked {} employees as absent", markedAbsentCount);
    }
    
    /**
     * Run at 8:30 AM daily to detect and flag late arrivals
     */
    @Override
    @Scheduled(cron = "0 30 8 * * *")
    public void detectAndFlagLateArrivals() {
        log.info("Starting late arrival detection job");
        
        LocalDate today = LocalDate.now();
        LocalTime lateThreshold = LocalTime.of(9, 0); // 9:00 AM
        
        // Get all attendance records for today with check-in after 9:00 AM
        var allAttendanceToday = attendanceRepository.findAll().stream()
                .filter(a -> a.getDate().equals(today))
                .filter(a -> a.getCheckInTime() != null)
                .filter(a -> a.getCheckInTime().isAfter(lateThreshold))
                .toList();
        
        int lateCount = 0;
        for (Attendance attendance : allAttendanceToday) {
            // Create a warning for late arrival
            try {
                WarningDTO warningDTO = WarningDTO.builder()
                        .employeeId(attendance.getEmployee().getId())
                        .reason("Late arrival at " + attendance.getCheckInTime() + " (Standard time: 9:00 AM)")
                        .severity(com.company.erp.common.enums.WarningSeverity.LOW)
                        .build();
                
                warningService.createWarning(warningDTO);
                lateCount++;
                
                log.info("Created late arrival warning for employee {} at {}", 
                        attendance.getEmployee().getId(), attendance.getCheckInTime());
            } catch (Exception e) {
                log.error("Error creating warning for late arrival", e);
            }
        }
        
        log.info("Late arrival detection job completed. Found {} late arrivals", lateCount);
    }
}
