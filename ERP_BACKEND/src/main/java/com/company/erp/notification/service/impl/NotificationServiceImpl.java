package com.company.erp.notification.service.impl;

import com.company.erp.employee.entity.Employee;
import com.company.erp.employee.repository.EmployeeRepository;
import com.company.erp.notification.dto.EmailRequest;
import com.company.erp.notification.service.NotificationService;
import com.company.erp.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * Implementation of notification service
 * Handles email notifications for various ERP events
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    
    private final JavaMailSender mailSender;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    
    @Value("${spring.mail.from:noreply@company.com}")
    private String fromEmail;
    
    @Value("${app.notification.enabled:false}")
    private boolean notificationsEnabled;
    
    @Override
    public void sendEmail(EmailRequest emailRequest) {
        log.info("[NOTIFICATION] sendEmail() called - To: {}, Subject: {}", emailRequest.getTo(), emailRequest.getSubject());
        
        if (!notificationsEnabled) {
            log.warn("[NOTIFICATION] Notifications are DISABLED in config. Email NOT sent to: {}", emailRequest.getTo());
            return;
        }
        
        log.info("[NOTIFICATION] Notifications ENABLED - proceeding to send email");
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(emailRequest.getTo());
            message.setSubject(emailRequest.getSubject());
            message.setText(emailRequest.getBody());
            
            log.info("[NOTIFICATION] Message created - From: {}, To: {}", fromEmail, emailRequest.getTo());
            
            if (emailRequest.getCc() != null && !emailRequest.getCc().isEmpty()) {
                message.setCc(emailRequest.getCc().toArray(new String[0]));
                log.info("[NOTIFICATION] CC added: {}", emailRequest.getCc());
            }
            
            if (emailRequest.getBcc() != null && !emailRequest.getBcc().isEmpty()) {
                message.setBcc(emailRequest.getBcc().toArray(new String[0]));
                log.info("[NOTIFICATION] BCC added: {}", emailRequest.getBcc());
            }
            
            log.info("[NOTIFICATION] About to call mailSender.send() for: {}", emailRequest.getTo());
            mailSender.send(message);
            log.info("[NOTIFICATION] Email sent successfully to: {}", emailRequest.getTo());
        } catch (Exception e) {
            log.error("[NOTIFICATION] FAILED to send email to: {} - Error: {} - Message: {}", 
                    emailRequest.getTo(), e.getClass().getName(), e.getMessage(), e);
        }
    }
    
    @Override
    public void notifyLeaveApproval(Long employeeId, String leaveType, String approvalStatus) {
        try {
            Employee employee = employeeRepository.findById(employeeId)
                    .orElse(null);
            
            if (employee == null) {
                log.warn("Employee not found: {}", employeeId);
                return;
            }
            
            String subject = String.format("Leave Request - %s", approvalStatus);
            String body = String.format(
                    "Dear %s,\n\n" +
                    "Your %s leave request has been %s.\n\n" +
                    "If you have any questions, please contact HR.\n\n" +
                    "Best regards,\nHuman Resources Team",
                    employee.getFirstName(),
                    leaveType,
                    approvalStatus.toLowerCase()
            );
            
            sendEmail(EmailRequest.builder()
                    .to(employee.getEmail())
                    .subject(subject)
                    .body(body)
                    .isHtml(false)
                    .build());
        } catch (Exception e) {
            log.error("Error sending leave approval notification", e);
        }
    }
    
    @Override
    public void notifyPerformanceLowScore(Long employeeId, double averageScore) {
        try {
            Employee employee = employeeRepository.findById(employeeId)
                    .orElse(null);
            
            if (employee == null) {
                log.warn("Employee not found: {}", employeeId);
                return;
            }
            
            String subject = "Performance Review Alert";
            String body = String.format(
                    "Dear HR Team,\n\n" +
                    "This is to notify you that employee %s %s has received a low performance score of %.2f in their recent evaluation.\n\n" +
                    "Please consider scheduling a review meeting to discuss areas for improvement.\n\n" +
                    "Best regards,\nERP System",
                    employee.getFirstName(),
                    employee.getLastName(),
                    averageScore
            );
            
            // Get all HR users
            sendEmail(EmailRequest.builder()
                    .to("hr@company.com")
                    .subject(subject)
                    .body(body)
                    .isHtml(false)
                    .build());
        } catch (Exception e) {
            log.error("Error sending performance alert notification", e);
        }
    }
    
    @Override
    public void notifyBirthdayReminder(Long employeeId, String employeeName) {
        try {
            String subject = String.format("Birthday Reminder: %s", employeeName);
            String body = String.format(
                    "Dear HR Team,\n\n" +
                    "This is a reminder that today is the birthday of %s.\n\n" +
                    "Please consider sending birthday wishes or organizing a small celebration.\n\n" +
                    "Best regards,\nERP System",
                    employeeName
            );
            
            sendEmail(EmailRequest.builder()
                    .to("hr@company.com")
                    .subject(subject)
                    .body(body)
                    .isHtml(false)
                    .build());
        } catch (Exception e) {
            log.error("Error sending birthday reminder notification", e);
        }
    }
    
    @Override
    public void notifyResignationAcknowledgment(Long employeeId, String employeeName) {
        try {
            Employee employee = employeeRepository.findById(employeeId)
                    .orElse(null);
            
            if (employee == null) {
                log.warn("Employee not found: {}", employeeId);
                return;
            }
            
            String subject = "Resignation Acknowledgment";
            String body = String.format(
                    "Dear %s,\n\n" +
                    "We acknowledge receipt of your resignation request.\n\n" +
                    "Our HR team will be in touch with you within 24 hours to discuss the next steps and ensure a smooth transition.\n\n" +
                    "Thank you for your service.\n\n" +
                    "Best regards,\nHuman Resources Team",
                    employee.getFirstName()
            );
            
            sendEmail(EmailRequest.builder()
                    .to(employee.getEmail())
                    .subject(subject)
                    .body(body)
                    .isHtml(false)
                    .build());
        } catch (Exception e) {
            log.error("Error sending resignation acknowledgment", e);
        }
    }
    
    @Override
    public void notifyExitProcessUpdate(Long employeeId, String checklistItem, boolean completed) {
        try {
            Employee employee = employeeRepository.findById(employeeId)
                    .orElse(null);
            
            if (employee == null) {
                log.warn("Employee not found: {}", employeeId);
                return;
            }
            
            String status = completed ? "completed" : "pending";
            String subject = String.format("Exit Process Update - %s", checklistItem);
            String body = String.format(
                    "Dear HR Team,\n\n" +
                    "The exit checklist item '%s' for %s %s has been marked as %s.\n\n" +
                    "Please review the exit checklist to ensure all items are completed before final termination.\n\n" +
                    "Best regards,\nERP System",
                    checklistItem,
                    employee.getFirstName(),
                    employee.getLastName(),
                    status
            );
            
            sendEmail(EmailRequest.builder()
                    .to("hr@company.com")
                    .subject(subject)
                    .body(body)
                    .isHtml(false)
                    .build());
        } catch (Exception e) {
            log.error("Error sending exit process notification", e);
        }
    }
}
