package com.company.erp.notification.service;

import com.company.erp.common.enums.UserRole;
import com.company.erp.notification.dto.NotificationDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebSocketNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Send notification to a specific role (e.g., all HR users)
     */
    public void sendNotificationToRole(UserRole role, NotificationDTO notification) {
        String destination = "/topic/notifications/" + role.name();
        log.info("Sending notification to role {} on destination {}", role, destination);
        messagingTemplate.convertAndSend(destination, notification);
    }

    /**
     * Send notification to a specific user
     */
    public void sendNotificationToUser(Long userId, NotificationDTO notification) {
        String destination = "/user/" + userId + "/queue/notifications";
        log.info("Sending notification to user {} on destination {}", userId, destination);
        messagingTemplate.convertAndSendToUser(String.valueOf(userId), "/queue/notifications", notification);
    }

    /**
     * Broadcast notification to all connected clients
     */
    public void broadcastNotification(NotificationDTO notification) {
        log.info("Broadcasting notification to all clients");
        messagingTemplate.convertAndSend("/topic/notifications/all", notification);
    }
}
