package com.company.erp.event.service.impl;

import com.company.erp.common.enums.EventType;
import com.company.erp.employee.entity.Employee;
import com.company.erp.employee.repository.EmployeeRepository;
import com.company.erp.event.dto.EventDTO;
import com.company.erp.event.service.EventSchedulerService;
import com.company.erp.event.service.EventService;
import com.company.erp.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.MonthDay;
import java.time.ZoneId;
import java.util.List;

/**
 * Implementation of event scheduler service
 * Automatically creates birthday events and sends reminders
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class EventSchedulerServiceImpl implements EventSchedulerService {
    
    private final EventService eventService;
    private final EmployeeRepository employeeRepository;
    private final NotificationService notificationService;
    
    /**
     * Runs daily at 8:00 AM
     * Creates birthday events for employees whose birthday is today
     */
    @Override
    @Scheduled(cron = "0 0 8 * * *")
    public void createBirthdayEventsForToday() {
        try {
            log.info("Starting birthday event creation job");
            
            LocalDate today = LocalDate.now();
            MonthDay todayMonthDay = MonthDay.of(today.getMonth(), today.getDayOfMonth());
            
            // Get all active employees with birthdays
            List<Employee> employees = employeeRepository.findAll();
            
            for (Employee employee : employees) {
                if (employee.getDateOfBirth() != null) {
                    MonthDay birthMonthDay = MonthDay.of(
                            employee.getDateOfBirth().getMonth(),
                            employee.getDateOfBirth().getDayOfMonth()
                    );
                    
                    if (birthMonthDay.equals(todayMonthDay)) {
                        createBirthdayEvent(employee, today);
                    }
                }
            }
            
            log.info("Birthday event creation job completed successfully");
        } catch (Exception e) {
            log.error("Error in birthday event creation job", e);
        }
    }
    
    /**
     * Runs daily at 9:00 AM
     * Sends birthday reminders for upcoming birthdays (within 7 days)
     */
    @Override
    @Scheduled(cron = "0 0 9 * * *")
    public void sendBirthdayReminders() {
        try {
            log.info("Starting birthday reminder job");
            
            LocalDate today = LocalDate.now();
            LocalDate upcomingDate = today.plusDays(7);
            
            // Get all active employees with upcoming birthdays
            List<Employee> employees = employeeRepository.findAll();
            
            for (Employee employee : employees) {
                if (employee.getDateOfBirth() != null) {
                    LocalDate nextBirthday = employee.getDateOfBirth()
                            .withYear(today.getYear());
                    
                    // If birthday already passed this year, check next year
                    if (nextBirthday.isBefore(today)) {
                        nextBirthday = nextBirthday.withYear(today.getYear() + 1);
                    }
                    
                    // Check if birthday is within the next 7 days
                    if (!nextBirthday.isBefore(today) && !nextBirthday.isAfter(upcomingDate)) {
                        notificationService.notifyBirthdayReminder(
                                employee.getId(),
                                employee.getFirstName() + " " + employee.getLastName()
                        );
                        log.info("Birthday reminder sent for employee: {}", employee.getFirstName());
                    }
                }
            }
            
            log.info("Birthday reminder job completed successfully");
        } catch (Exception e) {
            log.error("Error in birthday reminder job", e);
        }
    }
    
    /**
     * Helper method to create a birthday event
     */
    private void createBirthdayEvent(Employee employee, LocalDate today) {
        try {
            LocalDateTime eventDateTime = today.atTime(9, 0);
            String eventTitle = String.format("Birthday: %s %s", 
                    employee.getFirstName(), 
                    employee.getLastName());
            
            EventDTO eventDTO = EventDTO.builder()
                    .title(eventTitle)
                    .description(String.format("Happy Birthday to %s!", 
                            employee.getFirstName()))
                    .eventDate(eventDateTime)
                    .type(EventType.BIRTHDAY)
                    .build();
            
            eventService.createEvent(eventDTO);
            log.info("Birthday event created for employee: {}", employee.getFirstName());
        } catch (Exception e) {
            log.error("Error creating birthday event for employee: {}", 
                    employee.getFirstName(), e);
        }
    }
}
