package com.company.erp.performance.service;

import com.company.erp.performance.dto.PerformanceEvaluationDTO;
import java.util.List;

public interface PerformanceService {
    
    PerformanceEvaluationDTO createEvaluation(PerformanceEvaluationDTO evaluationDTO);
    
    PerformanceEvaluationDTO updateEvaluation(Long id, PerformanceEvaluationDTO evaluationDTO);
    
    void deleteEvaluation(Long id);
    
    PerformanceEvaluationDTO getEvaluationById(Long id);
    
    List<PerformanceEvaluationDTO> getEvaluationsByEmployeeId(Long employeeId);
    
    List<PerformanceEvaluationDTO> getEvaluationsByEvaluatorId(Long evaluatorId);
    
    List<PerformanceEvaluationDTO> getAllEvaluations();
}
