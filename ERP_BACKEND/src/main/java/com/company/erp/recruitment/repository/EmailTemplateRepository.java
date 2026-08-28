package com.company.erp.recruitment.repository;

import com.company.erp.recruitment.entity.EmailTemplate;
import com.company.erp.recruitment.entity.RecruitmentStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailTemplateRepository extends JpaRepository<EmailTemplate, Long> {
    Optional<EmailTemplate> findByStageAndCompanyIdAndIsActiveTrue(RecruitmentStage stage, Long companyId);
    
    Optional<EmailTemplate> findByStageAndCompanyId(RecruitmentStage stage, Long companyId);
}
