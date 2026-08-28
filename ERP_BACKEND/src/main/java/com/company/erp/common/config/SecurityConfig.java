package com.company.erp.common.config;

import com.company.erp.common.enums.UserRole;
import com.company.erp.security.filter.JwtAuthenticationFilter;
import com.company.erp.security.filter.PasswordChangeFilter;
import com.company.erp.security.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Arrays;

@Slf4j
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private UserRepository userRepository;

    @Bean
    public PasswordChangeFilter passwordChangeFilter(ObjectMapper objectMapper) {
        return new PasswordChangeFilter(userRepository, objectMapper);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:8080", "http://localhost:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, PasswordChangeFilter passwordChangeFilter) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/api/health").permitAll()
                        .requestMatchers("/api/job-offers/public/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/job-applications").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/job-applications/check-duplicate").permitAll()
                        .requestMatchers("/api/actuator/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/attendance/events").permitAll()
                        .requestMatchers("/api/attendance/events").permitAll()
                        // Swagger UI & OpenAPI endpoints
                        .requestMatchers("/swagger-ui.html").permitAll()
                        .requestMatchers("/swagger-ui/**").permitAll()
                        .requestMatchers("/v3/api-docs").permitAll()
                        .requestMatchers("/v3/api-docs/**").permitAll()
                        .requestMatchers("/swagger-resources").permitAll()
                        .requestMatchers("/swagger-resources/**").permitAll()
                        .requestMatchers("/webjars/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/employees").hasAnyRole(
                                UserRole.ADMIN.name(), UserRole.HR.name(), UserRole.MANAGER.name(), UserRole.ACCOUNTANT.name(), UserRole.EMPLOYEE.name())
                        .requestMatchers(HttpMethod.GET, "/api/employees/**").hasAnyRole(
                                UserRole.ADMIN.name(), UserRole.HR.name(), UserRole.MANAGER.name(), UserRole.ACCOUNTANT.name(), UserRole.EMPLOYEE.name())
                        .requestMatchers(HttpMethod.POST, "/api/employees/**").hasAnyRole(UserRole.HR.name(), UserRole.ADMIN.name())
                        .requestMatchers(HttpMethod.PUT, "/api/employees/**").hasAnyRole(UserRole.HR.name(), UserRole.ADMIN.name())
                        .requestMatchers(HttpMethod.DELETE, "/api/employees/**").hasRole(UserRole.ADMIN.name())
                        .requestMatchers("/api/departments/**").hasAnyRole(UserRole.ADMIN.name(), UserRole.HR.name(), UserRole.MANAGER.name())
                        .requestMatchers("/api/holidays/**").hasAnyRole(UserRole.ADMIN.name(), UserRole.HR.name())
                        .requestMatchers("/api/leaves/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/attendance/events").permitAll()
                        .requestMatchers("/api/attendance/**").authenticated()
                        .requestMatchers("/api/remote-work/**").authenticated()
                        .requestMatchers("/api/accounting-parameters/**").hasRole(UserRole.ACCOUNTANT.name())
                        .requestMatchers("/api/payroll/**").hasAnyRole(UserRole.ACCOUNTANT.name(), UserRole.ADMIN.name())
                        .requestMatchers("/api/performance/**").hasAnyRole(UserRole.HR.name(), UserRole.MANAGER.name(), UserRole.ADMIN.name())
                        .requestMatchers("/api/warnings/**").hasAnyRole(UserRole.HR.name(), UserRole.ADMIN.name(), UserRole.MANAGER.name(), UserRole.EMPLOYEE.name())
                        .requestMatchers(HttpMethod.GET, "/api/assets/employee/**").hasAnyRole(UserRole.ADMIN.name(), UserRole.HR.name(), UserRole.MANAGER.name(), UserRole.ACCOUNTANT.name(), UserRole.EMPLOYEE.name())
                        .requestMatchers(HttpMethod.GET, "/api/assets/status/**").hasAnyRole(UserRole.ADMIN.name(), UserRole.HR.name(), UserRole.ACCOUNTANT.name())
                        .requestMatchers(HttpMethod.GET, "/api/assets/*").hasAnyRole(UserRole.ADMIN.name(), UserRole.HR.name(), UserRole.MANAGER.name(), UserRole.ACCOUNTANT.name(), UserRole.EMPLOYEE.name())
                        .requestMatchers(HttpMethod.GET, "/api/assets").hasAnyRole(UserRole.ADMIN.name(), UserRole.HR.name(), UserRole.MANAGER.name(), UserRole.ACCOUNTANT.name())
                        .requestMatchers(HttpMethod.POST, "/api/assets").hasAnyRole(UserRole.ADMIN.name(), UserRole.ACCOUNTANT.name())
                        .requestMatchers(HttpMethod.PUT, "/api/assets/*").hasAnyRole(UserRole.ADMIN.name(), UserRole.ACCOUNTANT.name())
                        .requestMatchers(HttpMethod.DELETE, "/api/assets/*").hasAnyRole(UserRole.ADMIN.name(), UserRole.ACCOUNTANT.name())
                        .requestMatchers(HttpMethod.POST, "/api/assets/*/assign/*").hasAnyRole(UserRole.ADMIN.name(), UserRole.ACCOUNTANT.name())
                        .requestMatchers(HttpMethod.POST, "/api/assets/*/return").hasAnyRole(UserRole.ADMIN.name(), UserRole.ACCOUNTANT.name())
                        .requestMatchers(HttpMethod.POST, "/api/assets/*/mark-damaged").hasAnyRole(UserRole.ADMIN.name(), UserRole.ACCOUNTANT.name())
                        .requestMatchers(HttpMethod.POST, "/api/assets/*/mark-sold").hasAnyRole(UserRole.ADMIN.name(), UserRole.ACCOUNTANT.name())
                        .requestMatchers("/api/assets/**").hasAnyRole(UserRole.ADMIN.name(), UserRole.ACCOUNTANT.name())
                        .requestMatchers("/api/asset-requests/**").hasAnyRole(UserRole.ADMIN.name(), UserRole.MANAGER.name(), UserRole.ACCOUNTANT.name(), UserRole.EMPLOYEE.name())
                        .requestMatchers("/api/candidates/**").hasAnyRole(UserRole.HR.name(), UserRole.ADMIN.name())
                        .requestMatchers("/api/events/**").authenticated()
                        .requestMatchers("/api/audit-logs/**").hasRole(UserRole.ADMIN.name())
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(passwordChangeFilter, JwtAuthenticationFilter.class);

        return http.build();
    }

}
