package com.company.erp.security.filter;

import com.company.erp.security.entity.User;
import com.company.erp.security.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Filter to enforce password change on first login.
 * If user hasn't changed their password, they can only access:
 * - /api/auth/change-password
 * - /api/auth/logout
 * - /api/auth/me (to check their status)
 * - /api/health (health check)
 */
@Slf4j
@RequiredArgsConstructor
public class PasswordChangeFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    // Endpoints that should be accessible even if password hasn't been changed
    private static final String[] EXEMPT_PATHS = {
        "/api/auth/login",
        "/api/auth/logout",
        "/api/auth/change-password",
        "/api/auth/me",
        "/api/auth/register",
        "/api/health",
        "/api/actuator"
    };

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String requestPath = request.getRequestURI();
        
        // Check if the current path is exempt
        if (isExemptPath(requestPath)) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // Check if user is authenticated
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            filterChain.doFilter(request, response);
            return;
        }
        
        String username = authentication.getName();
        Optional<User> userOptional = userRepository.findByUsername(username);
        
        if (userOptional.isEmpty()) {
            log.warn("[PASSWORD_CHANGE_FILTER] User {} not found in database", username);
            filterChain.doFilter(request, response);
            return;
        }
        
        User user = userOptional.get();
        
        // If password hasn't been changed, block access to protected endpoints
        if (!user.getPasswordChanged()) {
            log.warn("[PASSWORD_CHANGE_FILTER] User {} must change password before accessing {}",
                    username, requestPath);
            
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "PASSWORD_CHANGE_REQUIRED");
            errorResponse.put("message", "Password must be changed before accessing the system");
            errorResponse.put("code", 403);
            
            response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
            return;
        }
        
        // Password has been changed, allow request to proceed
        filterChain.doFilter(request, response);
    }

    private boolean isExemptPath(String path) {
        for (String exemptPath : EXEMPT_PATHS) {
            if (path.startsWith(exemptPath)) {
                return true;
            }
        }
        return false;
    }
}
