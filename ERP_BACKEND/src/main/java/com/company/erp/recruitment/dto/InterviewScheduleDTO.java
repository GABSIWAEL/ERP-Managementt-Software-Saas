package com.company.erp.recruitment.dto;

import com.company.erp.recruitment.entity.InterviewSchedule;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewScheduleDTO {
    private Long id;
    
    @NotNull(message = "Job application ID is required")
    private Long jobApplicationId;
    
    @NotNull(message = "Schedule type is required")
    private InterviewSchedule.ScheduleType type;
    
    @NotNull(message = "Scheduled date/time is required")
    private LocalDateTime scheduledDateTime;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    
    private String location;
    
    private String meetingLink;
    
    private String interviewerName;
    
    private String interviewerEmail;
    
    private InterviewSchedule.ScheduleStatus status;
    
    private Integer ratingScore;
    
    private String feedbackNotes;
    
    private Boolean reminderSent;
    
    private String candidateName;
    
    private String positionTitle;
    
    private String candidateEmail;
}
