package com.company.erp.exit.controller;

import com.company.erp.common.dto.ApiResponse;
import com.company.erp.exit.dto.ResignationRequestDTO;
import com.company.erp.exit.service.EmployeeExitService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Alternative REST endpoint for resignations
 * Maps /api/resignations to EmployeeExitService resignation endpoints
 * This controller provides an alias for /api/exit/resign endpoints
 */
@Slf4j
@RestController
@RequestMapping("/api/resignations")
@RequiredArgsConstructor
public class ResignationsAliasController {
    
    private final EmployeeExitService exitService;
    
    @GetMapping
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<ApiResponse<List<ResignationRequestDTO>>> getAllResignations() {
        log.info("GET /api/resignations - Fetching all resignations");
        List<ResignationRequestDTO> resignations = exitService.getAllResignations();
        return ResponseEntity.ok(ApiResponse.success(resignations, "All resignations retrieved successfully"));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('HR')")
    public ResponseEntity<ApiResponse<ResignationRequestDTO>> getResignation(@PathVariable Long id) {
        log.info("GET /api/resignations/{} - Fetching resignation", id);
        ResignationRequestDTO resignation = exitService.getResignationById(id);
        return ResponseEntity.ok(ApiResponse.success(resignation, "Resignation retrieved successfully"));
    }
}
