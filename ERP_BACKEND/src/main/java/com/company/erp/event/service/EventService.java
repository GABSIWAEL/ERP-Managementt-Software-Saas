package com.company.erp.event.service;

import com.company.erp.event.dto.EventDTO;
import java.time.LocalDate;
import java.util.List;

public interface EventService {
    
    EventDTO createEvent(EventDTO eventDTO);
    
    EventDTO updateEvent(Long id, EventDTO eventDTO);
    
    void deleteEvent(Long id);
    
    EventDTO getEventById(Long id);
    
    List<EventDTO> getAllEvents();
    
    List<EventDTO> getEventsByType(String type);
    
    List<EventDTO> getEventsByDateRange(LocalDate startDate, LocalDate endDate);
    
    List<EventDTO> getUpcomingEvents(int days);
}
