package com.company.erp.payroll.repository;

import com.company.erp.payroll.entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Long> {

    List<Payroll> findByEmployeeId(Long employeeId);

    Optional<Payroll> findByEmployeeIdAndMonth(Long employeeId, String month);

    List<Payroll> findByMonth(String month);

    List<Payroll> findByEmployeeIdAndLockedFalse(Long employeeId);

}
