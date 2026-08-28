package com.company.erp.attendance.service;

/**
 * Scheduled service for automated attendance operations
 */
public interface AttendanceSchedulerService {
    
    /**
     * Automatically mark employees as absent if they didn't clock in by 9:00 AM
     */
    void autoMarkAbsentForMissedClockIn();
    
    /**
     * Detect and flag late arrivals (arrivals after 9:00 AM)
     */
    void detectAndFlagLateArrivals();
}
