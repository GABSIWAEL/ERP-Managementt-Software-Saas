package com.company.erp.warning.service;

import com.company.erp.warning.dto.WarningDTO;
import java.time.LocalDateTime;
import java.util.List;

public interface WarningService {
    
    WarningDTO createWarning(WarningDTO warningDTO);
    
    WarningDTO updateWarning(Long id, WarningDTO warningDTO);
    
    WarningDTO resolveWarning(Long id);
    
    void deleteWarning(Long id);
    
    WarningDTO getWarningById(Long id);
    
    List<WarningDTO> getWarningsByEmployeeId(Long employeeId);
    
    List<WarningDTO> getWarningsByStatus(String status);
    
    List<WarningDTO> getWarningsBySeverity(String severity);
    
    List<WarningDTO> getAllWarnings();
    
    WarningDTO escalateWarning(Long id);
    
    WarningDTO scheduleReunion(Long id, LocalDateTime reunionScheduledAt);
    
    WarningDTO submitReunionReport(Long id, String reunionReport);
}
