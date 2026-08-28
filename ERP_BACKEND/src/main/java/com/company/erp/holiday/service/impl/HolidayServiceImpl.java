package com.company.erp.holiday.service.impl;

import com.company.erp.audit.entity.AuditLog;
import com.company.erp.audit.repository.AuditLogRepository;
import com.company.erp.common.exception.BusinessLogicException;
import com.company.erp.common.exception.ResourceNotFoundException;
import com.company.erp.holiday.dto.HolidayDTO;
import com.company.erp.holiday.entity.Holiday;
import com.company.erp.holiday.repository.HolidayRepository;
import com.company.erp.holiday.service.HolidayService;
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
public class HolidayServiceImpl implements HolidayService {
    
    private final HolidayRepository holidayRepository;
    private final AuditLogRepository auditLogRepository;
    
    @Override
    public HolidayDTO createHoliday(HolidayDTO holidayDTO) {
        log.info("Creating new holiday: {}", holidayDTO.getName());
        
        // Check if holiday already exists on this date
        if (holidayRepository.existsByDate(holidayDTO.getDate())) {
            throw new BusinessLogicException("Holiday already exists on " + holidayDTO.getDate());
        }
        
        Holiday holiday = Holiday.builder()
                .name(holidayDTO.getName())
                .date(holidayDTO.getDate())
                .type(holidayDTO.getType())
                .recurring(holidayDTO.getRecurring())
                .build();
        
        holiday = holidayRepository.save(holiday);
        
        // Log audit
        auditLogRepository.save(AuditLog.builder()
                .action("HOLIDAY_CREATED")
                .entityName("Holiday")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Created holiday: " + holiday.getName())
                .build());
        
        log.info("Holiday created successfully with ID: {}", holiday.getId());
        return mapToDTO(holiday);
    }
    
    @Override
    public HolidayDTO updateHoliday(Long id, HolidayDTO holidayDTO) {
        log.info("Updating holiday with ID: {}", id);
        
        Holiday holiday = holidayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Holiday not found with ID: " + id));
        
        // Check if date is being changed and another holiday exists on new date
        if (!holiday.getDate().equals(holidayDTO.getDate()) && 
            holidayRepository.existsByDate(holidayDTO.getDate())) {
            throw new BusinessLogicException("Holiday already exists on " + holidayDTO.getDate());
        }
        
        holiday.setName(holidayDTO.getName());
        holiday.setDate(holidayDTO.getDate());
        holiday.setType(holidayDTO.getType());
        holiday.setRecurring(holidayDTO.getRecurring());
        
        holiday = holidayRepository.save(holiday);
        
        auditLogRepository.save(AuditLog.builder()
                .action("HOLIDAY_UPDATED")
                .entityName("Holiday")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Updated holiday: " + holiday.getName())
                .build());
        
        log.info("Holiday updated successfully");
        return mapToDTO(holiday);
    }
    
    @Override
    public void deleteHoliday(Long id) {
        log.info("Deleting holiday with ID: {}", id);
        
        Holiday holiday = holidayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Holiday not found with ID: " + id));
        
        holidayRepository.delete(holiday);
        
        auditLogRepository.save(AuditLog.builder()
                .action("HOLIDAY_DELETED")
                .entityName("Holiday")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Deleted holiday: " + holiday.getName())
                .build());
        
        log.info("Holiday deleted successfully");
    }
    
    @Override
    @Transactional(readOnly = true)
    public HolidayDTO getHolidayById(Long id) {
        log.info("Fetching holiday with ID: {}", id);
        Holiday holiday = holidayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Holiday not found with ID: " + id));
        return mapToDTO(holiday);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<HolidayDTO> getAllHolidays() {
        log.info("Fetching all holidays");
        return holidayRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<HolidayDTO> getRecurringHolidays() {
        log.info("Fetching recurring holidays");
        return holidayRepository.findByRecurringTrue().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<HolidayDTO> getHolidaysInRange(LocalDate startDate, LocalDate endDate) {
        log.info("Fetching holidays between {} and {}", startDate, endDate);
        return holidayRepository.findAll().stream()
                .filter(h -> !h.getDate().isBefore(startDate) && !h.getDate().isAfter(endDate))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean isHoliday(LocalDate date) {
        return holidayRepository.existsByDate(date);
    }
    
    private HolidayDTO mapToDTO(Holiday holiday) {
        return HolidayDTO.builder()
                .id(holiday.getId())
                .name(holiday.getName())
                .date(holiday.getDate())
                .type(holiday.getType())
                .recurring(holiday.getRecurring())
                .createdAt(holiday.getCreatedAt())
                .updatedAt(holiday.getUpdatedAt())
                .build();
    }
    
    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "SYSTEM";
    }
}
