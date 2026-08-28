package com.company.erp.remotework.service;

import com.company.erp.remotework.dto.RemoteWorkRequestDTO;
import java.time.LocalDate;
import java.util.List;

public interface RemoteWorkService {
    
    RemoteWorkRequestDTO createRemoteWorkRequest(RemoteWorkRequestDTO remoteWorkRequestDTO);
    
    RemoteWorkRequestDTO updateRemoteWorkRequest(Long id, RemoteWorkRequestDTO remoteWorkRequestDTO);
    
    RemoteWorkRequestDTO approveRemoteWorkRequest(Long id, String comment);
    
    RemoteWorkRequestDTO rejectRemoteWorkRequest(Long id, String comment);
    
    void cancelRemoteWorkRequest(Long id);
    
    RemoteWorkRequestDTO getRemoteWorkRequestById(Long id);
    
    List<RemoteWorkRequestDTO> getRemoteWorkRequestsByEmployeeId(Long employeeId);
    
    List<RemoteWorkRequestDTO> getRemoteWorkRequestsByStatus(String status);
    
    List<RemoteWorkRequestDTO> getRemoteWorkRequestsByDateRange(LocalDate startDate, LocalDate endDate);
    
    List<RemoteWorkRequestDTO> getAllRemoteWorkRequests();
    
    List<RemoteWorkRequestDTO> getPendingRemoteWorkRequests();
}
