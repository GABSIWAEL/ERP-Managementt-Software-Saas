package com.company.erp.performance.service.impl;

import com.company.erp.audit.entity.AuditLog;
import com.company.erp.audit.repository.AuditLogRepository;
import com.company.erp.common.exception.ResourceNotFoundException;
import com.company.erp.employee.entity.Employee;
import com.company.erp.employee.repository.EmployeeRepository;
import com.company.erp.performance.dto.PerformanceEvaluationDTO;
import com.company.erp.performance.entity.PerformanceEvaluation;
import com.company.erp.performance.repository.PerformanceEvaluationRepository;
import com.company.erp.performance.service.PerformanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PerformanceServiceImpl implements PerformanceService {
    
    private final PerformanceEvaluationRepository performanceEvaluationRepository;
    private final EmployeeRepository employeeRepository;
    private final AuditLogRepository auditLogRepository;
    
    @Override
    public PerformanceEvaluationDTO createEvaluation(PerformanceEvaluationDTO evaluationDTO) {
        log.info("Creating performance evaluation for employee ID: {}", evaluationDTO.getEmployeeId());
        
        Employee employee = employeeRepository.findById(evaluationDTO.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        
        Employee evaluator = employeeRepository.findById(evaluationDTO.getEvaluatorId())
                .orElseThrow(() -> new ResourceNotFoundException("Evaluator not found"));
        
        PerformanceEvaluation evaluation = PerformanceEvaluation.builder()
                .employee(employee)
                .evaluator(evaluator)
                .technicalScore(evaluationDTO.getTechnicalScore())
                .teamworkScore(evaluationDTO.getTeamworkScore())
                .productivityScore(evaluationDTO.getProductivityScore())
                .comments(evaluationDTO.getComments())
                .evaluationDate(LocalDateTime.now())
                .build();
        
        evaluation = performanceEvaluationRepository.save(evaluation);
        
        auditLogRepository.save(AuditLog.builder()
                .action("PERFORMANCE_EVALUATION_CREATED")
                .entityName("PerformanceEvaluation")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Performance evaluation created")
                .build());
        
        return mapToDTO(evaluation);
    }
    
    @Override
    public PerformanceEvaluationDTO updateEvaluation(Long id, PerformanceEvaluationDTO evaluationDTO) {
        log.info("Updating performance evaluation with ID: {}", id);
        
        PerformanceEvaluation evaluation = performanceEvaluationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evaluation not found"));
        
        evaluation.setTechnicalScore(evaluationDTO.getTechnicalScore());
        evaluation.setTeamworkScore(evaluationDTO.getTeamworkScore());
        evaluation.setProductivityScore(evaluationDTO.getProductivityScore());
        evaluation.setComments(evaluationDTO.getComments());
        
        evaluation = performanceEvaluationRepository.save(evaluation);
        
        auditLogRepository.save(AuditLog.builder()
                .action("PERFORMANCE_EVALUATION_UPDATED")
                .entityName("PerformanceEvaluation")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Performance evaluation updated")
                .build());
        
        return mapToDTO(evaluation);
    }
    
    @Override
    public void deleteEvaluation(Long id) {
        log.info("Deleting performance evaluation with ID: {}", id);
        
        PerformanceEvaluation evaluation = performanceEvaluationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evaluation not found"));
        
        performanceEvaluationRepository.delete(evaluation);
        
        auditLogRepository.save(AuditLog.builder()
                .action("PERFORMANCE_EVALUATION_DELETED")
                .entityName("PerformanceEvaluation")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Performance evaluation deleted")
                .build());
    }
    
    @Override
    @Transactional(readOnly = true)
    public PerformanceEvaluationDTO getEvaluationById(Long id) {
        PerformanceEvaluation evaluation = performanceEvaluationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evaluation not found"));
        return mapToDTO(evaluation);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PerformanceEvaluationDTO> getEvaluationsByEmployeeId(Long employeeId) {
        log.info("Fetching evaluations for employee ID: {}", employeeId);
        return performanceEvaluationRepository.findByEmployeeId(employeeId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PerformanceEvaluationDTO> getEvaluationsByEvaluatorId(Long evaluatorId) {
        log.info("Fetching evaluations by evaluator ID: {}", evaluatorId);
        return performanceEvaluationRepository.findByEvaluatorId(evaluatorId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PerformanceEvaluationDTO> getAllEvaluations() {
        log.info("Fetching all performance evaluations");
        return performanceEvaluationRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    private PerformanceEvaluationDTO mapToDTO(PerformanceEvaluation evaluation) {
        return PerformanceEvaluationDTO.builder()
                .id(evaluation.getId())
                .employeeId(evaluation.getEmployee().getId())
                .evaluatorId(evaluation.getEvaluator().getId())
                .technicalScore(evaluation.getTechnicalScore())
                .teamworkScore(evaluation.getTeamworkScore())
                .productivityScore(evaluation.getProductivityScore())
                .comments(evaluation.getComments())
                .evaluationDate(evaluation.getEvaluationDate())
                .createdAt(evaluation.getCreatedAt())
                .updatedAt(evaluation.getUpdatedAt())
                .build();
    }
    
    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "SYSTEM";
    }
}
