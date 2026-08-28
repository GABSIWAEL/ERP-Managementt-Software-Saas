package com.company.erp.security.dto;

import com.company.erp.common.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {

    private String token;
    private String username;
    private UserRole role;
    private String type;
    private Boolean passwordChangeRequired;

    public LoginResponse(String token, String username, UserRole role) {
        this.token = token;
        this.username = username;
        this.role = role;
        this.type = "Bearer";
        this.passwordChangeRequired = false;
    }

    public LoginResponse(String token, String username, UserRole role, Boolean passwordChangeRequired) {
        this.token = token;
        this.username = username;
        this.role = role;
        this.type = "Bearer";
        this.passwordChangeRequired = passwordChangeRequired;
    }

}
