package com.company.erp.recruitment.repository;

import com.company.erp.recruitment.entity.InterviewSchedule;
import com.company.erp.recruitment.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InterviewScheduleRepository extends JpaRepository<InterviewSchedule, Long> {
    List<InterviewSchedule> findByJobApplication(JobApplication jobApplication);
    
    List<InterviewSchedule> findByCompanyIdAndScheduledDateTimeBetween(
        Long companyId, 
        LocalDateTime startDate, 
        LocalDateTime endDate
    );
    
    List<InterviewSchedule> findByCompanyIdAndInterviewerEmail(Long companyId, String interviewerEmail);
}
