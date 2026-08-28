package com.company.erp.remotework.repository;

import com.company.erp.common.enums.RemoteWorkStatus;
import com.company.erp.remotework.entity.RemoteWorkRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RemoteWorkRequestRepository extends JpaRepository<RemoteWorkRequest, Long> {

    List<RemoteWorkRequest> findByEmployeeId(Long employeeId);

    List<RemoteWorkRequest> findByEmployeeIdAndStatus(Long employeeId, RemoteWorkStatus status);

    List<RemoteWorkRequest> findByEmployeeIdAndDateBetween(Long employeeId, LocalDate startDate, LocalDate endDate);

}
