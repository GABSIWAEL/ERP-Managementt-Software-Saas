package com.company.erp.recruitment.repository;

import com.company.erp.recruitment.entity.JobApplication;
import com.company.erp.recruitment.entity.JobApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    Page<JobApplication> findByJobOfferId(Long jobOfferId, Pageable pageable);
    Page<JobApplication> findByStatus(JobApplicationStatus status, Pageable pageable);
    List<JobApplication> findByJobOfferIdAndStatus(Long jobOfferId, JobApplicationStatus status);
    Page<JobApplication> findByEmail(String email, Pageable pageable);
    Long countByJobOfferIdAndStatus(Long jobOfferId, JobApplicationStatus status);
    Boolean existsByJobOfferIdAndEmail(Long jobOfferId, String email);
    Page<JobApplication> findByApplicantNameContainingIgnoreCase(String name, Pageable pageable);
}
