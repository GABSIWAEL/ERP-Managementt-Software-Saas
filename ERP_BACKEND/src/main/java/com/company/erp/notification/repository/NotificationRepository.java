package com.company.erp.notification.repository;

import com.company.erp.common.enums.UserRole;
import com.company.erp.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    List<Notification> findByRecipientRoleOrderByCreatedAtDesc(UserRole role);
    
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);
    
    List<Notification> findByRecipientRoleAndIsReadFalseOrderByCreatedAtDesc(UserRole role);
    
    List<Notification> findByCreatedAtBefore(LocalDateTime dateTime);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipientRole = :role AND n.isRead = false")
    long countUnreadByRole(@Param("role") UserRole role);
}
