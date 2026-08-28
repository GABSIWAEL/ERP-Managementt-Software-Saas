package com.company.erp.common.config;

import com.company.erp.common.enums.UserRole;
import com.company.erp.security.entity.User;
import com.company.erp.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * DataInitializer - Initialize default system data on application startup
 * 
 * This component creates:
 * 1. Default ADMIN user for system bootstrap
 * 2. Default test users for each role
 * 
 * @author System
 * @version 1.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Initialize data after application is ready
     */
    @EventListener(ApplicationReadyEvent.class)
    public void initializeData() {
        log.info("========== DATA INITIALIZER STARTING ==========");
        try {
            ensureTestUser("admin", "admin123", UserRole.ADMIN, "ADMIN");
            ensureTestUser("hr_user", "hr123", UserRole.HR, "HR");
            ensureTestUser("manager_user", "manager123", UserRole.MANAGER, "Manager");
            ensureTestUser("employee_user", "employee123", UserRole.EMPLOYEE, "Employee");
            ensureTestUser("accountant_user", "accountant123", UserRole.ACCOUNTANT, "Accountant");
            log.info("========== DATA INITIALIZER COMPLETED ==========");
        } catch (Exception e) {
            log.error("❌ Error during data initialization", e);
            throw new RuntimeException("Data initialization failed", e);
        }
    }

    /**
     * Create or update a test user for development/testing
     */
    private void ensureTestUser(String username, String rawPassword, UserRole role, String label) {
        userRepository.findByUsername(username).ifPresentOrElse(existingUser -> {
            if (!passwordEncoder.matches(rawPassword, existingUser.getPassword())) {
                existingUser.setPassword(passwordEncoder.encode(rawPassword));
                existingUser.setEnabled(true);
                existingUser.setUpdatedAt(LocalDateTime.now());
                userRepository.save(existingUser);
                log.info("✅ Updated existing {} user password: {}", label, username);
            } else {
                log.info("ℹ️  Existing {} user already has the expected password: {}", label, username);
            }
        }, () -> {
            log.info("Creating default {} user...", label);
            User newUser = new User();
            newUser.setUsername(username);
            newUser.setPassword(passwordEncoder.encode(rawPassword));
            newUser.setRole(role);
            newUser.setEnabled(true);
            LocalDateTime now = LocalDateTime.now();
            newUser.setCreatedAt(now);
            newUser.setUpdatedAt(now);
            userRepository.save(newUser);
            log.info("✅ Default {} user created successfully!", label);
            log.info("   Username: {}", username);
            log.info("   Password: {}", rawPassword);
        });
    }
}
