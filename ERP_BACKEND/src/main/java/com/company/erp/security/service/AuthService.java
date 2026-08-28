package com.company.erp.security.service;

import com.company.erp.security.dto.LoginRequest;
import com.company.erp.security.dto.LoginResponse;
import com.company.erp.security.dto.RegisterRequest;
import com.company.erp.security.dto.RegisterResponse;
import com.company.erp.security.dto.PasswordChangeRequest;
import com.company.erp.security.dto.PasswordChangeResponse;

public interface AuthService {

    LoginResponse login(LoginRequest loginRequest);

    RegisterResponse register(RegisterRequest registerRequest);

    PasswordChangeResponse changePassword(PasswordChangeRequest passwordChangeRequest);

}
