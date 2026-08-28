package com.company.erp.attendance.service;

import com.company.erp.attendance.dto.AttendanceDTO;
import com.company.erp.common.enums.WorkMode;
import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {
    
    AttendanceDTO createAttendance(AttendanceDTO attendanceDTO);
    
    AttendanceDTO updateAttendance(Long id, AttendanceDTO attendanceDTO);
    
    void deleteAttendance(Long id);
    
    AttendanceDTO getAttendanceById(Long id);
    
    List<AttendanceDTO> getAllAttendance();
    
    List<AttendanceDTO> getAttendanceByEmployeeId(Long employeeId);
    
    List<AttendanceDTO> getAttendanceByDateRange(Long employeeId, LocalDate startDate, LocalDate endDate);
    
    List<AttendanceDTO> getAttendanceByStatus(String status);
    
    AttendanceDTO markCheckIn(Long employeeId, WorkMode workMode);
    
    AttendanceDTO markCheckOut(Long employeeId);
}
