package com.company.erp.holiday.controller;

import com.company.erp.common.dto.ApiResponse;
import com.company.erp.holiday.dto.HolidayDTO;
import com.company.erp.holiday.service.HolidayService;
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
@RequestMapping("/api/holidays")
@RequiredArgsConstructor
public class HolidayController {
    
    private final HolidayService holidayService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<HolidayDTO>> createHoliday(@Valid @RequestBody HolidayDTO holidayDTO) {
        log.info("Creating new holiday: {}", holidayDTO.getName());
        HolidayDTO createdHoliday = holidayService.createHoliday(holidayDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(createdHoliday, "Holiday created successfully", 201));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<HolidayDTO>> updateHoliday(
            @PathVariable Long id,
            @Valid @RequestBody HolidayDTO holidayDTO) {
        log.info("Updating holiday with ID: {}", id);
        HolidayDTO updatedHoliday = holidayService.updateHoliday(id, holidayDTO);
        return ResponseEntity.ok(ApiResponse.success(updatedHoliday, "Holiday updated successfully"));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<Void>> deleteHoliday(@PathVariable Long id) {
        log.info("Deleting holiday with ID: {}", id);
        holidayService.deleteHoliday(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Holiday deleted successfully"));
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<List<HolidayDTO>>> getAllHolidays() {
        log.info("Fetching all holidays");
        List<HolidayDTO> holidays = holidayService.getAllHolidays();
        return ResponseEntity.ok(ApiResponse.success(holidays, "Holidays fetched successfully"));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<HolidayDTO>> getHolidayById(@PathVariable Long id) {
        log.info("Fetching holiday with ID: {}", id);
        HolidayDTO holiday = holidayService.getHolidayById(id);
        return ResponseEntity.ok(ApiResponse.success(holiday, "Holiday fetched successfully"));
    }
    
    @GetMapping("/recurring")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<HolidayDTO>>> getRecurringHolidays() {
        log.info("Fetching recurring holidays");
        List<HolidayDTO> holidays = holidayService.getRecurringHolidays();
        return ResponseEntity.ok(ApiResponse.success(holidays, "Recurring holidays fetched successfully"));
    }
    
    @GetMapping("/range")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<HolidayDTO>>> getHolidaysInRange(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        log.info("Fetching holidays between {} and {}", startDate, endDate);
        List<HolidayDTO> holidays = holidayService.getHolidaysInRange(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(holidays, "Holidays fetched successfully"));
    }
    
    @GetMapping("/check/{date}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<Boolean>> isHoliday(@PathVariable LocalDate date) {
        log.info("Checking if {} is a holiday", date);
        boolean isHoliday = holidayService.isHoliday(date);
        return ResponseEntity.ok(ApiResponse.success(isHoliday, "Holiday check completed"));
    }
}
