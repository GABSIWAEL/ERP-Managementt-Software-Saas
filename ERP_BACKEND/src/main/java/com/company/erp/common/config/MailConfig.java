package com.company.erp.common.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

/**
 * Mail configuration for Spring Mail
 * Provides JavaMailSender bean with Gmail SMTP configuration
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class MailConfig {

    @Value("${spring.mail.host:smtp.gmail.com}")
    private String mailHost;

    @Value("${spring.mail.port:587}")
    private int mailPort;

    @Value("${spring.mail.username:your-email@gmail.com}")
    private String mailUsername;

    @Value("${spring.mail.password:your-app-password}")
    private String mailPassword;

    @Value("${spring.mail.from:noreply@company-erp.com}")
    private String mailFrom;

    /**
     * Provides JavaMailSender bean configured for Gmail SMTP
     */
    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        
        // Configure SMTP host and port
        mailSender.setHost(mailHost);
        mailSender.setPort(mailPort);
        mailSender.setUsername(mailUsername);
        mailSender.setPassword(mailPassword);
        mailSender.setDefaultEncoding("UTF-8");

        // Configure mail properties for Gmail
        Properties properties = new Properties();
        properties.put("mail.transport.protocol", "smtp");
        properties.put("mail.smtp.auth", "true");
        properties.put("mail.smtp.starttls.enable", "true");
        properties.put("mail.smtp.starttls.required", "true");
        properties.put("mail.smtp.connectiontimeout", "5000");
        properties.put("mail.smtp.timeout", "5000");
        properties.put("mail.smtp.writetimeout", "5000");
        properties.put("mail.from", mailFrom);
        
        mailSender.setJavaMailProperties(properties);

        log.info("JavaMailSender initialized - Host: {}, Port: {}, Username: {}, From: {}", 
                mailHost, mailPort, mailUsername, mailFrom);
        
        return mailSender;
    }
}
