package com.company.erp.holiday.service;

import com.company.erp.holiday.dto.HolidayDTO;
import com.company.erp.holiday.entity.Holiday;

import java.time.LocalDate;
import java.util.List;

public interface HolidayService {
    
    HolidayDTO createHoliday(HolidayDTO holidayDTO);
    
    HolidayDTO updateHoliday(Long id, HolidayDTO holidayDTO);
    
    void deleteHoliday(Long id);
    
    HolidayDTO getHolidayById(Long id);
    
    List<HolidayDTO> getAllHolidays();
    
    List<HolidayDTO> getRecurringHolidays();
    
    List<HolidayDTO> getHolidaysInRange(LocalDate startDate, LocalDate endDate);
    
    boolean isHoliday(LocalDate date);
}
