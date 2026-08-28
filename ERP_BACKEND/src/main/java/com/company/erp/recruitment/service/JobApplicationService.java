package com.company.erp.recruitment.service;

import com.company.erp.recruitment.dto.JobApplicationDTO;
import com.company.erp.recruitment.entity.JobApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface JobApplicationService {
    JobApplicationDTO createApplication(JobApplicationDTO applicationDTO);
    JobApplicationDTO updateApplication(Long id, JobApplicationDTO applicationDTO);
    JobApplicationDTO updateApplicationStatus(Long id, JobApplicationStatus status, String reviewedBy, String reviewNotes);
    JobApplicationDTO getApplicationById(Long id);
    Page<JobApplicationDTO> getAllApplications(Pageable pageable);
    Page<JobApplicationDTO> getApplicationsByJobOffer(Long jobOfferId, Pageable pageable);
    Page<JobApplicationDTO> getApplicationsByStatus(JobApplicationStatus status, Pageable pageable);
    Page<JobApplicationDTO> getApplicationsByApplicantEmail(String email, Pageable pageable);
    Page<JobApplicationDTO> searchApplications(String applicantName, Pageable pageable);
    void deleteApplication(Long id);
    Long countPendingApplications();
    Boolean hasAlreadyApplied(Long jobOfferId, String email);
}
