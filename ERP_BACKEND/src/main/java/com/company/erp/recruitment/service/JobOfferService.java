package com.company.erp.recruitment.service;

import com.company.erp.recruitment.dto.JobOfferDTO;
import com.company.erp.recruitment.entity.JobOfferStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface JobOfferService {
    JobOfferDTO createJobOffer(JobOfferDTO jobOfferDTO, String createdBy);
    JobOfferDTO updateJobOffer(Long id, JobOfferDTO jobOfferDTO, String updatedBy);
    JobOfferDTO getJobOfferById(Long id);
    Page<JobOfferDTO> getAllJobOffers(Pageable pageable);
    Page<JobOfferDTO> getActiveJobOffers(Pageable pageable);
    Page<JobOfferDTO> getJobOffersByStatus(JobOfferStatus status, Pageable pageable);
    Page<JobOfferDTO> getJobOffersByDepartment(String department, Pageable pageable);
    Page<JobOfferDTO> searchJobOffers(String title, Pageable pageable);
    void deleteJobOffer(Long id);
    void closeJobOffer(Long id);
    void archiveJobOffer(Long id);
    Long countOpenOffers();
    List<JobOfferDTO> getPublicJobOffers();
}
