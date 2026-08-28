package com.company.erp.recruitment.controller;

import com.company.erp.recruitment.dto.JobOfferDTO;
import com.company.erp.recruitment.entity.JobOfferStatus;
import com.company.erp.recruitment.service.JobOfferService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/job-offers")
@RequiredArgsConstructor
public class JobOfferController {

    private final JobOfferService jobOfferService;

    /**
     * Get all job offers with pagination (Admin/HR only)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Page<JobOfferDTO>> getAllJobOffers(Pageable pageable) {
        return ResponseEntity.ok(jobOfferService.getAllJobOffers(pageable));
    }

    /**
     * Get all active job offers (Public - no auth required)
     */
    @GetMapping("/public")
    public ResponseEntity<List<JobOfferDTO>> getPublicJobOffers() {
        return ResponseEntity.ok(jobOfferService.getPublicJobOffers());
    }

    /**
     * Get active job offers with pagination (Public)
     */
    @GetMapping("/public/active")
    public ResponseEntity<Page<JobOfferDTO>> getActiveJobOffers(Pageable pageable) {
        return ResponseEntity.ok(jobOfferService.getActiveJobOffers(pageable));
    }

    /**
     * Get job offers by status (Admin/HR only)
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Page<JobOfferDTO>> getJobOffersByStatus(
            @PathVariable JobOfferStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(jobOfferService.getJobOffersByStatus(status, pageable));
    }

    /**
     * Get job offers by department
     */
    @GetMapping("/department/{department}")
    public ResponseEntity<Page<JobOfferDTO>> getJobOffersByDepartment(
            @PathVariable String department,
            Pageable pageable) {
        return ResponseEntity.ok(jobOfferService.getJobOffersByDepartment(department, pageable));
    }

    /**
     * Search job offers by title
     */
    @GetMapping("/search")
    public ResponseEntity<Page<JobOfferDTO>> searchJobOffers(
            @RequestParam String title,
            Pageable pageable) {
        return ResponseEntity.ok(jobOfferService.searchJobOffers(title, pageable));
    }

    /**
     * Get job offer by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<JobOfferDTO> getJobOfferById(@PathVariable Long id) {
        return ResponseEntity.ok(jobOfferService.getJobOfferById(id));
    }

    /**
     * Create new job offer (Admin/HR only)
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<JobOfferDTO> createJobOffer(
            @RequestBody JobOfferDTO jobOfferDTO) {
        String username = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(jobOfferService.createJobOffer(jobOfferDTO, username));
    }

    /**
     * Update job offer (Admin/HR only)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<JobOfferDTO> updateJobOffer(
            @PathVariable Long id,
            @RequestBody JobOfferDTO jobOfferDTO) {
        String username = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        return ResponseEntity.ok(jobOfferService.updateJobOffer(id, jobOfferDTO, username));
    }

    /**
     * Delete job offer (Admin only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteJobOffer(@PathVariable Long id) {
        jobOfferService.deleteJobOffer(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Close job offer (Admin/HR only)
     */
    @PutMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<JobOfferDTO> closeJobOffer(@PathVariable Long id) {
        jobOfferService.closeJobOffer(id);
        return ResponseEntity.ok(jobOfferService.getJobOfferById(id));
    }

    /**
     * Archive job offer (Admin/HR only)
     */
    @PutMapping("/{id}/archive")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<JobOfferDTO> archiveJobOffer(@PathVariable Long id) {
        jobOfferService.archiveJobOffer(id);
        return ResponseEntity.ok(jobOfferService.getJobOfferById(id));
    }

    /**
     * Count open offers
     */
    @GetMapping("/count/open")
    public ResponseEntity<Long> countOpenOffers() {
        return ResponseEntity.ok(jobOfferService.countOpenOffers());
    }
}
