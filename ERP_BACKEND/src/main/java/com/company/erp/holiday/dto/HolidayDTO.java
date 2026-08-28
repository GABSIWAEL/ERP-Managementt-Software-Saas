package com.company.erp.holiday.dto;

import com.company.erp.common.enums.HolidayType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HolidayDTO {

    private Long id;

    @NotBlank(message = "Holiday name is required")
    private String name;

    @NotNull(message = "Holiday date is required")
    private LocalDate date;

    @NotNull(message = "Holiday type is required")
    private HolidayType type;

    @NotNull(message = "Recurring flag is required")
    private Boolean recurring;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
