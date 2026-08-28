package com.company.erp.warning.repository;

import com.company.erp.common.enums.WarningStatus;
import com.company.erp.warning.entity.Warning;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WarningRepository extends JpaRepository<Warning, Long> {

    List<Warning> findByEmployeeId(Long employeeId);

    List<Warning> findByEmployeeIdAndStatus(Long employeeId, WarningStatus status);

}
