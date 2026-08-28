package com.company.erp.recruitment.service;

import com.company.erp.recruitment.entity.InterviewSchedule;
import com.company.erp.recruitment.entity.JobApplication;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for managing interview and test scheduling
 */
public interface InterviewScheduleService {
    
    /**
     * Schedule an interview/test for a candidate
     */
    InterviewSchedule scheduleInterview(
        JobApplication application,
        InterviewSchedule.ScheduleType type,
        LocalDateTime dateTime,
        String title,
        String description,
        String location,
        String meetingLink,
        String interviewerName,
        String interviewerEmail,
        Long companyId
    );
    
    /**
     * Get all schedules for an application
     */
    List<InterviewSchedule> getSchedulesForApplication(JobApplication application);
    
    /**
     * Get schedule by ID
     */
    InterviewSchedule getScheduleById(Long id);
    
    /**
     * Update schedule
     */
    InterviewSchedule updateSchedule(Long id, InterviewSchedule schedule);
    
    /**
     * Cancel schedule
     */
    void cancelSchedule(Long id);
    
    /**
     * Mark schedule as completed with feedback
     */
    void completeSchedule(Long id, Integer ratingScore, String feedbackNotes);
    
    /**
     * Get interviewer's calendar for a date range
     */
    List<InterviewSchedule> getInterviewerCalendar(String interviewerEmail, LocalDateTime start, LocalDateTime end);
    
    /**
     * Get company calendar for a date range
     */
    List<InterviewSchedule> getCompanyCalendar(Long companyId, LocalDateTime start, LocalDateTime end);
    
    /**
     * Check interviewer availability
     */
    boolean isInterviewerAvailable(String interviewerEmail, LocalDateTime dateTime);
    
    /**
     * Send reminder emails for upcoming schedules
     */
    void sendReminders();
}
