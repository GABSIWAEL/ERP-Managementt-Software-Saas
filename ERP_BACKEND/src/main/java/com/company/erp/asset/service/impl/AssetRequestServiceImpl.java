package com.company.erp.asset.service.impl;

import com.company.erp.asset.dto.AssetDTO;
import com.company.erp.asset.dto.AssetRequestDTO;
import com.company.erp.asset.entity.Asset;
import com.company.erp.asset.entity.AssetRequest;
import com.company.erp.asset.repository.AssetRepository;
import com.company.erp.asset.repository.AssetRequestRepository;
import com.company.erp.asset.service.AssetRequestService;
import com.company.erp.asset.service.AssetService;
import com.company.erp.audit.entity.AuditLog;
import com.company.erp.audit.repository.AuditLogRepository;
import com.company.erp.common.enums.AssetRequestStatus;
import com.company.erp.common.enums.AssetRequestType;
import com.company.erp.common.enums.AssetStatus;
import com.company.erp.common.enums.UserRole;
import com.company.erp.notification.entity.NotificationType;
import com.company.erp.common.exception.BusinessLogicException;
import com.company.erp.common.exception.ResourceNotFoundException;
import com.company.erp.employee.entity.Employee;
import com.company.erp.employee.repository.EmployeeRepository;
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
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AssetRequestServiceImpl implements AssetRequestService {

    private final AssetRequestRepository assetRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final AssetRepository assetRepository;
    private final AssetService assetService;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final AppNotificationService appNotificationService;

    @Override
    public AssetRequestDTO createAssetRequest(AssetRequestDTO assetRequestDTO) {
        log.info("Creating asset request: {}", assetRequestDTO.getRequestType());

        User currentUser = getCurrentUser();
        if (currentUser.getRole() == UserRole.HR || currentUser.getRole() == UserRole.ACCOUNTANT) {
            throw new BusinessLogicException("Only managers, employees, and administrators can submit asset requests");
        }

        Employee requester = employeeRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new BusinessLogicException("Requester must have an employee profile"));

        AssetRequest assetRequest = AssetRequest.builder()
                .requestType(assetRequestDTO.getRequestType())
                .status(AssetRequestStatus.PENDING)
                .reason(assetRequestDTO.getReason())
                .details(assetRequestDTO.getDetails())
                .assetName(assetRequestDTO.getAssetName())
                .assetCode(assetRequestDTO.getAssetCode())
                .category(assetRequestDTO.getCategory())
                .type(assetRequestDTO.getType())
                .estimatedValue(assetRequestDTO.getEstimatedValue())
                .requestedBy(requester)
                .responseComment(null)
                .build();

        if (assetRequestDTO.getRequestedForEmployeeId() != null) {
            assetRequest.setRequestedForEmployee(
                    employeeRepository.findById(assetRequestDTO.getRequestedForEmployeeId())
                            .orElseThrow(() -> new ResourceNotFoundException("Requested employee not found")));
        }

        if (assetRequestDTO.getRequestType() == AssetRequestType.DAMAGED_ASSET) {
            if (assetRequestDTO.getAssetId() == null) {
                throw new BusinessLogicException("Asset ID is required for damaged asset requests");
            }
            Asset asset = assetRepository.findById(assetRequestDTO.getAssetId())
                    .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));
            assetRequest.setAsset(asset);
        }

        assetRequest = assetRequestRepository.save(assetRequest);

        appNotificationService.createNotificationForRole(
                "New asset request submitted",
                String.format("%s requested a new asset action.", requester.getFirstName()),
                UserRole.ACCOUNTANT,
                NotificationType.GENERAL,
                assetRequest.getId());

        auditLogRepository.save(AuditLog.builder()
                .action("ASSET_REQUEST_CREATED")
                .entityName("AssetRequest")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Asset request submitted: " + assetRequest.getRequestType())
                .build());

        return mapToDTO(assetRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssetRequestDTO> getAllAssetRequests() {
        log.info("Fetching asset requests");
        User currentUser = getCurrentUser();

        if (currentUser.getRole() == UserRole.ACCOUNTANT || currentUser.getRole() == UserRole.ADMIN) {
            return assetRequestRepository.findAll().stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        }

        if (currentUser.getRole() == UserRole.MANAGER || currentUser.getRole() == UserRole.EMPLOYEE) {
            Employee requester = employeeRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new BusinessLogicException("Requester profile not found"));
            return assetRequestRepository.findByRequestedById(requester.getId()).stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        }

        throw new BusinessLogicException("You do not have permission to view asset requests");
    }

    @Override
    @Transactional(readOnly = true)
    public AssetRequestDTO getAssetRequestById(Long id) {
        AssetRequest assetRequest = assetRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset request not found"));

        User currentUser = getCurrentUser();
        if (currentUser.getRole() == UserRole.MANAGER || currentUser.getRole() == UserRole.EMPLOYEE) {
            Employee requester = employeeRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new BusinessLogicException("Requester profile not found"));
            if (!assetRequest.getRequestedBy().getId().equals(requester.getId())) {
                throw new BusinessLogicException("You do not have permission to view this asset request");
            }
        }

        if (currentUser.getRole() == UserRole.HR) {
            throw new BusinessLogicException("You do not have permission to view asset requests");
        }

        return mapToDTO(assetRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssetRequestDTO> getAssetRequestsByStatus(String status) {
        log.info("Fetching asset requests with status: {}", status);
        AssetRequestStatus requestStatus = AssetRequestStatus.valueOf(status.toUpperCase());
        User currentUser = getCurrentUser();

        if (currentUser.getRole() != UserRole.ACCOUNTANT && currentUser.getRole() != UserRole.ADMIN) {
            throw new BusinessLogicException("Only accountants and administrators can filter asset requests by status");
        }

        return assetRequestRepository.findByStatus(requestStatus).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public AssetRequestDTO approveAssetRequest(Long id, String comment) {
        log.info("Approving asset request ID: {}", id);
        AssetRequest assetRequest = assetRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset request not found"));

        if (assetRequest.getStatus() != AssetRequestStatus.PENDING) {
            throw new BusinessLogicException("Only pending requests can be approved");
        }

        assetRequest.setStatus(AssetRequestStatus.APPROVED);
        assetRequest.setResponseComment(comment);

        if (assetRequest.getRequestType() == AssetRequestType.NEW_ASSET) {
            String safeAssetName = (assetRequest.getAssetName() == null || assetRequest.getAssetName().isBlank())
                    ? "Asset Request " + assetRequest.getId()
                    : assetRequest.getAssetName().trim();
            String safeCategory = (assetRequest.getCategory() == null || assetRequest.getCategory().isBlank())
                    ? "GENERAL"
                    : assetRequest.getCategory().trim();
            String safeType = (assetRequest.getType() == null || assetRequest.getType().isBlank())
                    ? "OTHER"
                    : assetRequest.getType().trim();

            Asset asset = Asset.builder()
                    .name(safeAssetName)
                    .assetCode(assetRequest.getAssetCode())
                    .serialNumber(null)
                    .category(safeCategory)
                    .type(safeType)
                    .value(assetRequest.getEstimatedValue())
                    .purchaseDate(null)
                    .status(AssetStatus.AVAILABLE)
                    .build();
            assetRepository.save(asset);
        }

        if (assetRequest.getRequestType() == AssetRequestType.DAMAGED_ASSET) {
            if (assetRequest.getAsset() == null) {
                throw new BusinessLogicException("Damaged asset request must reference an asset");
            }
            assetService.markAssetAsDamaged(assetRequest.getAsset().getId(), assetRequest.getReason());
        }

        assetRequest = assetRequestRepository.save(assetRequest);

        if (assetRequest.getRequestedBy() != null) {
            appNotificationService.createNotificationForEmployee(
                    assetRequest.getRequestedBy().getId(),
                    "Asset request approved",
                    "Your asset request has been approved by the accounting team.",
                    NotificationType.GENERAL,
                    assetRequest.getId());
        }

        auditLogRepository.save(AuditLog.builder()
                .action("ASSET_REQUEST_APPROVED")
                .entityName("AssetRequest")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Asset request approved")
                .build());

        return mapToDTO(assetRequest);
    }

    @Override
    public AssetRequestDTO rejectAssetRequest(Long id, String reason) {
        log.info("Rejecting asset request ID: {}", id);
        AssetRequest assetRequest = assetRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset request not found"));

        if (assetRequest.getStatus() != AssetRequestStatus.PENDING) {
            throw new BusinessLogicException("Only pending requests can be rejected");
        }

        assetRequest.setStatus(AssetRequestStatus.REJECTED);
        assetRequest.setResponseComment(reason);
        assetRequest = assetRequestRepository.save(assetRequest);

        if (assetRequest.getRequestedBy() != null) {
            appNotificationService.createNotificationForEmployee(
                    assetRequest.getRequestedBy().getId(),
                    "Asset request rejected",
                    "Your asset request has been rejected. Reason: " + reason,
                    NotificationType.GENERAL,
                    assetRequest.getId());
        }

        auditLogRepository.save(AuditLog.builder()
                .action("ASSET_REQUEST_REJECTED")
                .entityName("AssetRequest")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Asset request rejected")
                .build());

        return mapToDTO(assetRequest);
    }

    private AssetRequestDTO mapToDTO(AssetRequest assetRequest) {
        return AssetRequestDTO.builder()
                .id(assetRequest.getId())
                .requestType(assetRequest.getRequestType())
                .status(assetRequest.getStatus())
                .reason(assetRequest.getReason())
                .details(assetRequest.getDetails())
                .assetName(assetRequest.getAssetName())
                .assetCode(assetRequest.getAssetCode())
                .category(assetRequest.getCategory())
                .type(assetRequest.getType())
                .estimatedValue(assetRequest.getEstimatedValue())
                .assetId(assetRequest.getAsset() != null ? assetRequest.getAsset().getId() : null)
                .requestedById(assetRequest.getRequestedBy() != null ? assetRequest.getRequestedBy().getId() : null)
                .requestedByName(assetRequest.getRequestedBy() != null ? assetRequest.getRequestedBy().getFirstName() + " " + assetRequest.getRequestedBy().getLastName() : null)
                .requestedForEmployeeId(assetRequest.getRequestedForEmployee() != null ? assetRequest.getRequestedForEmployee().getId() : null)
                .requestedForEmployeeName(assetRequest.getRequestedForEmployee() != null ? assetRequest.getRequestedForEmployee().getFirstName() + " " + assetRequest.getRequestedForEmployee().getLastName() : null)
                .responseComment(assetRequest.getResponseComment())
                .createdAt(assetRequest.getCreatedAt())
                .updatedAt(assetRequest.getUpdatedAt())
                .build();
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

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "SYSTEM";
    }
}
