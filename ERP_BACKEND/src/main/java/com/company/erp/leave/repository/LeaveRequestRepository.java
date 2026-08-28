package com.company.erp.leave.repository;

import com.company.erp.common.enums.LeaveStatus;
import com.company.erp.leave.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    List<LeaveRequest> findByEmployeeId(Long employeeId);

    List<LeaveRequest> findByEmployeeIdAndStatus(Long employeeId, LeaveStatus status);

    @Query("SELECT l FROM LeaveRequest l WHERE l.employee.id = ?1 " +
           "AND l.status IN (com.company.erp.common.enums.LeaveStatus.APPROVED) " +
           "AND ((l.startDate <= ?3 AND l.endDate >= ?2))")
    List<LeaveRequest> findOverlappingLeaves(Long employeeId, LocalDate startDate, LocalDate endDate);

}
