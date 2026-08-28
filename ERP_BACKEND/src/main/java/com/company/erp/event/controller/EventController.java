package com.company.erp.event.controller;

import com.company.erp.common.dto.ApiResponse;
import com.company.erp.event.dto.EventDTO;
import com.company.erp.event.service.EventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {
    
    private final EventService eventService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<EventDTO>> createEvent(
            @Valid @RequestBody EventDTO eventDTO) {
        log.info("Creating event");
        EventDTO createdEvent = eventService.createEvent(eventDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(createdEvent, "Event created successfully", 201));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<EventDTO>> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody EventDTO eventDTO) {
        log.info("Updating event with ID: {}", id);
        EventDTO updatedEvent = eventService.updateEvent(id, eventDTO);
        return ResponseEntity.ok(ApiResponse.success(updatedEvent, "Event updated successfully"));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(@PathVariable Long id) {
        log.info("Deleting event with ID: {}", id);
        eventService.deleteEvent(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Event deleted successfully"));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<EventDTO>> getEventById(@PathVariable Long id) {
        log.info("Fetching event with ID: {}", id);
        EventDTO event = eventService.getEventById(id);
        return ResponseEntity.ok(ApiResponse.success(event, "Event fetched successfully"));
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<EventDTO>>> getAllEvents() {
        log.info("Fetching all events");
        List<EventDTO> events = eventService.getAllEvents();
        return ResponseEntity.ok(ApiResponse.success(events, "Events fetched successfully"));
    }
    
    @GetMapping("/type/{type}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<EventDTO>>> getEventsByType(
            @PathVariable String type) {
        log.info("Fetching events with type: {}", type);
        List<EventDTO> events = eventService.getEventsByType(type);
        return ResponseEntity.ok(ApiResponse.success(events, "Events fetched successfully"));
    }
    
    @GetMapping("/range")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<EventDTO>>> getEventsByDateRange(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        log.info("Fetching events between {} and {}", startDate, endDate);
        List<EventDTO> events = eventService.getEventsByDateRange(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(events, "Events fetched successfully"));
    }
    
    @GetMapping("/upcoming/{days}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<EventDTO>>> getUpcomingEvents(
            @PathVariable int days) {
        log.info("Fetching upcoming events in {} days", days);
        List<EventDTO> events = eventService.getUpcomingEvents(days);
        return ResponseEntity.ok(ApiResponse.success(events, "Upcoming events fetched successfully"));
    }
}
