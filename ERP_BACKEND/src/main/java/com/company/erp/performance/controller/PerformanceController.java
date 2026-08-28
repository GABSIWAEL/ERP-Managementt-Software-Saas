package com.company.erp.performance.controller;

import com.company.erp.common.dto.ApiResponse;
import com.company.erp.performance.dto.PerformanceEvaluationDTO;
import com.company.erp.performance.service.PerformanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/performance")
@RequiredArgsConstructor
public class PerformanceController {
    
    private final PerformanceService performanceService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<PerformanceEvaluationDTO>> createEvaluation(
            @Valid @RequestBody PerformanceEvaluationDTO evaluationDTO) {
        log.info("Creating performance evaluation");
        PerformanceEvaluationDTO createdEvaluation = performanceService.createEvaluation(evaluationDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(createdEvaluation, "Evaluation created successfully", 201));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<PerformanceEvaluationDTO>> updateEvaluation(
            @PathVariable Long id,
            @Valid @RequestBody PerformanceEvaluationDTO evaluationDTO) {
        log.info("Updating evaluation with ID: {}", id);
        PerformanceEvaluationDTO updatedEvaluation = performanceService.updateEvaluation(id, evaluationDTO);
        return ResponseEntity.ok(ApiResponse.success(updatedEvaluation, "Evaluation updated successfully"));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteEvaluation(@PathVariable Long id) {
        log.info("Deleting evaluation with ID: {}", id);
        performanceService.deleteEvaluation(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Evaluation deleted successfully"));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PerformanceEvaluationDTO>> getEvaluationById(@PathVariable Long id) {
        log.info("Fetching evaluation with ID: {}", id);
        PerformanceEvaluationDTO evaluation = performanceService.getEvaluationById(id);
        return ResponseEntity.ok(ApiResponse.success(evaluation, "Evaluation fetched successfully"));
    }
    
    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<PerformanceEvaluationDTO>>> getEvaluationsByEmployee(
            @PathVariable Long employeeId) {
        log.info("Fetching evaluations for employee: {}", employeeId);
        List<PerformanceEvaluationDTO> evaluations = performanceService.getEvaluationsByEmployeeId(employeeId);
        return ResponseEntity.ok(ApiResponse.success(evaluations, "Evaluations fetched successfully"));
    }
    
    @GetMapping("/evaluator/{evaluatorId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<PerformanceEvaluationDTO>>> getEvaluationsByEvaluator(
            @PathVariable Long evaluatorId) {
        log.info("Fetching evaluations by evaluator: {}", evaluatorId);
        List<PerformanceEvaluationDTO> evaluations = performanceService.getEvaluationsByEvaluatorId(evaluatorId);
        return ResponseEntity.ok(ApiResponse.success(evaluations, "Evaluations fetched successfully"));
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<List<PerformanceEvaluationDTO>>> getAllEvaluations() {
        log.info("Fetching all evaluations");
        List<PerformanceEvaluationDTO> evaluations = performanceService.getAllEvaluations();
        return ResponseEntity.ok(ApiResponse.success(evaluations, "Evaluations fetched successfully"));
    }
}
