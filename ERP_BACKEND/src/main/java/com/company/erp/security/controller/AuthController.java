package com.company.erp.security.controller;

import com.company.erp.common.dto.ApiResponse;
import com.company.erp.employee.entity.Employee;
import com.company.erp.employee.repository.EmployeeRepository;
import com.company.erp.security.dto.LoginRequest;
import com.company.erp.security.dto.LoginResponse;
import com.company.erp.security.dto.RegisterRequest;
import com.company.erp.security.dto.RegisterResponse;
import com.company.erp.security.dto.PasswordChangeRequest;
import com.company.erp.security.dto.PasswordChangeResponse;
import com.company.erp.security.entity.User;
import com.company.erp.security.repository.UserRepository;
import com.company.erp.security.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthService authService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EmployeeRepository employeeRepository;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest loginRequest,
            HttpServletResponse response) {
        log.info("Login attempt for user: {}", loginRequest.getUsername());
        LoginResponse loginResponse = authService.login(loginRequest);
        
        // Set JWT token as httpOnly cookie
        String cookieValue = String.format(
            "erp_token=%s; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400",
            loginResponse.getToken()
        );
        response.addHeader("Set-Cookie", cookieValue);
        
        return ResponseEntity.ok()
                .body(ApiResponse.success(loginResponse, "Login successful"));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(@Valid @RequestBody RegisterRequest registerRequest) {
        log.info("Registration attempt for user: {}", registerRequest.getUsername());
        RegisterResponse response = authService.register(registerRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "User registered successfully"));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        log.info("Getting current user info: {}", authentication.getName());
        
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("username", authentication.getName());
        
        // Extract role from authorities
        String role = authentication.getAuthorities().stream()
                .findFirst()
                .map(auth -> auth.getAuthority().replace("ROLE_", ""))
                .orElse("USER");
        
        userInfo.put("role", role);
        
        // Get user ID and employee ID for the current user
        Optional<User> userOptional = userRepository.findByUsername(authentication.getName());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            userInfo.put("id", user.getId());
            
            // Try to find associated employee
            Optional<Employee> employeeOptional = employeeRepository.findByUserId(user.getId());
            if (employeeOptional.isPresent()) {
                Employee employee = employeeOptional.get();
                userInfo.put("email", employee.getEmail());
                userInfo.put("employeeId", employee.getId());
                // Preserve the existing frontend contract for employee users
                userInfo.put("id", employee.getId());
            }
        }
        
        return ResponseEntity.ok()
                .body(ApiResponse.success(userInfo, "Current user retrieved successfully"));
    }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PasswordChangeResponse>> changePassword(
            @Valid @RequestBody PasswordChangeRequest passwordChangeRequest) {
        log.info("Password change request received");
        PasswordChangeResponse response = authService.changePassword(passwordChangeRequest);
        return ResponseEntity.ok()
                .body(ApiResponse.success(response, "Password changed successfully"));
    }

    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> logout(HttpServletResponse response) {
        log.info("Logout request received");
        
        // Clear the httpOnly cookie by setting Max-Age to 0
        String clearCookie = "erp_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0";
        response.addHeader("Set-Cookie", clearCookie);
        
        return ResponseEntity.ok()
                .body(ApiResponse.success(null, "Logout successful"));
    }

}
