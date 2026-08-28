package com.company.erp.audit.service.impl;

import com.company.erp.audit.dto.AuditLogDTO;
import com.company.erp.audit.entity.AuditLog;
import com.company.erp.audit.repository.AuditLogRepository;
import com.company.erp.audit.service.AuditService;
import com.company.erp.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuditServiceImpl implements AuditService {
    
    private final AuditLogRepository auditLogRepository;
    
    @Override
    @Transactional(readOnly = true)
    public AuditLogDTO getAuditLogById(Long id) {
        log.info("Fetching audit log with ID: {}", id);
        AuditLog auditLog = auditLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Audit log not found"));
        return mapToDTO(auditLog);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AuditLogDTO> getAllAuditLogs() {
        log.info("Fetching all audit logs");
        return auditLogRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<AuditLogDTO> getAllAuditLogsPaginated(Pageable pageable) {
        log.info("Fetching all audit logs - paginated");
        return auditLogRepository.findAll(pageable)
                .map(this::mapToDTO);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AuditLogDTO> getAuditLogsByAction(String action) {
        log.info("Fetching audit logs by action: {}", action);
        return auditLogRepository.findAll().stream()
                .filter(a -> a.getAction().equalsIgnoreCase(action))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<AuditLogDTO> getAuditLogsByActionPaginated(String action, Pageable pageable) {
        log.info("Fetching audit logs by action: {} - paginated", action);
        return auditLogRepository.findByAction(action, pageable)
                .map(this::mapToDTO);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AuditLogDTO> getAuditLogsByPerformedBy(String username) {
        log.info("Fetching audit logs performed by: {}", username);
        return auditLogRepository.findByPerformedBy(username).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<AuditLogDTO> getAuditLogsByPerformedByPaginated(String username, Pageable pageable) {
        log.info("Fetching audit logs performed by: {} - paginated", username);
        return auditLogRepository.findByPerformedBy(username, pageable)
                .map(this::mapToDTO);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AuditLogDTO> getAuditLogsByEntity(String entityName) {
        log.info("Fetching audit logs for entity: {}", entityName);
        return auditLogRepository.findAll().stream()
                .filter(a -> a.getEntityName().equalsIgnoreCase(entityName))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<AuditLogDTO> getAuditLogsByEntityPaginated(String entityName, Pageable pageable) {
        log.info("Fetching audit logs for entity: {} - paginated", entityName);
        return auditLogRepository.findByEntityName(entityName, pageable)
                .map(this::mapToDTO);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AuditLogDTO> getAuditLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Fetching audit logs between {} and {}", startDate, endDate);
        return auditLogRepository.findAll().stream()
                .filter(a -> a.getTimestamp().isAfter(startDate) && a.getTimestamp().isBefore(endDate))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<AuditLogDTO> getAuditLogsByDateRangePaginated(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        log.info("Fetching audit logs between {} and {} - paginated", startDate, endDate);
        return auditLogRepository.findByDateRange(startDate, endDate, pageable)
                .map(this::mapToDTO);
    }
    
    @Override
    public void deleteAuditLog(Long id) {
        log.info("Deleting audit log with ID: {}", id);
        
        AuditLog auditLog = auditLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Audit log not found"));
        
        auditLogRepository.delete(auditLog);
    }
    
    private AuditLogDTO mapToDTO(AuditLog auditLog) {
        return AuditLogDTO.builder()
                .id(auditLog.getId())
                .action(auditLog.getAction())
                .entityName(auditLog.getEntityName())
                .performedBy(auditLog.getPerformedBy())
                .timestamp(auditLog.getTimestamp())
                .details(auditLog.getDetails())
                .ipAddress(auditLog.getIpAddress())
                .createdAt(auditLog.getCreatedAt())
                .updatedAt(auditLog.getUpdatedAt())
                .build();
    }
}
