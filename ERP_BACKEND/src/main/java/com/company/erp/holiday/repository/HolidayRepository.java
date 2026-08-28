package com.company.erp.holiday.repository;

import com.company.erp.holiday.entity.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface HolidayRepository extends JpaRepository<Holiday, Long> {

    List<Holiday> findByRecurringTrue();

    boolean existsByDate(LocalDate date);

}
