package com.company.erp.notification.task;

import com.company.erp.notification.service.AppNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled tasks for notification management
 * Runs automatic cleanup of old notifications
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class NotificationScheduledTasks {
    
    private final AppNotificationService appNotificationService;
    
    /**
     * Delete notifications older than 5 days
     * Runs daily at 2:00 AM
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void deleteOldNotifications() {
        log.info("========== Starting scheduled task: deleteOldNotifications ==========");
        try {
            appNotificationService.deleteOldNotifications(5);
            log.info("========== Completed: Notifications older than 5 days have been deleted ==========");
        } catch (Exception e) {
            log.error("Error deleting old notifications", e);
        }
    }
}
