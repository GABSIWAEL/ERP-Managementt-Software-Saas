package com.company.erp.common.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Swagger/OpenAPI Configuration for ERP System
 * Configures the OpenAPI documentation for all REST endpoints
 */
@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .components(new Components()
                        .addSecuritySchemes("bearer-jwt",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("JWT authentication token")))
                .addSecurityItem(new SecurityRequirement().addList("bearer-jwt"))
                .info(new Info()
                        .title("Company ERP System - REST API")
                        .version("1.0.0")
                        .description("""
                                Comprehensive REST API documentation for the Company ERP System.
                                
                                This API provides complete CRUD operations and business logic for:
                                - Employee Management
                                - Department Management
                                - Leave Management
                                - Attendance Tracking
                                - Payroll Processing
                                - Performance Reviews
                                - Assets Management
                                - Event Management
                                - Holiday Calendars
                                - Employee Exits/Resignations
                                - Remote Work Requests
                                - Recruitment & Candidates
                                - Audit Logging
                                - Accounting Parameters
                                - Advanced Reporting
                                
                                All endpoints require JWT authentication except for the login and register endpoints.
                                """)
                        .contact(new Contact()
                                .name("Company ERP Support")
                                .email("support@company.com")
                                .url("https://company.com"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0.html")));
    }
}
