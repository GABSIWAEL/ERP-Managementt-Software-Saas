package com.company.erp.exit.repository;

import com.company.erp.common.enums.ResignationStatus;
import com.company.erp.exit.entity.ResignationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResignationRequestRepository extends JpaRepository<ResignationRequest, Long> {
    
    List<ResignationRequest> findByEmployeeId(Long employeeId);
    
    List<ResignationRequest> findByStatus(ResignationStatus status);
    
    Optional<ResignationRequest> findByEmployeeIdAndStatus(Long employeeId, ResignationStatus status);
}
