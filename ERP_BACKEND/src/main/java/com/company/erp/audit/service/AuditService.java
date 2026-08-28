package com.company.erp.audit.service;

import com.company.erp.audit.dto.AuditLogDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;
import java.util.List;

public interface AuditService {
    
    AuditLogDTO getAuditLogById(Long id);
    
    List<AuditLogDTO> getAllAuditLogs();
    
    Page<AuditLogDTO> getAllAuditLogsPaginated(Pageable pageable);
    
    List<AuditLogDTO> getAuditLogsByAction(String action);
    
    Page<AuditLogDTO> getAuditLogsByActionPaginated(String action, Pageable pageable);
    
    List<AuditLogDTO> getAuditLogsByPerformedBy(String username);
    
    Page<AuditLogDTO> getAuditLogsByPerformedByPaginated(String username, Pageable pageable);
    
    List<AuditLogDTO> getAuditLogsByEntity(String entityName);
    
    Page<AuditLogDTO> getAuditLogsByEntityPaginated(String entityName, Pageable pageable);
    
    List<AuditLogDTO> getAuditLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    
    Page<AuditLogDTO> getAuditLogsByDateRangePaginated(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    void deleteAuditLog(Long id);
}
