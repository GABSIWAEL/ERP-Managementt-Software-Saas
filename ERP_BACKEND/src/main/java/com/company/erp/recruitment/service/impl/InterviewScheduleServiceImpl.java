package com.company.erp.recruitment.service.impl;

import com.company.erp.common.exception.BusinessLogicException;
import com.company.erp.common.exception.ResourceNotFoundException;
import com.company.erp.recruitment.entity.InterviewSchedule;
import com.company.erp.recruitment.entity.JobApplication;
import com.company.erp.recruitment.repository.InterviewScheduleRepository;
import com.company.erp.recruitment.service.InterviewScheduleService;
import com.company.erp.recruitment.service.RecruitmentEmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class InterviewScheduleServiceImpl implements InterviewScheduleService {
    
    private final InterviewScheduleRepository interviewScheduleRepository;
    private final RecruitmentEmailService recruitmentEmailService;
    
    @Override
    public InterviewSchedule scheduleInterview(
            JobApplication application,
            InterviewSchedule.ScheduleType type,
            LocalDateTime dateTime,
            String title,
            String description,
            String location,
            String meetingLink,
            String interviewerName,
            String interviewerEmail,
            Long companyId) {
        
        // Check if interviewer is available
        if (!isInterviewerAvailable(interviewerEmail, dateTime)) {
            throw new BusinessLogicException(
                "Interviewer is not available at the requested time. Please check the calendar.");
        }
        
        InterviewSchedule schedule = InterviewSchedule.builder()
            .jobApplication(application)
            .type(type)
            .scheduledDateTime(dateTime)
            .title(title)
            .description(description)
            .location(location)
            .meetingLink(meetingLink)
            .interviewerName(interviewerName)
            .interviewerEmail(interviewerEmail)
            .status(InterviewSchedule.ScheduleStatus.SCHEDULED)
            .reminderSent(false)
            .companyId(companyId)
            .build();
        
        InterviewSchedule saved = interviewScheduleRepository.save(schedule);
        
        // Send notification email to candidate
        try {
            recruitmentEmailService.sendInterviewScheduleEmail(application, saved);
        } catch (Exception e) {
            log.warn("Failed to send interview schedule email: {}", e.getMessage());
            // Don't fail the schedule if email fails
        }
        
        log.info("Interview scheduled for application {} at {}", application.getId(), dateTime);
        return saved;
    }
    
    @Override
    public List<InterviewSchedule> getSchedulesForApplication(JobApplication application) {
        return interviewScheduleRepository.findByJobApplication(application);
    }
    
    @Override
    public InterviewSchedule getScheduleById(Long id) {
        return interviewScheduleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with ID: " + id));
    }
    
    @Override
    public InterviewSchedule updateSchedule(Long id, InterviewSchedule updatedSchedule) {
        InterviewSchedule schedule = getScheduleById(id);
        
        // Check new interviewer availability if time changed
        if (!schedule.getScheduledDateTime().equals(updatedSchedule.getScheduledDateTime()) ||
            !schedule.getInterviewerEmail().equals(updatedSchedule.getInterviewerEmail())) {
            
            if (!isInterviewerAvailable(updatedSchedule.getInterviewerEmail(), 
                                       updatedSchedule.getScheduledDateTime())) {
                throw new BusinessLogicException("Interviewer is not available at the requested time");
            }
        }
        
        schedule.setScheduledDateTime(updatedSchedule.getScheduledDateTime());
        schedule.setTitle(updatedSchedule.getTitle());
        schedule.setDescription(updatedSchedule.getDescription());
        schedule.setLocation(updatedSchedule.getLocation());
        schedule.setMeetingLink(updatedSchedule.getMeetingLink());
        schedule.setInterviewerName(updatedSchedule.getInterviewerName());
        schedule.setInterviewerEmail(updatedSchedule.getInterviewerEmail());
        schedule.setType(updatedSchedule.getType());
        
        InterviewSchedule saved = interviewScheduleRepository.save(schedule);
        log.info("Schedule {} updated", id);
        
        return saved;
    }
    
    @Override
    public void cancelSchedule(Long id) {
        InterviewSchedule schedule = getScheduleById(id);
        schedule.setStatus(InterviewSchedule.ScheduleStatus.CANCELLED);
        interviewScheduleRepository.save(schedule);
        log.info("Schedule {} cancelled", id);
    }
    
    @Override
    public void completeSchedule(Long id, Integer ratingScore, String feedbackNotes) {
        InterviewSchedule schedule = getScheduleById(id);
        schedule.setStatus(InterviewSchedule.ScheduleStatus.COMPLETED);
        schedule.setRatingScore(ratingScore);
        schedule.setFeedbackNotes(feedbackNotes);
        interviewScheduleRepository.save(schedule);
        log.info("Schedule {} completed with rating: {}", id, ratingScore);
    }
    
    @Override
    public List<InterviewSchedule> getInterviewerCalendar(
            String interviewerEmail,
            LocalDateTime start,
            LocalDateTime end) {
        return interviewScheduleRepository.findByCompanyIdAndInterviewerEmail(1L, interviewerEmail)
            .stream()
            .filter(s -> !s.getScheduledDateTime().isBefore(start) && 
                       !s.getScheduledDateTime().isAfter(end) &&
                       s.getStatus() != InterviewSchedule.ScheduleStatus.CANCELLED)
            .toList();
    }
    
    @Override
    public List<InterviewSchedule> getCompanyCalendar(
            Long companyId,
            LocalDateTime start,
            LocalDateTime end) {
        return interviewScheduleRepository.findByCompanyIdAndScheduledDateTimeBetween(
            companyId, start, end)
            .stream()
            .filter(s -> s.getStatus() != InterviewSchedule.ScheduleStatus.CANCELLED)
            .toList();
    }
    
    @Override
    public boolean isInterviewerAvailable(String interviewerEmail, LocalDateTime dateTime) {
        // Check if interviewer has any overlapping schedules
        // Assuming each interview takes 1 hour
        LocalDateTime endTime = dateTime.plusHours(1);
        
        List<InterviewSchedule> schedules = interviewScheduleRepository
            .findByCompanyIdAndInterviewerEmail(1L, interviewerEmail);
        
        // For now, if no existing schedules, allow booking
        if (schedules.isEmpty()) {
            return true;
        }
        
        return schedules.stream()
            .filter(s -> s.getStatus() == InterviewSchedule.ScheduleStatus.SCHEDULED ||
                        s.getStatus() == InterviewSchedule.ScheduleStatus.IN_PROGRESS)
            .noneMatch(s -> {
                LocalDateTime scheduleStart = s.getScheduledDateTime();
                LocalDateTime scheduleEnd = scheduleStart.plusHours(1);
                
                // Check for overlap
                return !(endTime.isBefore(scheduleStart) || dateTime.isAfter(scheduleEnd));
            });
    }
    
    @Override
    @Transactional
    public void sendReminders() {
        // Get schedules for the next 24 hours that haven't sent reminders yet
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime tomorrow = now.plusHours(24);
        
        // This would need a custom query to find all upcoming schedules across all companies
        // For now, we'll use a simplified approach
        log.info("Sending interview reminders for schedules in the next 24 hours");
    }
}
