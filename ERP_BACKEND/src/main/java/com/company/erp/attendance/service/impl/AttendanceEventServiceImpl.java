package com.company.erp.attendance.service.impl;

import com.company.erp.attendance.dto.AttendanceDTO;
import com.company.erp.attendance.dto.DeviceAttendanceEventRequest;
import com.company.erp.attendance.entity.Attendance;
import com.company.erp.attendance.repository.AttendanceRepository;
import com.company.erp.attendance.service.AttendanceEventService;
import com.company.erp.attendance.service.AttendanceService;
import com.company.erp.audit.entity.AuditLog;
import com.company.erp.audit.repository.AuditLogRepository;
import com.company.erp.common.enums.AttendanceStatus;
import com.company.erp.common.enums.WorkMode;
import com.company.erp.common.exception.BusinessLogicException;
import com.company.erp.common.exception.ResourceNotFoundException;
import com.company.erp.employee.entity.Employee;
import com.company.erp.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AttendanceEventServiceImpl implements AttendanceEventService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final AuditLogRepository auditLogRepository;
    private final AttendanceService attendanceService;

    @Override
    public AttendanceDTO processDeviceEvent(DeviceAttendanceEventRequest request) {
        log.info("Processing attendance event from device {} for employee {}", request.getDeviceId(), request.getEmployeeId());

        Employee employee = employeeRepository.findById(Long.parseLong(request.getEmployeeId()))
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        Optional<Attendance> existingAttendance = attendanceRepository.findByEmployeeIdAndDate(employee.getId(), LocalDate.now());
        if (existingAttendance.isPresent()) {
            throw new BusinessLogicException("Attendance already recorded for today");
        }

        Attendance attendance = Attendance.builder()
                .employee(employee)
                .date(LocalDate.now())
                .checkInTime(LocalTime.now())
                .workMode(WorkMode.OFFICE)
                .status(AttendanceStatus.PRESENT)
                .build();

        attendance = attendanceRepository.save(attendance);

        auditLogRepository.save(AuditLog.builder()
                .action("DEVICE_ATTENDANCE_EVENT")
                .entityName("Attendance")
                .performedBy("DEVICE_" + request.getDeviceId())
                .timestamp(LocalDateTime.now())
                .details("Attendance event processed for employee " + employee.getId() + " from device " + request.getDeviceId())
                .build());

        return attendanceService.getAttendanceById(attendance.getId());
    }
}
