package com.company.erp.notification.dto;

import com.company.erp.common.enums.UserRole;
import com.company.erp.notification.entity.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {
    
    private Long id;
    
    private String title;
    
    private String message;
    
    private UserRole recipientRole;
    
    private Long recipientId;
    
    private NotificationType type;
    
    private Long relatedEntityId;
    
    private Boolean isRead;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime readAt;
}
