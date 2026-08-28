package com.company.erp.exit.repository;

import com.company.erp.exit.entity.ExitChecklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExitChecklistRepository extends JpaRepository<ExitChecklist, Long> {
    
    ExitChecklist findByResignationId(Long resignationId);
}
