package com.company.erp.recruitment.repository;

import com.company.erp.recruitment.entity.EmailAuditLog;
import com.company.erp.recruitment.entity.JobApplication;
import com.company.erp.recruitment.entity.RecruitmentStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EmailAuditLogRepository extends JpaRepository<EmailAuditLog, Long> {
    List<EmailAuditLog> findByJobApplication(JobApplication jobApplication);
    
    List<EmailAuditLog> findByCompanyIdAndStage(Long companyId, RecruitmentStage stage);
    
    List<EmailAuditLog> findByCompanyIdAndSentAtBetween(
        Long companyId,
        LocalDateTime startDate,
        LocalDateTime endDate
    );
    
    List<EmailAuditLog> findByRecipientEmail(String recipientEmail);
}
