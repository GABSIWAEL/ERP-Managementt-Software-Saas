package com.company.erp.audit.aspect;

import com.company.erp.audit.entity.AuditLog;
import com.company.erp.audit.repository.AuditLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class AuditAspect {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    // Pointcut for all controller methods
    @Pointcut("execution(public * com.company.erp..*Controller.*(..))")
    public void allControllers() {
    }

    // Pointcut for POST/PUT/DELETE methods (data modification)
    @Pointcut("allControllers() && (execution(public * *create*(..)) || execution(public * *save*(..)) || execution(public * *update*(..)) || execution(public * *delete*(..)) || execution(public * *add*(..)) || execution(public * *remove*(..)) || execution(public * *close*(..)) || execution(public * *archive*(..)))")
    public void dataModifyingMethods() {
    }

    // Pointcut for GET methods (data retrieval)
    @Pointcut("allControllers() && (execution(public * *get*(..)) || execution(public * *list*(..)) || execution(public * *fetch*(..)) || execution(public * *search*(..)) || execution(public * *find*(..)))")
    public void dataRetrievalMethods() {
    }

    /**
     * Log after successful data modification (CREATE, UPDATE, DELETE)
     */
    @AfterReturning(pointcut = "dataModifyingMethods()", returning = "result")
    public void logAfterDataModification(JoinPoint joinPoint, Object result) {
        try {
            String action = determineAction(joinPoint.getSignature().getName());
            String entityName = extractEntityName(joinPoint);
            String performedBy = getCurrentUsername();
            String ipAddress = getClientIpAddress();
            String entityDetails = extractEntityDetails(result);

            // Human-readable format: "{User} {action} {EntityName} ({EntityDetails})"
            String details = String.format(
                "%s %s %s%s",
                performedBy,
                getHumanReadableAction(action),
                entityName,
                entityDetails.isEmpty() ? "" : " " + entityDetails
            );

            AuditLog auditLog = AuditLog.builder()
                    .action(action)
                    .entityName(entityName)
                    .performedBy(performedBy)
                    .timestamp(LocalDateTime.now())
                    .details(details)
                    .ipAddress(ipAddress)
                    .build();

            auditLogRepository.save(auditLog);
            log.info("Audit LOG [{}] - {}", action, details);

        } catch (Exception e) {
            log.error("Error logging audit trail", e);
        }
    }

    /**
     * Log after throwing exceptions during data modification
     */
    @AfterThrowing(pointcut = "dataModifyingMethods()", throwing = "exception")
    public void logAfterException(JoinPoint joinPoint, Exception exception) {
        try {
            String action = "ERROR_" + determineAction(joinPoint.getSignature().getName());
            String entityName = extractEntityName(joinPoint);
            String performedBy = getCurrentUsername();
            String ipAddress = getClientIpAddress();
            String entityDetails = extractEntityDetailsFromRequest(joinPoint);

            // Human-readable format: "{User} failed to {action} {Entity} ({EntityDetails})"
            String details = String.format(
                "%s failed to %s %s%s",
                performedBy,
                getHumanReadableAction(action.replace("ERROR_", "")).toLowerCase(),
                entityName,
                entityDetails.isEmpty() ? "" : " " + entityDetails
            );

            AuditLog auditLog = AuditLog.builder()
                    .action(action)
                    .entityName(entityName)
                    .performedBy(performedBy)
                    .timestamp(LocalDateTime.now())
                    .details(details)
                    .ipAddress(ipAddress)
                    .build();

            auditLogRepository.save(auditLog);
            log.warn("Audit LOG [FAILED] - {}", details);

        } catch (Exception e) {
            log.error("Error logging audit trail for exception", e);
        }
    }

    /**
     * Determine the action type based on method name
     */
    private String determineAction(String methodName) {
        String method = methodName.toLowerCase();

        if (method.contains("delete") || method.contains("remove")) {
            return "DELETE";
        } else if (method.contains("update") || method.contains("put")) {
            return "UPDATE";
        } else if (method.contains("create") || method.contains("save") || method.contains("add")) {
            return "CREATE";
        } else if (method.contains("close") || method.contains("archive")) {
            return "STATUS_CHANGE";
        } else if (method.contains("get") || method.contains("list") || method.contains("fetch") || method.contains("search") || method.contains("find")) {
            return "READ";
        }
        return "OPERATION";
    }

    /**
     * Convert action code to human-readable verb
     * CREATE -> created, UPDATE -> updated, DELETE -> deleted, etc.
     */
    private String getHumanReadableAction(String action) {
        switch (action) {
            case "CREATE":
                return "created";
            case "UPDATE":
                return "updated";
            case "DELETE":
                return "deleted";
            case "READ":
                return "read";
            case "STATUS_CHANGE":
                return "changed status of";
            default:
                return "operated on";
        }
    }

    /**
     * Extract entity name from controller class name
     * Example: EmployeeController -> Employee
     */
    private String extractEntityName(JoinPoint joinPoint) {
        String className = joinPoint.getTarget().getClass().getSimpleName();
        return className.replace("Controller", "");
    }

    /**
     * Get current authenticated username
     */
    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName();
        }
        return "ANONYMOUS";
    }

    /**
     * Get and mask client IP address from request
     * Masks the last octet for privacy: 192.168.1.100 -> 192.168.1.***
     */
    private String getClientIpAddress() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String xForwardedFor = request.getHeader("X-Forwarded-For");
                String ipAddress;
                if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                    ipAddress = xForwardedFor.split(",")[0].trim();
                } else {
                    ipAddress = request.getRemoteAddr();
                }
                return maskIpAddress(ipAddress);
            }
        } catch (Exception e) {
            log.debug("Could not get client IP", e);
        }
        return "MASKED";
    }

    /**
     * Mask IP address for privacy - keep first 3 octets, mask the last one
     * Example: 192.168.1.100 -> 192.168.1.***
     * Docker IPs like 172.18.0.1 -> 172.18.0.***
     */
    private String maskIpAddress(String ipAddress) {
        if (ipAddress == null || ipAddress.isEmpty()) {
            return "MASKED";
        }
        String[] octets = ipAddress.split("\\.");
        if (octets.length == 4) {
            return octets[0] + "." + octets[1] + "." + octets[2] + ".***";
        }
        return "MASKED";
    }

    /**
     * Extract entity details (name, title, etc.) from response object
     * Tries to get name, title, username, departmentName fields
     * Returns format like: "(IT Department)" or "(John Doe)"
     */
    private String extractEntityDetails(Object result) {
        if (result == null) {
            return "";
        }
        
        try {
            // Try multiple common field names for entity descriptions
            String[] fieldNames = {"name", "title", "username", "departmentName", "employeeName", 
                                   "firstName", "lastName", "candidateName", "projectName", "roleName", "email"};
            
            for (String fieldName : fieldNames) {
                try {
                    String methodName = "get" + fieldName.substring(0, 1).toUpperCase() + fieldName.substring(1);
                    var method = result.getClass().getMethod(methodName);
                    Object value = method.invoke(result);
                    if (value != null && !value.toString().isEmpty()) {
                        return "(" + value.toString() + ")";
                    }
                } catch (Exception ignored) {
                    // Field doesn't exist, try next one
                }
            }
        } catch (Exception e) {
            log.debug("Could not extract entity details", e);
        }
        
        return "";
    }

    /**
     * Extract entity details from request parameters
     * Useful for failed operations where we don't have response object
     */
    private String extractEntityDetailsFromRequest(JoinPoint joinPoint) {
        try {
            Object[] args = joinPoint.getArgs();
            if (args != null && args.length > 0) {
                Object firstArg = args[0];
                if (firstArg != null) {
                    return extractEntityDetails(firstArg);
                }
            }
        } catch (Exception e) {
            log.debug("Could not extract entity details from request", e);
        }
        return "";
    }
}
