package com.company.erp.notification.controller;

import com.company.erp.notification.dto.NotificationDTO;
import com.company.erp.notification.service.AppNotificationService;
import com.company.erp.common.dto.ApiResponse;
import com.company.erp.common.enums.UserRole;
import com.company.erp.security.entity.User;
import com.company.erp.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {
    
    private final AppNotificationService appNotificationService;
    private final UserRepository userRepository;
    
    /**
     * Get the current user from security context
     */
    private UserRole getCurrentUserRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        
        // Get the principal - could be User object or String username
        Object principal = authentication.getPrincipal();
        
        if (principal instanceof User) {
            User user = (User) principal;
            return user.getRole();
        } else if (principal instanceof String) {
            // If principal is a String (username), fetch the user from DB
            String username = (String) principal;
            Optional<User> user = userRepository.findByUsername(username);
            if (user.isPresent()) {
                return user.get().getRole();
            }
        }
        
        log.warn("Could not determine user role from principal: {}", principal);
        return null;
    }
    
    /**
     * Get all notifications for the current user's role
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<List<NotificationDTO>>> getNotifications() {
        log.info("GET /api/notifications - Fetching notifications for current user");
        
        try {
            UserRole role = getCurrentUserRole();
            
            if (role == null) {
                log.warn("Could not determine user role");
                return ResponseEntity.ok(
                        ApiResponse.<List<NotificationDTO>>builder()
                                .success(true)
                                .data(List.of())
                                .message("No notifications")
                                .build()
                );
            }
            
            List<NotificationDTO> notifications = appNotificationService.getNotificationsByRole(role);
            
            return ResponseEntity.ok(
                    ApiResponse.<List<NotificationDTO>>builder()
                            .success(true)
                            .data(notifications)
                            .message("Notifications fetched successfully")
                            .build()
            );
        } catch (Exception e) {
            log.error("Error fetching notifications", e);
            return ResponseEntity.ok(
                    ApiResponse.<List<NotificationDTO>>builder()
                            .success(true)
                            .data(List.of())
                            .message("No notifications")
                            .build()
            );
        }
    }
    
    /**
     * Get unread notifications for the current user's role
     */
    @GetMapping("/unread")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<List<NotificationDTO>>> getUnreadNotifications() {
        log.info("GET /api/notifications/unread - Fetching unread notifications");
        
        try {
            UserRole role = getCurrentUserRole();
            
            if (role == null) {
                log.warn("Could not determine user role");
                return ResponseEntity.ok(
                        ApiResponse.<List<NotificationDTO>>builder()
                                .success(true)
                                .data(List.of())
                                .message("No unread notifications")
                                .build()
                );
            }
            
            List<NotificationDTO> notifications = appNotificationService.getUnreadNotificationsByRole(role);
            
            return ResponseEntity.ok(
                    ApiResponse.<List<NotificationDTO>>builder()
                            .success(true)
                            .data(notifications)
                            .message("Unread notifications fetched successfully")
                            .build()
            );
        } catch (Exception e) {
            log.error("Error fetching unread notifications", e);
            return ResponseEntity.ok(
                    ApiResponse.<List<NotificationDTO>>builder()
                            .success(true)
                            .data(List.of())
                            .message("No unread notifications")
                            .build()
            );
        }
    }
    
    /**
     * Get unread notification count for the current user's role
     */
    @GetMapping("/unread/count")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        log.info("GET /api/notifications/unread/count - Fetching unread count");
        
        try {
            UserRole role = getCurrentUserRole();
            
            if (role == null) {
                log.warn("Could not determine user role");
                return ResponseEntity.ok(
                        ApiResponse.<Long>builder()
                                .success(true)
                                .data(0L)
                                .message("Unread count: 0")
                                .build()
                );
            }
            
            long count = appNotificationService.getUnreadCount(role);
            
            return ResponseEntity.ok(
                    ApiResponse.<Long>builder()
                            .success(true)
                            .data(count)
                            .message("Unread count retrieved successfully")
                            .build()
            );
        } catch (Exception e) {
            log.error("Error fetching unread count", e);
            return ResponseEntity.ok(
                    ApiResponse.<Long>builder()
                            .success(true)
                            .data(0L)
                            .message("Unread count: 0")
                            .build()
            );
        }
    }
    
    /**
     * Mark a notification as read
     */
    @PutMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<NotificationDTO>> markAsRead(@PathVariable Long id) {
        log.info("PUT /api/notifications/{}/read - Marking notification as read", id);
        
        NotificationDTO notification = appNotificationService.markAsRead(id);
        
        return ResponseEntity.ok(
                ApiResponse.<NotificationDTO>builder()
                        .success(true)
                        .data(notification)
                        .message("Notification marked as read")
                        .build()
        );
    }
    
    /**
     * Delete a notification
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable Long id) {
        log.info("DELETE /api/notifications/{} - Deleting notification", id);
        
        appNotificationService.deleteNotification(id);
        
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Notification deleted successfully")
                        .build()
        );
    }
}
