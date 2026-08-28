package com.company.erp.event.service;

/**
 * Service for handling event scheduling tasks
 */
public interface EventSchedulerService {
    
    /**
     * Auto-detect and create birthday events for today
     * Runs daily at 8:00 AM
     */
    void createBirthdayEventsForToday();
    
    /**
     * Send birthday reminders for upcoming birthdays
     * Runs daily at 9:00 AM (sends reminders for birthdays within 7 days)
     */
    void sendBirthdayReminders();
}
