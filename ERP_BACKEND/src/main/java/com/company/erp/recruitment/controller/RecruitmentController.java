package com.company.erp.recruitment.controller;

import com.company.erp.common.dto.ApiResponse;
import com.company.erp.common.enums.EmployeeStatus;
import com.company.erp.common.enums.UserRole;
import com.company.erp.employee.entity.Employee;
import com.company.erp.employee.repository.EmployeeRepository;
import com.company.erp.recruitment.dto.CandidateDTO;
import com.company.erp.recruitment.dto.InterviewerDTO;
import com.company.erp.recruitment.service.RecruitmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/candidates")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class RecruitmentController {
    
    private final RecruitmentService recruitmentService;
    private final EmployeeRepository employeeRepository;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<CandidateDTO>> createCandidate(
            @Valid @RequestBody CandidateDTO candidateDTO) {
        log.info("Creating candidate");
        CandidateDTO createdCandidate = recruitmentService.createCandidate(candidateDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(createdCandidate, "Candidate created successfully", 201));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<CandidateDTO>> updateCandidate(
            @PathVariable Long id,
            @Valid @RequestBody CandidateDTO candidateDTO) {
        log.info("Updating candidate with ID: {}", id);
        CandidateDTO updatedCandidate = recruitmentService.updateCandidate(id, candidateDTO);
        return ResponseEntity.ok(ApiResponse.success(updatedCandidate, "Candidate updated successfully"));
    }
    
    @PutMapping("/{id}/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<CandidateDTO>> updateCandidateStatus(
            @PathVariable Long id,
            @PathVariable String status) {
        log.info("Updating candidate status with ID: {}", id);
        CandidateDTO updatedCandidate = recruitmentService.updateCandidateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(updatedCandidate, "Candidate status updated successfully"));
    }

    @GetMapping("/{id}/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<CandidateDTO>> updateCandidateStatusViaGet(
            @PathVariable Long id,
            @PathVariable String status) {
        log.info("Updating candidate status via GET with ID: {}", id);
        CandidateDTO updatedCandidate = recruitmentService.updateCandidateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(updatedCandidate, "Candidate status updated successfully"));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCandidate(@PathVariable Long id) {
        log.info("Deleting candidate with ID: {}", id);
        recruitmentService.deleteCandidate(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Candidate deleted successfully"));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<CandidateDTO>> getCandidateById(@PathVariable Long id) {
        log.info("Fetching candidate with ID: {}", id);
        CandidateDTO candidate = recruitmentService.getCandidateById(id);
        return ResponseEntity.ok(ApiResponse.success(candidate, "Candidate fetched successfully"));
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<List<CandidateDTO>>> getAllCandidates() {
        log.info("Fetching all candidates");
        List<CandidateDTO> candidates = recruitmentService.getAllCandidates();
        return ResponseEntity.ok(ApiResponse.success(candidates, "Candidates fetched successfully"));
    }
    
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<List<CandidateDTO>>> getCandidatesByStatus(
            @PathVariable String status) {
        log.info("Fetching candidates with status: {}", status);
        List<CandidateDTO> candidates = recruitmentService.getCandidatesByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(candidates, "Candidates fetched successfully"));
    }
    
    @GetMapping("/position/{position}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<List<CandidateDTO>>> getCandidatesByPosition(
            @PathVariable String position) {
        log.info("Fetching candidates for position: {}", position);
        List<CandidateDTO> candidates = recruitmentService.getCandidatesByPosition(position);
        return ResponseEntity.ok(ApiResponse.success(candidates, "Candidates fetched successfully"));
    }
    
    @GetMapping("/by-offer/{jobOfferId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<List<CandidateDTO>>> getCandidatesByJobOffer(
            @PathVariable Long jobOfferId) {
        log.info("Fetching candidates for job offer: {}", jobOfferId);
        List<CandidateDTO> candidates = recruitmentService.getCandidatesByJobOffer(jobOfferId);
        return ResponseEntity.ok(ApiResponse.success(candidates, "Candidates fetched successfully"));
    }

    @GetMapping("/interviewers")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<InterviewerDTO>>> getInterviewers(
            @RequestParam(required = false, defaultValue = "HR") String role) {
        log.info("Fetching all available interviewers for role: {}", role);
        UserRole userRole = UserRole.valueOf(role.toUpperCase());
        
        List<InterviewerDTO> interviewers = employeeRepository.findAll()
            .stream()
            .filter(emp -> emp.getStatus() == EmployeeStatus.ACTIVE)
            .filter(emp -> emp.getUser() != null && emp.getUser().getRole() == userRole)
            .map(emp -> InterviewerDTO.builder()
                .id(emp.getId())
                .name(emp.getFirstName() + " " + emp.getLastName())
                .email(emp.getEmail())
                .build())
            .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(interviewers, "Interviewers fetched successfully"));
    }
}
