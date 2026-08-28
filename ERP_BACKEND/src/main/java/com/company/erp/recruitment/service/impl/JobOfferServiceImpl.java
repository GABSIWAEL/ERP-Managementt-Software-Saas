package com.company.erp.recruitment.service.impl;

import com.company.erp.recruitment.dto.JobOfferDTO;
import com.company.erp.recruitment.entity.JobOffer;
import com.company.erp.recruitment.entity.JobOfferStatus;
import com.company.erp.recruitment.repository.JobOfferRepository;
import com.company.erp.recruitment.service.JobOfferService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class JobOfferServiceImpl implements JobOfferService {

    private final JobOfferRepository jobOfferRepository;

    @Override
    public JobOfferDTO createJobOffer(JobOfferDTO jobOfferDTO, String createdBy) {
        JobOffer jobOffer = JobOffer.builder()
                .title(jobOfferDTO.getTitle())
                .description(jobOfferDTO.getDescription())
                .requirements(jobOfferDTO.getRequirements())
                .department(jobOfferDTO.getDepartment())
                .salaryMin(jobOfferDTO.getSalaryMin())
                .salaryMax(jobOfferDTO.getSalaryMax())
                .jobLocation(jobOfferDTO.getJobLocation())
                .jobType(jobOfferDTO.getJobType())
                .status(JobOfferStatus.OPEN)
                .postedDate(LocalDateTime.now())
                .deadline(jobOfferDTO.getDeadline())
                .numberOfPositions(jobOfferDTO.getNumberOfPositions())
                .filledPositions(0)
                .isActive(true)
                .benefits(jobOfferDTO.getBenefits())
                .build();
        JobOffer savedOffer = jobOfferRepository.save(jobOffer);
        return mapToDTO(savedOffer);
    }

    @Override
    public JobOfferDTO updateJobOffer(Long id, JobOfferDTO jobOfferDTO, String updatedBy) {
        JobOffer jobOffer = jobOfferRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job Offer not found with id: " + id));

        jobOffer.setTitle(jobOfferDTO.getTitle());
        jobOffer.setDescription(jobOfferDTO.getDescription());
        jobOffer.setRequirements(jobOfferDTO.getRequirements());
        jobOffer.setDepartment(jobOfferDTO.getDepartment());
        jobOffer.setSalaryMin(jobOfferDTO.getSalaryMin());
        jobOffer.setSalaryMax(jobOfferDTO.getSalaryMax());
        jobOffer.setJobLocation(jobOfferDTO.getJobLocation());
        jobOffer.setJobType(jobOfferDTO.getJobType());
        jobOffer.setDeadline(jobOfferDTO.getDeadline());
        jobOffer.setNumberOfPositions(jobOfferDTO.getNumberOfPositions());
        jobOffer.setIsActive(jobOfferDTO.getIsActive());
        jobOffer.setBenefits(jobOfferDTO.getBenefits());

        JobOffer updatedOffer = jobOfferRepository.save(jobOffer);
        return mapToDTO(updatedOffer);
    }

    @Override
    @Transactional(readOnly = true)
    public JobOfferDTO getJobOfferById(Long id) {
        JobOffer jobOffer = jobOfferRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job Offer not found with id: " + id));
        return mapToDTO(jobOffer);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobOfferDTO> getAllJobOffers(Pageable pageable) {
        return jobOfferRepository.findAll(pageable)
                .map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobOfferDTO> getActiveJobOffers(Pageable pageable) {
        return jobOfferRepository.findByStatusAndIsActiveTrue(JobOfferStatus.OPEN, pageable)
                .map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobOfferDTO> getJobOffersByStatus(JobOfferStatus status, Pageable pageable) {
        return jobOfferRepository.findByStatus(status, pageable)
                .map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobOfferDTO> getJobOffersByDepartment(String department, Pageable pageable) {
        return jobOfferRepository.findByDepartment(department, pageable)
                .map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobOfferDTO> searchJobOffers(String title, Pageable pageable) {
        return jobOfferRepository.findByTitleContainingIgnoreCase(title, pageable)
                .map(this::mapToDTO);
    }

    @Override
    public void deleteJobOffer(Long id) {
        jobOfferRepository.deleteById(id);
    }

    @Override
    public void closeJobOffer(Long id) {
        JobOffer jobOffer = jobOfferRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job Offer not found with id: " + id));
        jobOffer.setStatus(JobOfferStatus.CLOSED);
        jobOfferRepository.save(jobOffer);
    }

    @Override
    public void archiveJobOffer(Long id) {
        JobOffer jobOffer = jobOfferRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job Offer not found with id: " + id));
        jobOffer.setStatus(JobOfferStatus.ARCHIVED);
        jobOfferRepository.save(jobOffer);
    }

    @Override
    @Transactional(readOnly = true)
    public Long countOpenOffers() {
        return jobOfferRepository.countByStatus(JobOfferStatus.OPEN);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobOfferDTO> getPublicJobOffers() {
        return jobOfferRepository.findByStatusAndIsActiveTrue(JobOfferStatus.OPEN)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private JobOfferDTO mapToDTO(JobOffer jobOffer) {
        return JobOfferDTO.builder()
                .id(jobOffer.getId())
                .title(jobOffer.getTitle())
                .description(jobOffer.getDescription())
                .requirements(jobOffer.getRequirements())
                .department(jobOffer.getDepartment())
                .salaryMin(jobOffer.getSalaryMin())
                .salaryMax(jobOffer.getSalaryMax())
                .jobLocation(jobOffer.getJobLocation())
                .jobType(jobOffer.getJobType())
                .status(jobOffer.getStatus().name())
                .postedDate(jobOffer.getPostedDate())
                .deadline(jobOffer.getDeadline())
                .numberOfPositions(jobOffer.getNumberOfPositions())
                .filledPositions(jobOffer.getFilledPositions())
                .isActive(jobOffer.getIsActive())
                .benefits(jobOffer.getBenefits())
                .createdAt(jobOffer.getCreatedAt())
                .updatedAt(jobOffer.getUpdatedAt())
                .build();
    }
}
