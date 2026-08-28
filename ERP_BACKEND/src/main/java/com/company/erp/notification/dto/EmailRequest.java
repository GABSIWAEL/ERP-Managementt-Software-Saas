package com.company.erp.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * DTO for email request
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailRequest {
    
    private String to;
    private List<String> cc;
    private List<String> bcc;
    private String subject;
    private String body;
    private String templateName;
    private Map<String, Object> templateVariables;
    private boolean isHtml;
}
