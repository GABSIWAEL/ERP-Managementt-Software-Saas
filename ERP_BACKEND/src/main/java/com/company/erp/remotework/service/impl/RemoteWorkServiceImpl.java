package com.company.erp.remotework.service.impl;

import com.company.erp.audit.entity.AuditLog;
import com.company.erp.audit.repository.AuditLogRepository;
import com.company.erp.common.exception.BusinessLogicException;
import com.company.erp.common.exception.ResourceNotFoundException;
import com.company.erp.common.enums.RemoteWorkStatus;
import com.company.erp.employee.entity.Employee;
import com.company.erp.employee.repository.EmployeeRepository;
import com.company.erp.remotework.dto.RemoteWorkRequestDTO;
import com.company.erp.remotework.entity.RemoteWorkRequest;
import com.company.erp.remotework.repository.RemoteWorkRequestRepository;
import com.company.erp.remotework.service.RemoteWorkService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class RemoteWorkServiceImpl implements RemoteWorkService {
    
    private final RemoteWorkRequestRepository remoteWorkRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final AuditLogRepository auditLogRepository;
    
    @Override
    public RemoteWorkRequestDTO createRemoteWorkRequest(RemoteWorkRequestDTO remoteWorkRequestDTO) {
        log.info("Creating remote work request for employee ID: {}", remoteWorkRequestDTO.getEmployeeId());
        
        Employee employee = employeeRepository.findById(remoteWorkRequestDTO.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        
        RemoteWorkRequest remoteWorkRequest = RemoteWorkRequest.builder()
                .employee(employee)
                .date(remoteWorkRequestDTO.getDate())
                .reason(remoteWorkRequestDTO.getReason())
                .status(RemoteWorkStatus.PENDING)
                .build();
        
        remoteWorkRequest = remoteWorkRequestRepository.save(remoteWorkRequest);
        
        auditLogRepository.save(AuditLog.builder()
                .action("REMOTE_WORK_REQUEST_CREATED")
                .entityName("RemoteWorkRequest")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Remote work request created for " + remoteWorkRequestDTO.getDate())
                .build());
        
        return mapToDTO(remoteWorkRequest);
    }
    
    @Override
    public RemoteWorkRequestDTO updateRemoteWorkRequest(Long id, RemoteWorkRequestDTO remoteWorkRequestDTO) {
        log.info("Updating remote work request with ID: {}", id);
        
        RemoteWorkRequest remoteWorkRequest = remoteWorkRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Remote work request not found"));
        
        if (remoteWorkRequest.getStatus() != RemoteWorkStatus.PENDING) {
            throw new BusinessLogicException("Can only update PENDING remote work requests");
        }
        
        remoteWorkRequest.setDate(remoteWorkRequestDTO.getDate());
        remoteWorkRequest.setReason(remoteWorkRequestDTO.getReason());
        
        remoteWorkRequest = remoteWorkRequestRepository.save(remoteWorkRequest);
        
        auditLogRepository.save(AuditLog.builder()
                .action("REMOTE_WORK_REQUEST_UPDATED")
                .entityName("RemoteWorkRequest")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Remote work request updated")
                .build());
        
        return mapToDTO(remoteWorkRequest);
    }
    
    @Override
    public RemoteWorkRequestDTO approveRemoteWorkRequest(Long id, String comment) {
        log.info("Approving remote work request with ID: {}", id);
        
        RemoteWorkRequest remoteWorkRequest = remoteWorkRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Remote work request not found"));
        
        if (remoteWorkRequest.getStatus() != RemoteWorkStatus.PENDING) {
            throw new BusinessLogicException("Only PENDING requests can be approved");
        }
        
        remoteWorkRequest.setStatus(RemoteWorkStatus.APPROVED);
        remoteWorkRequest = remoteWorkRequestRepository.save(remoteWorkRequest);
        
        auditLogRepository.save(AuditLog.builder()
                .action("REMOTE_WORK_REQUEST_APPROVED")
                .entityName("RemoteWorkRequest")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Remote work request approved")
                .build());
        
        return mapToDTO(remoteWorkRequest);
    }
    
    @Override
    public RemoteWorkRequestDTO rejectRemoteWorkRequest(Long id, String comment) {
        log.info("Rejecting remote work request with ID: {}", id);
        
        RemoteWorkRequest remoteWorkRequest = remoteWorkRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Remote work request not found"));
        
        if (remoteWorkRequest.getStatus() != RemoteWorkStatus.PENDING) {
            throw new BusinessLogicException("Only PENDING requests can be rejected");
        }
        
        remoteWorkRequest.setStatus(RemoteWorkStatus.REJECTED);
        remoteWorkRequest = remoteWorkRequestRepository.save(remoteWorkRequest);
        
        auditLogRepository.save(AuditLog.builder()
                .action("REMOTE_WORK_REQUEST_REJECTED")
                .entityName("RemoteWorkRequest")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Remote work request rejected")
                .build());
        
        return mapToDTO(remoteWorkRequest);
    }
    
    @Override
    public void cancelRemoteWorkRequest(Long id) {
        log.info("Cancelling remote work request with ID: {}", id);
        
        RemoteWorkRequest remoteWorkRequest = remoteWorkRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Remote work request not found"));
        
        remoteWorkRequestRepository.delete(remoteWorkRequest);
        
        auditLogRepository.save(AuditLog.builder()
                .action("REMOTE_WORK_REQUEST_CANCELLED")
                .entityName("RemoteWorkRequest")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Remote work request cancelled")
                .build());
    }
    
    @Override
    @Transactional(readOnly = true)
    public RemoteWorkRequestDTO getRemoteWorkRequestById(Long id) {
        RemoteWorkRequest remoteWorkRequest = remoteWorkRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Remote work request not found"));
        return mapToDTO(remoteWorkRequest);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<RemoteWorkRequestDTO> getRemoteWorkRequestsByEmployeeId(Long employeeId) {
        log.info("Fetching remote work requests for employee ID: {}", employeeId);
        return remoteWorkRequestRepository.findByEmployeeId(employeeId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<RemoteWorkRequestDTO> getRemoteWorkRequestsByStatus(String status) {
        log.info("Fetching remote work requests with status: {}", status);
        return remoteWorkRequestRepository.findAll().stream()
                .filter(r -> r.getStatus().name().equalsIgnoreCase(status))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<RemoteWorkRequestDTO> getRemoteWorkRequestsByDateRange(LocalDate startDate, LocalDate endDate) {
        log.info("Fetching remote work requests between {} and {}", startDate, endDate);
        return remoteWorkRequestRepository.findAll().stream()
                .filter(r -> !r.getDate().isBefore(startDate) && !r.getDate().isAfter(endDate))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<RemoteWorkRequestDTO> getAllRemoteWorkRequests() {
        log.info("Fetching all remote work requests");
        return remoteWorkRequestRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<RemoteWorkRequestDTO> getPendingRemoteWorkRequests() {
        log.info("Fetching pending remote work requests");
        return remoteWorkRequestRepository.findByEmployeeIdAndStatus(null, RemoteWorkStatus.PENDING).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    private RemoteWorkRequestDTO mapToDTO(RemoteWorkRequest remoteWorkRequest) {
        return RemoteWorkRequestDTO.builder()
                .id(remoteWorkRequest.getId())
                .employeeId(remoteWorkRequest.getEmployee().getId())
                .date(remoteWorkRequest.getDate())
                .reason(remoteWorkRequest.getReason())
                .status(remoteWorkRequest.getStatus())
                .createdAt(remoteWorkRequest.getCreatedAt())
                .updatedAt(remoteWorkRequest.getUpdatedAt())
                .build();
    }
    
    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "SYSTEM";
    }
}
