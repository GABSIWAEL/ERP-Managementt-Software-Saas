package com.company.erp.asset.service.impl;

import com.company.erp.asset.dto.AssetDTO;
import com.company.erp.asset.entity.Asset;
import com.company.erp.asset.repository.AssetRepository;
import com.company.erp.asset.service.AssetService;
import com.company.erp.audit.entity.AuditLog;
import com.company.erp.audit.repository.AuditLogRepository;
import com.company.erp.common.enums.AssetStatus;
import com.company.erp.common.enums.UserRole;
import com.company.erp.common.exception.BusinessLogicException;
import com.company.erp.common.exception.ResourceNotFoundException;
import com.company.erp.employee.entity.Employee;
import com.company.erp.employee.repository.EmployeeRepository;
import com.company.erp.notification.entity.NotificationType;
import com.company.erp.notification.service.AppNotificationService;
import com.company.erp.security.entity.User;
import com.company.erp.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AssetServiceImpl implements AssetService {
    
    private final AssetRepository assetRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final AppNotificationService appNotificationService;
    
    @Override
    public AssetDTO createAsset(AssetDTO assetDTO) {
        log.info("Creating asset: {}", assetDTO.getName());
        
        // Check if serial number already exists
        if (assetDTO.getSerialNumber() != null && assetRepository.existsBySerialNumber(assetDTO.getSerialNumber())) {
            throw new BusinessLogicException("Asset with serial number already exists");
        }
        
        Asset asset = Asset.builder()
                .name(assetDTO.getName())
                .assetCode(assetDTO.getAssetCode())
                .serialNumber(assetDTO.getSerialNumber())
                .category(assetDTO.getCategory())
                .type(assetDTO.getType())
                .value(assetDTO.getValue())
                .purchaseDate(assetDTO.getPurchaseDate())
                .status(AssetStatus.AVAILABLE)
                .build();
        
        asset = assetRepository.save(asset);
        
        auditLogRepository.save(AuditLog.builder()
                .action("ASSET_CREATED")
                .entityName("Asset")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Asset created: " + assetDTO.getName())
                .build());
        
        return mapToDTO(asset);
    }
    
    @Override
    public AssetDTO updateAsset(Long id, AssetDTO assetDTO) {
        log.info("Updating asset with ID: {}", id);
        
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));
        
        asset.setName(assetDTO.getName());
        asset.setCategory(assetDTO.getCategory());
        asset.setType(assetDTO.getType());
        asset.setAssetCode(assetDTO.getAssetCode());
        asset.setSerialNumber(assetDTO.getSerialNumber());
        asset.setValue(assetDTO.getValue());
        asset.setPurchaseDate(assetDTO.getPurchaseDate());
        
        asset = assetRepository.save(asset);
        
        auditLogRepository.save(AuditLog.builder()
                .action("ASSET_UPDATED")
                .entityName("Asset")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Asset updated")
                .build());
        
        return mapToDTO(asset);
    }
    
    @Override
    public AssetDTO assignAsset(Long id, Long employeeId) {
        try {
            log.info("Assigning asset ID: {} to employee: {}", id, employeeId);
            
            Asset asset = assetRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));
            
            Employee employee = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
            
            if (asset.getStatus() != AssetStatus.AVAILABLE && asset.getStatus() != AssetStatus.RETURNED) {
                throw new BusinessLogicException("Asset cannot be assigned. Current status: " + asset.getStatus());
            }
            
            asset.setAssignedTo(employee);
            asset.setStatus(AssetStatus.ASSIGNED);
            
            asset = assetRepository.save(asset);
            log.info("Asset saved successfully with status: {}", asset.getStatus());
            
            auditLogRepository.save(AuditLog.builder()
                    .action("ASSET_ASSIGNED")
                    .entityName("Asset")
                    .performedBy(getCurrentUsername())
                    .timestamp(LocalDateTime.now())
                    .details("Asset assigned to employee " + employeeId)
                    .build());
            
            // Send notification to the assigned employee
            try {
                log.info("Creating notification for employee: {}", employeeId);
                appNotificationService.createNotificationForEmployee(
                        employeeId,
                        "Asset Assigned",
                        String.format("You have been assigned %s (Code: %s). Please acknowledge receipt of this asset.",
                                asset.getName(),
                                asset.getAssetCode()),
                        NotificationType.ASSET_ASSIGNED,
                        asset.getId()
                );
                log.info("Asset assignment notification created for employee: {}", employeeId);
            } catch (Exception e) {
                log.error("Error creating asset assignment notification for employee {}: {}", employeeId, e.getMessage(), e);
            }
            
            AssetDTO dto = mapToDTO(asset);
            log.info("Asset DTO mapped successfully");
            return dto;
        } catch (Exception e) {
            log.error("Error assigning asset {} to employee {}: {}", id, employeeId, e.getMessage(), e);
            throw new BusinessLogicException("Failed to assign asset: " + e.getMessage());
        }
    }
    
    @Override
    public AssetDTO returnAsset(Long id) {
        log.info("Returning asset with ID: {}", id);
        
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));
        
        asset.setAssignedTo(null);
        asset.setStatus(AssetStatus.AVAILABLE);
        
        asset = assetRepository.save(asset);
        
        auditLogRepository.save(AuditLog.builder()
                .action("ASSET_RETURNED")
                .entityName("Asset")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Asset returned")
                .build());
        
        return mapToDTO(asset);
    }
    
    @Override
    public void deleteAsset(Long id) {
        log.info("Deleting asset with ID: {}", id);
        
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));
        
        assetRepository.delete(asset);
        
        auditLogRepository.save(AuditLog.builder()
                .action("ASSET_DELETED")
                .entityName("Asset")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Asset deleted")
                .build());
    }
    
    @Override
    @Transactional(readOnly = true)
    public AssetDTO getAssetById(Long id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));
        User currentUser = getCurrentUser();

        if (currentUser.getRole() == UserRole.EMPLOYEE) {
            Employee currentEmployee = employeeRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new BusinessLogicException("Employee profile not found"));
            if (asset.getAssignedTo() == null || !asset.getAssignedTo().getId().equals(currentEmployee.getId())) {
                throw new BusinessLogicException("You do not have permission to view this asset");
            }
        }

        if (currentUser.getRole() == UserRole.MANAGER) {
            Employee currentEmployee = employeeRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new BusinessLogicException("Manager profile not found"));
            if (asset.getAssignedTo() == null || asset.getAssignedTo().getDepartment() == null || currentEmployee.getDepartment() == null
                    || !asset.getAssignedTo().getDepartment().getId().equals(currentEmployee.getDepartment().getId())) {
                throw new BusinessLogicException("You do not have permission to view this asset");
            }
        }

        return mapToDTO(asset);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AssetDTO> getAllAssets() {
        log.info("Fetching all assets");
        User currentUser = getCurrentUser();

        if (currentUser.getRole() == UserRole.MANAGER) {
            Employee managerEmployee = employeeRepository.findByUserId(currentUser.getId())
                    .orElse(null);
            if (managerEmployee == null || managerEmployee.getDepartment() == null) {
                return Collections.emptyList();
            }

            Long departmentId = managerEmployee.getDepartment().getId();
            return assetRepository.findAll().stream()
                    .filter(asset -> asset.getAssignedTo() != null
                            && asset.getAssignedTo().getDepartment() != null
                            && departmentId.equals(asset.getAssignedTo().getDepartment().getId()))
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        }

        return assetRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AssetDTO> getAssetsByStatus(String status) {
        log.info("Fetching assets with status: {}", status);
        return assetRepository.findByStatus(AssetStatus.valueOf(status.toUpperCase())).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AssetDTO> getAssetsByEmployeeId(Long employeeId) {
        log.info("Fetching assets for employee: {}", employeeId);
        User currentUser = getCurrentUser();

        if (currentUser.getRole() == UserRole.EMPLOYEE) {
            Employee currentEmployee = employeeRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new BusinessLogicException("Employee profile not found"));
            if (!currentEmployee.getId().equals(employeeId)) {
                throw new BusinessLogicException("You do not have permission to view another employee's assets");
            }
        }

        if (currentUser.getRole() == UserRole.MANAGER) {
            Employee currentEmployee = employeeRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new BusinessLogicException("Manager profile not found"));
            Employee requestedEmployee = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

            if (currentEmployee.getDepartment() == null || requestedEmployee.getDepartment() == null
                    || !currentEmployee.getDepartment().getId().equals(requestedEmployee.getDepartment().getId())) {
                throw new BusinessLogicException("You do not have permission to view assets for this employee");
            }
        }

        return assetRepository.findByAssignedToId(employeeId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public AssetDTO markAssetAsDamaged(Long id, String reason) {
        log.info("Marking asset ID: {} as damaged", id);
        
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));
        
        asset.setStatus(AssetStatus.DAMAGED);
        asset.setAssignedTo(null);
        asset = assetRepository.save(asset);
        
        auditLogRepository.save(AuditLog.builder()
                .action("ASSET_MARKED_DAMAGED")
                .entityName("Asset")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Asset marked as damaged. Reason: " + reason)
                .build());
        
        return mapToDTO(asset);
    }
    
    @Override
    public AssetDTO markAssetAsSold(Long id, String reason) {
        log.info("Marking asset ID: {} as sold", id);
        
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));
        
        asset.setStatus(AssetStatus.SOLD);
        asset.setAssignedTo(null);
        asset = assetRepository.save(asset);
        
        auditLogRepository.save(AuditLog.builder()
                .action("ASSET_MARKED_SOLD")
                .entityName("Asset")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Asset marked as sold. Reason: " + reason)
                .build());
        
        return mapToDTO(asset);
    }
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BusinessLogicException("User is not authenticated");
        }

        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }
    
    private AssetDTO mapToDTO(Asset asset) {
        return AssetDTO.builder()
                .id(asset.getId())
                .name(asset.getName())
                .assetCode(asset.getAssetCode())
                .serialNumber(asset.getSerialNumber())
                .category(asset.getCategory())
                .type(asset.getType())
                .value(asset.getValue())
                .purchaseDate(asset.getPurchaseDate())
                .assignedToId(asset.getAssignedTo() != null ? asset.getAssignedTo().getId() : null)
                .assignedToName(asset.getAssignedTo() != null ? asset.getAssignedTo().getFirstName() + " " + asset.getAssignedTo().getLastName() : null)
                .status(asset.getStatus())
                .createdAt(asset.getCreatedAt())
                .updatedAt(asset.getUpdatedAt())
                .build();
    }
    
    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "SYSTEM";
    }
}
