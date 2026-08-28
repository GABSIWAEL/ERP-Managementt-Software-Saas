package com.company.erp.recruitment.controller;

import com.company.erp.recruitment.dto.JobApplicationDTO;
import com.company.erp.recruitment.entity.JobApplicationStatus;
import com.company.erp.recruitment.service.JobApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/job-applications")
@RequiredArgsConstructor
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;

    /**
     * Get all applications (Admin/HR only)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Page<JobApplicationDTO>> getAllApplications(Pageable pageable) {
        return ResponseEntity.ok(jobApplicationService.getAllApplications(pageable));
    }

    /**
     * Get applications for a specific job offer (Admin/HR only)
     */
    @GetMapping("/job-offer/{jobOfferId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Page<JobApplicationDTO>> getApplicationsByJobOffer(
            @PathVariable Long jobOfferId,
            Pageable pageable) {
        return ResponseEntity.ok(jobApplicationService.getApplicationsByJobOffer(jobOfferId, pageable));
    }

    /**
     * Get applications by status (Admin/HR only)
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Page<JobApplicationDTO>> getApplicationsByStatus(
            @PathVariable JobApplicationStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(jobApplicationService.getApplicationsByStatus(status, pageable));
    }

    /**
     * Search applications by applicant email
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<Page<JobApplicationDTO>> getApplicationsByEmail(
            @PathVariable String email,
            Pageable pageable) {
        return ResponseEntity.ok(jobApplicationService.getApplicationsByApplicantEmail(email, pageable));
    }

    /**
     * Search applications by applicant name (Admin/HR only)
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Page<JobApplicationDTO>> searchApplications(
            @RequestParam String name,
            Pageable pageable) {
        return ResponseEntity.ok(jobApplicationService.searchApplications(name, pageable));
    }

    /**
     * Get application by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<JobApplicationDTO> getApplicationById(@PathVariable Long id) {
        return ResponseEntity.ok(jobApplicationService.getApplicationById(id));
    }

    /**
     * Submit application (Public - no auth required)
     */
    @PostMapping
    public ResponseEntity<JobApplicationDTO> submitApplication(
            @RequestBody JobApplicationDTO applicationDTO) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(jobApplicationService.createApplication(applicationDTO));
    }

    /**
     * Update application (Admin/HR only)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<JobApplicationDTO> updateApplication(
            @PathVariable Long id,
            @RequestBody JobApplicationDTO applicationDTO) {
        return ResponseEntity.ok(jobApplicationService.updateApplication(id, applicationDTO));
    }

    /**
     * Update application status (Admin/HR only)
     */
    @PutMapping("/{id}/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<JobApplicationDTO> updateApplicationStatus(
            @PathVariable Long id,
            @PathVariable JobApplicationStatus status,
            @RequestParam(required = false) String notes) {
        String username = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        return ResponseEntity.ok(jobApplicationService.updateApplicationStatus(id, status, username, notes));
    }

    /**
     * Delete application (Admin only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {
        jobApplicationService.deleteApplication(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Check if applicant already applied
     */
    @GetMapping("/check-duplicate")
    public ResponseEntity<Boolean> hasAlreadyApplied(
            @RequestParam Long jobOfferId,
            @RequestParam String email) {
        return ResponseEntity.ok(jobApplicationService.hasAlreadyApplied(jobOfferId, email));
    }

    /**
     * Count pending applications
     */
    @GetMapping("/count/pending")
    public ResponseEntity<Long> countPendingApplications() {
        return ResponseEntity.ok(jobApplicationService.countPendingApplications());
    }
}
