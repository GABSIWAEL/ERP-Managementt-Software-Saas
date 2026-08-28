package com.company.erp.recruitment.controller;

import com.company.erp.common.dto.ApiResponse;
import com.company.erp.recruitment.dto.InterviewScheduleDTO;
import com.company.erp.recruitment.entity.InterviewSchedule;
import com.company.erp.recruitment.entity.JobApplication;
import com.company.erp.recruitment.entity.JobOffer;
import com.company.erp.recruitment.repository.JobApplicationRepository;
import com.company.erp.recruitment.service.InterviewScheduleService;
import com.company.erp.recruitment.service.RecruitmentEmailService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/recruitment/schedules")
@CrossOrigin(origins = "*", maxAge = 3600)
public class InterviewScheduleController {

    @Autowired
    private InterviewScheduleService interviewScheduleService;
    
    @Autowired
    private RecruitmentEmailService recruitmentEmailService;
    
    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @PostMapping
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<InterviewScheduleDTO>> scheduleInterview(
            @Valid @RequestBody InterviewScheduleDTO scheduleDTO) {
        log.info("Scheduling {} for application: {}", scheduleDTO.getType(), scheduleDTO.getJobApplicationId());
        
        // Validate interviewer details for interview types (not for assessment tests)
        boolean isAssessmentTest = scheduleDTO.getType().name().contains("TEST");
        if (!isAssessmentTest) {
            if (scheduleDTO.getInterviewerName() == null || scheduleDTO.getInterviewerName().isBlank()) {
                throw new RuntimeException("Interviewer name is required for interview scheduling");
            }
            if (scheduleDTO.getInterviewerEmail() == null || scheduleDTO.getInterviewerEmail().isBlank()) {
                throw new RuntimeException("Interviewer email is required for interview scheduling");
            }
        }
        
        JobApplication application = jobApplicationRepository.findById(scheduleDTO.getJobApplicationId())
            .orElseThrow(() -> new RuntimeException("Application not found"));
        
        InterviewSchedule schedule = interviewScheduleService.scheduleInterview(
            application,
            scheduleDTO.getType(),
            scheduleDTO.getScheduledDateTime(),
            scheduleDTO.getTitle(),
            scheduleDTO.getDescription(),
            scheduleDTO.getLocation(),
            scheduleDTO.getMeetingLink(),
            scheduleDTO.getInterviewerName(),
            scheduleDTO.getInterviewerEmail(),
            1L // Company ID
        );
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(mapToDTO(schedule), "Interview scheduled successfully"));
    }

    @GetMapping("/application/{applicationId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<InterviewScheduleDTO>>> getApplicationSchedules(
            @PathVariable Long applicationId) {
        log.info("Fetching schedules for application: {}", applicationId);
        
        JobApplication application = jobApplicationRepository.findById(applicationId)
            .orElseThrow(() -> new RuntimeException("Application not found"));
        
        List<InterviewScheduleDTO> schedules = interviewScheduleService
            .getSchedulesForApplication(application)
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok()
                .body(ApiResponse.success(schedules, "Schedules retrieved successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<InterviewScheduleDTO>> getSchedule(@PathVariable Long id) {
        log.info("Fetching schedule: {}", id);
        
        InterviewSchedule schedule = interviewScheduleService.getScheduleById(id);
        return ResponseEntity.ok()
                .body(ApiResponse.success(mapToDTO(schedule), "Schedule retrieved successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<InterviewScheduleDTO>> updateSchedule(
            @PathVariable Long id,
            @Valid @RequestBody InterviewScheduleDTO scheduleDTO) {
        log.info("Updating schedule: {}", id);
        
        InterviewSchedule existing = interviewScheduleService.getScheduleById(id);
        
        InterviewSchedule updated = InterviewSchedule.builder()
            .scheduledDateTime(scheduleDTO.getScheduledDateTime())
            .title(scheduleDTO.getTitle())
            .description(scheduleDTO.getDescription())
            .location(scheduleDTO.getLocation())
            .meetingLink(scheduleDTO.getMeetingLink())
            .interviewerName(scheduleDTO.getInterviewerName())
            .interviewerEmail(scheduleDTO.getInterviewerEmail())
            .type(scheduleDTO.getType())
            .build();
        
        InterviewSchedule result = interviewScheduleService.updateSchedule(id, updated);
        return ResponseEntity.ok()
                .body(ApiResponse.success(mapToDTO(result), "Schedule updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<Void>> cancelSchedule(@PathVariable Long id) {
        log.info("Cancelling schedule: {}", id);
        
        interviewScheduleService.cancelSchedule(id);
        return ResponseEntity.ok()
                .body(ApiResponse.success(null, "Schedule cancelled successfully"));
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<InterviewScheduleDTO>> completeSchedule(
            @PathVariable Long id,
            @RequestParam(required = false) Integer ratingScore,
            @RequestParam(required = false) String feedbackNotes) {
        log.info("Completing schedule: {}", id);
        
        interviewScheduleService.completeSchedule(id, ratingScore, feedbackNotes);
        InterviewSchedule schedule = interviewScheduleService.getScheduleById(id);
        
        return ResponseEntity.ok()
                .body(ApiResponse.success(mapToDTO(schedule), "Schedule marked as completed"));
    }

    @GetMapping("/calendar/interviewer")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<List<InterviewScheduleDTO>>> getInterviewerCalendar(
            @RequestParam String email,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        log.info("Fetching calendar for interviewer: {} from {} to {}", email, start, end);
        
        List<InterviewScheduleDTO> schedules = interviewScheduleService
            .getInterviewerCalendar(email, start, end)
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok()
                .body(ApiResponse.success(schedules, "Interviewer calendar retrieved"));
    }

    @GetMapping("/calendar/company")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<List<InterviewScheduleDTO>>> getCompanyCalendar(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        log.info("Fetching company calendar from {} to {}", start, end);
        
        List<InterviewScheduleDTO> schedules = interviewScheduleService
            .getCompanyCalendar(1L, start, end)
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok()
                .body(ApiResponse.success(schedules, "Company calendar retrieved"));
    }

    @GetMapping("/availability/check")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<Boolean>> checkAvailability(
            @RequestParam String interviewerEmail,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTime) {
        log.info("Checking availability for {} at {}", interviewerEmail, dateTime);
        
        boolean available = interviewScheduleService.isInterviewerAvailable(interviewerEmail, dateTime);
        return ResponseEntity.ok()
                .body(ApiResponse.success(available, available ? "Interviewer is available" : "Interviewer is not available"));
    }

    private InterviewScheduleDTO mapToDTO(InterviewSchedule schedule) {
        // Initialize lazy-loaded relationships to avoid LazyInitializationException
        JobApplication application = schedule.getJobApplication();
        if (application != null) {
            // Access these while session is still open
            String applicantName = application.getApplicantName();
            String applicantEmail = application.getEmail();
            
            JobOffer jobOffer = application.getJobOffer();
            String positionTitle = jobOffer != null ? jobOffer.getTitle() : "Unknown Position";
            
            return InterviewScheduleDTO.builder()
                .id(schedule.getId())
                .jobApplicationId(application.getId())
                .type(schedule.getType())
                .scheduledDateTime(schedule.getScheduledDateTime())
                .title(schedule.getTitle())
                .description(schedule.getDescription())
                .location(schedule.getLocation())
                .meetingLink(schedule.getMeetingLink())
                .interviewerName(schedule.getInterviewerName())
                .interviewerEmail(schedule.getInterviewerEmail())
                .status(schedule.getStatus())
                .ratingScore(schedule.getRatingScore())
                .feedbackNotes(schedule.getFeedbackNotes())
                .reminderSent(schedule.getReminderSent())
                .candidateName(applicantName)
                .positionTitle(positionTitle)
                .candidateEmail(applicantEmail)
                .build();
        }
        
        // Fallback if application is null
        return InterviewScheduleDTO.builder()
            .id(schedule.getId())
            .jobApplicationId(null)
            .type(schedule.getType())
            .scheduledDateTime(schedule.getScheduledDateTime())
            .title(schedule.getTitle())
            .description(schedule.getDescription())
            .location(schedule.getLocation())
            .meetingLink(schedule.getMeetingLink())
            .interviewerName(schedule.getInterviewerName())
            .interviewerEmail(schedule.getInterviewerEmail())
            .status(schedule.getStatus())
            .ratingScore(schedule.getRatingScore())
            .feedbackNotes(schedule.getFeedbackNotes())
            .reminderSent(schedule.getReminderSent())
            .build();
    }
}
