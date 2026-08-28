package com.company.erp.security.service.impl;

import com.company.erp.common.enums.UserRole;
import com.company.erp.common.exception.BadRequestException;
import com.company.erp.common.exception.BusinessLogicException;
import com.company.erp.security.dto.LoginRequest;
import com.company.erp.security.dto.LoginResponse;
import com.company.erp.security.dto.RegisterRequest;
import com.company.erp.security.dto.RegisterResponse;
import com.company.erp.security.dto.PasswordChangeRequest;
import com.company.erp.security.dto.PasswordChangeResponse;
import com.company.erp.security.entity.User;
import com.company.erp.security.repository.UserRepository;
import com.company.erp.security.service.AuthService;
import com.company.erp.security.util.JwtTokenProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Override
    public LoginResponse login(LoginRequest loginRequest) {
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new BadRequestException("Invalid username or password"));

        if (!user.getEnabled()) {
            throw new BusinessLogicException("Account is disabled");
        }

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid username or password");
        }

        String token = jwtTokenProvider.generateToken(user.getUsername(), user.getRole().name());
        log.info("User {} logged in successfully. Password changed: {}", user.getUsername(), user.getPasswordChanged());

        // Return flag indicating if password change is required
        return new LoginResponse(token, user.getUsername(), user.getRole(), !user.getPasswordChanged());
    }

    @Override
    public RegisterResponse register(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new BusinessLogicException("Username already exists");
        }

        User user = User.builder()
                .username(registerRequest.getUsername())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role(registerRequest.getRole())
                .enabled(true)
                .build();

        // Manually set audit fields for JPA
        user.setCreatedAt(java.time.LocalDateTime.now());
        user.setUpdatedAt(java.time.LocalDateTime.now());

        User savedUser = userRepository.save(user);
        log.info("New user {} registered with role {}", savedUser.getUsername(), savedUser.getRole());

        return RegisterResponse.builder()
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .role(savedUser.getRole())
                .message("User registered successfully")
                .build();
    }

    @Override
    public PasswordChangeResponse changePassword(PasswordChangeRequest passwordChangeRequest) {
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BadRequestException("User not found"));

        // Validate current password
        if (!passwordEncoder.matches(passwordChangeRequest.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        // Validate new password confirmation
        if (!passwordChangeRequest.getNewPassword().equals(passwordChangeRequest.getConfirmPassword())) {
            throw new BadRequestException("New password and confirmation do not match");
        }

        // Validate new password is not same as current
        if (passwordEncoder.matches(passwordChangeRequest.getNewPassword(), user.getPassword())) {
            throw new BadRequestException("New password cannot be the same as current password");
        }

        // Update password and mark as changed
        user.setPassword(passwordEncoder.encode(passwordChangeRequest.getNewPassword()));
        user.setPasswordChanged(true);
        user.setUpdatedAt(java.time.LocalDateTime.now());
        userRepository.save(user);

        log.info("Password changed successfully for user: {}", username);

        return PasswordChangeResponse.builder()
                .success(true)
                .username(username)
                .message("Password changed successfully")
                .build();
    }

}
