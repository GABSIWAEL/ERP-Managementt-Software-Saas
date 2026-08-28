package com.company.erp.attendance.service;

import com.company.erp.attendance.dto.AttendanceDTO;
import com.company.erp.attendance.dto.DeviceAttendanceEventRequest;

public interface AttendanceEventService {
    AttendanceDTO processDeviceEvent(DeviceAttendanceEventRequest request);
}
