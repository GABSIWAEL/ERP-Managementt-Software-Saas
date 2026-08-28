package com.company.erp.notification.service.impl;

import com.company.erp.notification.repository.NotificationRepository;
import com.company.erp.notification.service.AppNotificationService;
import com.company.erp.notification.service.WebSocketNotificationService;
import com.company.erp.notification.dto.NotificationDTO;
import com.company.erp.notification.entity.Notification;
import com.company.erp.notification.entity.NotificationType;
import com.company.erp.common.enums.UserRole;
import com.company.erp.common.exception.ResourceNotFoundException;
import com.company.erp.employee.repository.EmployeeRepository;
import com.company.erp.employee.entity.Employee;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class AppNotificationServiceImpl implements AppNotificationService {
    
    private final NotificationRepository notificationRepository;
    private final WebSocketNotificationService webSocketNotificationService;
    private final EmployeeRepository employeeRepository;
    
    @Override
    public NotificationDTO createNotification(String title, String message, UserRole recipientRole, NotificationType type, Long relatedEntityId) {
        log.info("Creating in-app notification for role: {} with type: {}", recipientRole, type);
        
        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .recipientRole(recipientRole)
                .type(type)
                .relatedEntityId(relatedEntityId)
                .isRead(false)
                .build();
        
        Notification saved = notificationRepository.save(notification);
        log.info("In-app notification created with ID: {}", saved.getId());
        
        NotificationDTO dto = mapToDTO(saved);
        
        // Send via WebSocket to the recipient role
        try {
            webSocketNotificationService.sendNotificationToRole(recipientRole, dto);
        } catch (Exception e) {
            log.warn("Failed to send notification via WebSocket", e);
        }
        
        return dto;
    }
    
    @Override
    public NotificationDTO createNotificationForRole(String title, String message, UserRole recipientRole, NotificationType type, Long relatedEntityId) {
        return createNotification(title, message, recipientRole, type, relatedEntityId);
    }
    
    @Override
    public NotificationDTO createNotificationForEmployee(Long employeeId, String title, String message, NotificationType type, Long relatedEntityId) {
        log.info("Creating in-app notification for employee: {} with type: {}", employeeId, type);
        
        // Fetch employee to get their role
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + employeeId));
        
        log.info("Employee found: {} with role: {}", employee.getId(), employee.getUser().getRole());
        
        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .recipientId(employeeId)
                .recipientRole(employee.getUser().getRole())  // Set role from employee's user
                .type(type)
                .relatedEntityId(relatedEntityId)
                .isRead(false)
                .build();
        
        Notification saved = notificationRepository.save(notification);
        log.info("In-app notification created with ID: {} for employee: {} with role: {}", saved.getId(), employeeId, employee.getUser().getRole());
        
        NotificationDTO dto = mapToDTO(saved);
        
        // Send via WebSocket to the specific employee/user (if WebSocket service is available)
        try {
            if (webSocketNotificationService != null) {
                webSocketNotificationService.sendNotificationToUser(employeeId, dto);
            } else {
                log.debug("WebSocketNotificationService is not available, skipping WebSocket notification");
            }
        } catch (Exception e) {
            log.warn("Failed to send notification via WebSocket to employee {}: {}", employeeId, e.getMessage());
        }
        
        return dto;
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<NotificationDTO> getNotificationsByRole(UserRole role) {
        log.info("Fetching all notifications for role: {}", role);
        return notificationRepository.findByRecipientRoleOrderByCreatedAtDesc(role)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<NotificationDTO> getUnreadNotificationsByRole(UserRole role) {
        log.info("Fetching unread notifications for role: {}", role);
        return notificationRepository.findByRecipientRoleAndIsReadFalseOrderByCreatedAtDesc(role)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public NotificationDTO markAsRead(Long notificationId) {
        log.info("Marking notification {} as read", notificationId);
        
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        
        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        
        Notification updated = notificationRepository.save(notification);
        return mapToDTO(updated);
    }
    
    @Override
    public void deleteNotification(Long notificationId) {
        log.info("Deleting notification: {}", notificationId);
        notificationRepository.deleteById(notificationId);
    }
    
    @Override
    public void deleteOldNotifications(int daysOld) {
        log.info("Deleting in-app notifications older than {} days", daysOld);
        
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysOld);
        List<Notification> oldNotifications = notificationRepository.findByCreatedAtBefore(cutoffDate);
        
        if (!oldNotifications.isEmpty()) {
            log.info("Found {} notifications to delete", oldNotifications.size());
            notificationRepository.deleteAll(oldNotifications);
            log.info("Old notifications deleted successfully");
        }
    }
    
    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(UserRole role) {
        return notificationRepository.countUnreadByRole(role);
    }
    
    private NotificationDTO mapToDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .recipientRole(notification.getRecipientRole())
                .recipientId(notification.getRecipientId())
                .type(notification.getType())
                .relatedEntityId(notification.getRelatedEntityId())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .readAt(notification.getReadAt())
                .build();
    }
}
