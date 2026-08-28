package com.company.erp.notification.service;

import com.company.erp.notification.dto.EmailRequest;

/**
 * Service for handling email and SMS notifications
 */
public interface NotificationService {
    
    /**
     * Send email notification
     */
    void sendEmail(EmailRequest emailRequest);
    
    /**
     * Send leave approval notification
     */
    void notifyLeaveApproval(Long employeeId, String leaveType, String approvalStatus);
    
    /**
     * Send performance low-score alert
     */
    void notifyPerformanceLowScore(Long employeeId, double averageScore);
    
    /**
     * Send birthday reminder to HR
     */
    void notifyBirthdayReminder(Long employeeId, String employeeName);
    
    /**
     * Send resignation acknowledgment
     */
    void notifyResignationAcknowledgment(Long employeeId, String employeeName);
    
    /**
     * Send exit process notification
     */
    void notifyExitProcessUpdate(Long employeeId, String checklistItem, boolean completed);
}
