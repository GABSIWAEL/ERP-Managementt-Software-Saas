package com.company.erp.attendance.service;

import com.company.erp.audit.repository.AuditLogRepository;
import com.company.erp.attendance.dto.AttendanceDTO;
import com.company.erp.attendance.entity.Attendance;
import com.company.erp.attendance.repository.AttendanceRepository;
import com.company.erp.attendance.service.impl.AttendanceServiceImpl;
import com.company.erp.common.enums.AttendanceStatus;
import com.company.erp.common.enums.WorkMode;
import com.company.erp.employee.entity.Employee;
import com.company.erp.employee.repository.EmployeeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AttendanceServiceImplTest {

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private AttendanceServiceImpl attendanceService;

    @Test
    void markCheckInShouldStoreSelectedWorkMode() {
        Employee employee = Employee.builder()
                .id(1L)
                .firstName("Jane")
                .lastName("Doe")
                .build();

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(attendanceRepository.findByEmployeeIdAndDate(1L, java.time.LocalDate.now())).thenReturn(Optional.empty());
        when(attendanceRepository.save(any(Attendance.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(auditLogRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        AttendanceDTO result = attendanceService.markCheckIn(1L, WorkMode.HYBRID);

        assertEquals(1L, result.getEmployeeId());
        assertEquals(WorkMode.HYBRID, result.getWorkMode());
        assertEquals(AttendanceStatus.PRESENT, result.getStatus());
    }
}
