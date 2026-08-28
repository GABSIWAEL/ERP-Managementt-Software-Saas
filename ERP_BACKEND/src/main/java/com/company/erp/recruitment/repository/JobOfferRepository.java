package com.company.erp.recruitment.repository;

import com.company.erp.recruitment.entity.JobOffer;
import com.company.erp.recruitment.entity.JobOfferStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface JobOfferRepository extends JpaRepository<JobOffer, Long> {
    Page<JobOffer> findByStatus(JobOfferStatus status, Pageable pageable);
    Page<JobOffer> findByStatusAndIsActiveTrue(JobOfferStatus status, Pageable pageable);
    List<JobOffer> findByStatusAndIsActiveTrue(JobOfferStatus status);
    Page<JobOffer> findByDepartment(String department, Pageable pageable);
    Page<JobOffer> findByTitleContainingIgnoreCase(String title, Pageable pageable);
    List<JobOffer> findByDeadlineBeforeAndStatus(LocalDateTime deadline, JobOfferStatus status);
    Long countByStatus(JobOfferStatus status);
}
