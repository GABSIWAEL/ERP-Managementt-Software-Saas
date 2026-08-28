package com.company.erp.notification.service;

import com.company.erp.notification.dto.NotificationDTO;
import com.company.erp.notification.entity.NotificationType;
import com.company.erp.common.enums.UserRole;

import java.util.List;

public interface AppNotificationService {
    
    NotificationDTO createNotification(String title, String message, UserRole recipientRole, NotificationType type, Long relatedEntityId);
    
    NotificationDTO createNotificationForRole(String title, String message, UserRole recipientRole, NotificationType type, Long relatedEntityId);
    
    NotificationDTO createNotificationForEmployee(Long employeeId, String title, String message, NotificationType type, Long relatedEntityId);
    
    List<NotificationDTO> getNotificationsByRole(UserRole role);
    
    List<NotificationDTO> getUnreadNotificationsByRole(UserRole role);
    
    NotificationDTO markAsRead(Long notificationId);
    
    void deleteNotification(Long notificationId);
    
    void deleteOldNotifications(int daysOld);
    
    long getUnreadCount(UserRole role);
}
