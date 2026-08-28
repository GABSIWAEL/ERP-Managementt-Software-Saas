package com.company.erp.event.service.impl;

import com.company.erp.audit.entity.AuditLog;
import com.company.erp.audit.repository.AuditLogRepository;
import com.company.erp.common.exception.ResourceNotFoundException;
import com.company.erp.event.dto.EventDTO;
import com.company.erp.event.entity.Event;
import com.company.erp.event.repository.EventRepository;
import com.company.erp.event.service.EventService;
import com.company.erp.security.entity.User;
import com.company.erp.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class EventServiceImpl implements EventService {
    
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    
    @Override
    public EventDTO createEvent(EventDTO eventDTO) {
        log.info("Creating event: {}", eventDTO.getTitle());
        
        String currentUsername = getCurrentUsername();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));
        
        Event event = Event.builder()
                .title(eventDTO.getTitle())
                .description(eventDTO.getDescription())
                .eventDate(eventDTO.getEventDate())
                .type(eventDTO.getType())
                .createdBy(currentUser)
                .build();
        
        event = eventRepository.save(event);
        
        auditLogRepository.save(AuditLog.builder()
                .action("EVENT_CREATED")
                .entityName("Event")
                .performedBy(currentUsername)
                .timestamp(LocalDateTime.now())
                .details("Event created: " + eventDTO.getTitle())
                .build());
        
        return mapToDTO(event);
    }
    
    @Override
    public EventDTO updateEvent(Long id, EventDTO eventDTO) {
        log.info("Updating event with ID: {}", id);
        
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        
        event.setTitle(eventDTO.getTitle());
        event.setDescription(eventDTO.getDescription());
        event.setEventDate(eventDTO.getEventDate());
        event.setType(eventDTO.getType());
        
        event = eventRepository.save(event);
        
        auditLogRepository.save(AuditLog.builder()
                .action("EVENT_UPDATED")
                .entityName("Event")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Event updated")
                .build());
        
        return mapToDTO(event);
    }
    
    @Override
    public void deleteEvent(Long id) {
        log.info("Deleting event with ID: {}", id);
        
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        
        eventRepository.delete(event);
        
        auditLogRepository.save(AuditLog.builder()
                .action("EVENT_DELETED")
                .entityName("Event")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Event deleted")
                .build());
    }
    
    @Override
    @Transactional(readOnly = true)
    public EventDTO getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        return mapToDTO(event);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<EventDTO> getAllEvents() {
        log.info("Fetching all events");
        return eventRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<EventDTO> getEventsByType(String type) {
        log.info("Fetching events with type: {}", type);
        return eventRepository.findAll().stream()
                .filter(e -> e.getType().name().equalsIgnoreCase(type))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<EventDTO> getEventsByDateRange(LocalDate startDate, LocalDate endDate) {
        log.info("Fetching events between {} and {}", startDate, endDate);
        return eventRepository.findAll().stream()
                .filter(e -> e.getEventDate().toLocalDate().isAfter(startDate) &&
                        e.getEventDate().toLocalDate().isBefore(endDate))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<EventDTO> getUpcomingEvents(int days) {
        log.info("Fetching upcoming events in {} days", days);
        LocalDate futureDate = LocalDate.now().plusDays(days);
        return eventRepository.findAll().stream()
                .filter(e -> e.getEventDate().toLocalDate().isAfter(LocalDate.now()) &&
                        e.getEventDate().toLocalDate().isBefore(futureDate))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    private EventDTO mapToDTO(Event event) {
        return EventDTO.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .eventDate(event.getEventDate())
                .type(event.getType())
                .createdByUsername(event.getCreatedBy().getUsername())
                .createdAt(event.getCreatedAt())
                .updatedAt(event.getUpdatedAt())
                .build();
    }
    
    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "SYSTEM";
    }
}
