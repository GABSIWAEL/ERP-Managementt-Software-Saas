package com.company.erp.performance.repository;

import com.company.erp.performance.entity.PerformanceEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PerformanceEvaluationRepository extends JpaRepository<PerformanceEvaluation, Long> {

    List<PerformanceEvaluation> findByEmployeeId(Long employeeId);

    List<PerformanceEvaluation> findByEvaluatorId(Long evaluatorId);

}
