# ERP System - Implementation Guide

This document provides guidance on implementing the remaining modules and services.

## 🎯 Quick Implementation Template

### Service Template Pattern

```java
package com.company.erp.modulename.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional
public class ModuleServiceImpl implements ModuleService {

    // Inject repositories
    @Autowired
    private ModuleRepository moduleRepository;
    
    @Autowired
    private AuditLogRepository auditLogRepository;
    
    // Implement interface methods
    @Override
    public ModuleDTO create(ModuleDTO dto) {
        // 1. Validate business rules
        // 2. Map DTO to entity
        // 3. Save to database
        // 4. Create audit log if needed
        // 5. Log action
        // 6. Return DTO
    }
    
    @Override
    @Transactional(readOnly = true)
    public ModuleDTO getById(Long id) {
        // Fetch and return
    }
    
    // Helper method for mapping
    private ModuleDTO mapToDTO(Module entity) {
        return ModuleDTO.builder()
            .id(entity.getId())
            // ... other fields
            .build();
    }
}
```

### Controller Template Pattern

```java
package com.company.erp.modulename.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/modules")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ModuleController {

    @Autowired
    private ModuleService moduleService;

    @PostMapping
    @PreAuthorize("hasRole('REQUIRED_ROLE')")
    public ResponseEntity<ApiResponse<ModuleDTO>> create(@Valid @RequestBody ModuleDTO dto) {
        log.info("Creating module");
        ModuleDTO response = moduleService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Created successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("authenticated")
    public ResponseEntity<ApiResponse<ModuleDTO>> getById(@PathVariable Long id) {
        ModuleDTO response = moduleService.getById(id);
        return ResponseEntity.ok()
                .body(ApiResponse.success(response, "Retrieved successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('REQUIRED_ROLE')")
    public ResponseEntity<ApiResponse<ModuleDTO>> update(
            @PathVariable Long id,
            @Valid @RequestBody ModuleDTO dto) {
        ModuleDTO response = moduleService.update(id, dto);
        return ResponseEntity.ok()
                .body(ApiResponse.success(response, "Updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('REQUIRED_ROLE')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        moduleService.delete(id);
        return ResponseEntity.ok()
                .body(ApiResponse.success(null, "Deleted successfully"));
    }

    @GetMapping
    @PreAuthorize("authenticated")
    public ResponseEntity<ApiResponse<List<ModuleDTO>>> getAll() {
        List<ModuleDTO> response = moduleService.getAll();
        return ResponseEntity.ok()
                .body(ApiResponse.success(response, "Retrieved successfully"));
    }
}
```

## 📋 Module-by-Module Implementation Checklist

### Holiday Module
- [x] Entity
- [x] Repository
- [x] DTO
- [ ] Service Interface
- [ ] Service Implementation
- [ ] Controller
- [ ] Business Logic: Prevent deletion of active holidays, validate date format

**Key Business Rules:**
```java
// Prevent duplicate holidays
if (holidayRepository.existsByDate(dto.getDate())) {
    throw new BusinessLogicException("Holiday already exists for this date");
}

// Handle recurring holidays
if (dto.getRecurring()) {
    // Update annually around the same date
}
```

### Leave Management Module
- [x] Entity
- [x] Repository
- [x] DTO
- [ ] Service Interface
- [ ] Service Implementation
- [ ] Controller
- [ ] Leave Balance Calculator Service
- [ ] Holiday Integration

**Key Business Logic:**
```java
// Calculate leave days (excluding weekends and holidays)
private Integer calculateWorkingDays(LocalDate start, LocalDate end) {
    int days = 0;
    for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
        if (!isWeekend(date) && !isHoliday(date)) {
            days++;
        }
    }
    return days;
}

// Check overlapping leaves
List<LeaveRequest> overlapping = leaveRequestRepository
    .findOverlappingLeaves(employeeId, startDate, endDate);
if (!overlapping.isEmpty()) {
    throw new BusinessLogicException("Overlapping leave request exists");
}

// Prevent negative balance
if (usedDays > allocationDays) {
    throw new BusinessLogicException("Insufficient leave balance");
}
```

### Attendance Module  
- [x] Entity
- [x] Repository
- [x] DTO
- [ ] Service Interface
- [ ] Service Implementation
- [ ] Controller
- [ ] Auto-absence marking job

**Key Features:**
```java
// Clock in
@PostMapping("/clock-in")
public ResponseEntity<ApiResponse<AttendanceDTO>> clockIn(@RequestBody ClockInRequest request) {
    Attendance attendance = new Attendance();
    attendance.setCheckInTime(LocalTime.now());
    attendance.setStatus(AttendanceStatus.PRESENT);
    // Save
}

// Auto-mark absent if no check-in by end of day
// Implement as scheduled task:
@Scheduled(cron = "0 0 18 * * ?") // 6 PM daily
public void autoMarkAbsent() {
    // Find employees with no attendance record today
    // Mark as ABSENT
}

// Calculate worked hours
private Double calculateWorkedHours(LocalTime checkIn, LocalTime checkOut) {
    return Duration.between(checkIn, checkOut).toMinutes() / 60.0;
}
```

### Remote Work Module
- [x] Entity
- [x] Repository
- [x] DTO
- [ ] Service Interface
- [ ] Service Implementation
- [ ] Controller

**Business Rules:**
```java
// Prevent remote on holidays
if (holidayRepository.existsByDate(request.getDate())) {
    throw new BusinessLogicException("Cannot request remote on holiday");
}

// Check monthly limit (e.g., 10 days)
int currentMonth = request.getDate().getMonthValue();
List<RemoteWorkRequest> approved = remoteWorkRequestRepository
    .findByEmployeeIdAndStatus(employeeId, RemoteWorkStatus.APPROVED);
long countThisMonth = approved.stream()
    .filter(r -> r.getDate().getMonthValue() == currentMonth)
    .count();
    
if (countThisMonth >= MONTHLY_LIMIT) {
    throw new BusinessLogicException("Monthly remote work limit exceeded");
}
```

### Accounting Parameters Module
- [x] Entity
- [x] Repository
- [x] DTO
- [ ] Service Interface
- [ ] Service Implementation
- [ ] Controller with ACCOUNTANT-only access

**Security & Auditing:**
```java
@Override
@PreAuthorize("hasRole('ACCOUNTANT')")
public void updateParameters(AccountingParameterDTO dto) {
    // Create audit log
    AuditLog audit = AuditLog.builder()
        .action("UPDATE_ACCOUNTING_PARAMETERS")
        .entityName("AccountingParameter")
        .performedBy(getCurrentUsername())
        .timestamp(LocalDateTime.now())
        .details("Tax: " + dto.getTaxPercentage() + "%, Insurance: " + dto.getInsurancePercentage() + "%")
        .build();
    auditLogRepository.save(audit);
    
    // Update entity
    parameters.setTaxPercentage(dto.getTaxPercentage());
    // ... other fields
    save(parameters);
}
```

### Payroll Module
- [x] Entity
- [x] Repository
- [x] DTO
- [ ] Service Interface
- [ ] Service Implementation
- [ ] Controller
- [ ] Payroll Calculator Service

**Complex Business Logic:**
```java
public void generatePayroll(Long employeeId, String month) {
    // 1. Get employee and base salary
    Employee employee = employeeRepository.findById(employeeId).orElseThrow();
    BigDecimal baseSalary = employee.getSalary();
    
    // 2. Calculate overtime hours
    List<Attendance> attendances = getMonthlyAttendance(employeeId, month);
    BigDecimal overtimeAmount = calculateOvertimePayment(attendances);
    
    // 3. Get bonus (if applicable)
    BigDecimal bonusAmount = calculateBonus(employee);
    
    // 4. Calculate deductions
    // - Tax
    BigDecimal tax = baseSalary.multiply(TAX_PERCENTAGE).divide(BigDecimal.valueOf(100));
    // - Insurance
    BigDecimal insurance = baseSalary.multiply(INSURANCE_PERCENTAGE).divide(BigDecimal.valueOf(100));
    // - Unpaid leave
    BigDecimal unpaidLeaveDeduction = calculateUnpaidLeaveDeduction(employeeId, month);
    
    BigDecimal totalDeductions = tax.add(insurance).add(unpaidLeaveDeduction);
    
    // 5. Add remote allowance
    BigDecimal remoteAllowance = calculateRemoteAllowance(employeeId, month);
    
    // 6. Calculate net salary
    BigDecimal netSalary = baseSalary
        .add(overtimeAmount)
        .add(bonusAmount)
        .add(remoteAllowance)
        .subtract(totalDeductions);
    
    // 7. Create payroll record
    Payroll payroll = Payroll.builder()
        .employee(employee)
        .month(month)
        .baseSalary(baseSalary)
        .overtimeAmount(overtimeAmount)
        .bonusAmount(bonusAmount)
        .deductions(totalDeductions)
        .netSalary(netSalary)
        .generatedDate(LocalDateTime.now())
        .locked(false)
        .build();
    
    payrollRepository.save(payroll);
    
    // 8. Log audit
    createAuditLog("PAYROLL_GENERATED", employee.getId(), month);
}
```

### Performance Evaluation Module
- [x] Entity
- [x] Repository
- [x] DTO
- [ ] Service Interface
- [ ] Service Implementation
- [ ] Controller
- [ ] Alert Service for low scores

**Implementation:**
```java
public PerformanceEvaluationDTO createEvaluation(PerformanceEvaluationDTO dto) {
    // Validate scores are 1-5
    if (dto.getTechnicalScore() < 1 || dto.getTechnicalScore() > 5) {
        throw new BadRequestException("Score must be between 1 and 5");
    }
    
    // Calculate average
    double average = (dto.getTechnicalScore() + dto.getTeamworkScore() + 
                     dto.getProductivityScore()) / 3.0;
    
    // Alert HR if low
    if (average < 3.0) {
        createAlert("Employee " + employee.getName() + " has low average score: " + average);
    }
    
    // Save evaluation
    PerformanceEvaluation evaluation = mapToEntity(dto);
    return mapToDTO(performanceEvaluationRepository.save(evaluation));
}
```

### Warning & Discipline Module
- [x] Entity
- [x] Repository
- [x] DTO
- [ ] Service Interface
- [ ] Service Implementation
- [ ] Controller
- [ ] Auto-escalation logic

**Business Rules:**
```java
public void createWarning(WarningDTO dto) {
    Warning warning = mapToEntity(dto);
    Warning saved = warningRepository.save(warning);
    
    // Count active warnings
    long activeWarnings = warningRepository
        .findByEmployeeIdAndStatus(dto.getEmployeeId(), WarningStatus.ACTIVE)
        .size();
    
    // Auto-escalate if 3rd warning
    if (activeWarnings >= 3) {
        notifyHR("Employee has 3 active warnings - consider further action");
    }
    
    // Create audit log
    createAuditLog("WARNING_ISSUED", dto.getEmployeeId(), 
                  "Reason: " + dto.getReason() + ", Severity: " + dto.getSeverity());
}

// Scheduled job for auto-warning on repeated lateness
@Scheduled(cron = "0 0 0 * * MON") // Weekly check
public void checkRepeatedLateness() {
    // Find employees with >= 3 instances of LATE status in past 30 days
    // Auto-create warning with severity based on count
}
```

### Asset Management Module
- [x] Entity
- [x] Repository
- [x] DTO
- [ ] Service Interface
- [ ] Service Implementation
- [ ] Controller
- [ ] Asset assignment/return workflow

**Implementation:**
```java
public AssetDTO assignAsset(Long assetId, Long employeeId) {
    Asset asset = assetRepository.findById(assetId).orElseThrow();
    if (!asset.getStatus().equals(AssetStatus.AVAILABLE)) {
        throw new BusinessLogicException("Asset is not available");
    }
    
    Employee employee = employeeRepository.findById(employeeId).orElseThrow();
    asset.setAssignedTo(employee);
    asset.setStatus(AssetStatus.ASSIGNED);
    
    return mapToDTO(assetRepository.save(asset));
}

public void returnAsset(Long assetId) {
    Asset asset = assetRepository.findById(assetId).orElseThrow();
    asset.setAssignedTo(null);
    asset.setStatus(AssetStatus.AVAILABLE);
    assetRepository.save(asset);
}

// Prevent termination if assets not returned
@Override
public void terminateEmployee(Long employeeId) {
    long unreturned = assetRepository.findByAssignedToId(employeeId).stream()
        .filter(a -> a.getStatus().equals(AssetStatus.ASSIGNED))
        .count();
    
    if (unreturned > 0) {
        throw new BusinessLogicException("Employee has " + unreturned + " unreturned assets");
    }
    
    // Proceed with termination
}
```

### Recruitment Module
- [x] Entity
- [x] Repository
- [x] DTO
- [ ] Service Interface
- [ ] Service Implementation
- [ ] Controller
- [ ] Auto-create employee on acceptance

**Auto-Conversion Logic:**
```java
public void updateCandidateStatus(Long candidateId, CandidateStatus newStatus) {
    Candidate candidate = candidateRepository.findById(candidateId).orElseThrow();
    candidate.setStatus(newStatus);
    
    // Auto-convert to employee if accepted
    if (newStatus.equals(CandidateStatus.ACCEPTED)) {
        createEmployeeFromCandidate(candidate);
    }
    
    candidateRepository.save(candidate);
}

private void createEmployeeFromCandidate(Candidate candidate) {
    // Create new employee with candidate info
    Employee employee = Employee.builder()
        .firstName(candidate.getCandidateName().split(" ")[0])
        .lastName(candidate.getCandidateName().substring(
                 candidate.getCandidateName().indexOf(" ") + 1))
        .email(candidate.getEmail())
        .hireDate(LocalDate.now())
        .employmentType(EmploymentType.FULL_TIME) // Default
        .status(EmployeeStatus.ACTIVE)
        .build();
    
    employeeRepository.save(employee);
    log.info("Employee auto-created from accepted candidate");
}
```

### Event & Notification Module
- [x] Entity
- [x] Repository
- [x] DTO
- [ ] Service Interface
- [ ] Service Implementation
- [ ] Controller
- [ ] Birthday detection and notification

**Auto-Birthday Feature:**
```java
@Scheduled(cron = "0 9 * * * ?") // Daily at 9 AM
public void checkUpcomingBirthdays() {
    LocalDate today = LocalDate.now();
    LocalDate nextWeek = today.plusDays(7);
    
    // Query employees with upcoming birthdays
    List<Employee> upcomingBirthdays = 
        getEmployeesByBirthdayBetween(today, nextWeek);
    
    for (Employee emp : upcomingBirthdays) {
        // Create event
        Event event = Event.builder()
            .title(emp.getFirstName() + "'s Birthday")
            .eventDate(emp.getHireDate().atStartOfDay()) // Approximate
            .type(EventType.BIRTHDAY)
            .build();
        
        eventRepository.save(event);
        
        // Notify HR
        notifyUser("HR", "Birthday coming up for " + emp.getFirstName());
    }
}
```

### Audit Log Module
- [x] Entity
- [x] Repository
- [x] DTO
- [ ] Service Interface
- [ ] Service Implementation
- [ ] Controller (ADMIN-only access)

**Audit Service:**
```java
@Component
public class AuditService {
    
    @Autowired
    private AuditLogRepository auditLogRepository;
    
    public void logAction(String action, String entityName, String details) {
        AuditLog log = AuditLog.builder()
            .action(action)
            .entityName(entityName)
            .performedBy(getCurrentUsername())
            .timestamp(LocalDateTime.now())
            .details(details)
            .build();
        
        auditLogRepository.save(log);
    }
    
    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : "SYSTEM";
    }
}

// Use in services:
@Autowired
private AuditService auditService;

auditService.logAction("SALARY_UPDATE", "Employee", 
    "Employee ID: " + employeeId + ", Old: " + oldSalary + ", New: " + newSalary);
```

## 🔄 Integration Points

### Service-to-Service Communication
```java
// Leave service uses Holiday repository
@Autowired
private HolidayRepository holidayRepository;

private int calculateLeaveDaysExcludingHolidays(LocalDate start, LocalDate end) {
    // Get all holidays in range
    List<Holiday> holidays = holidayRepository.findAll();
    // Exclude from calculation
}

// Payroll service uses multiple other services
@Autowired
private AttendanceRepository attendanceRepository;
@Autowired
private LeaveRequestRepository leaveRequestRepository;
@Autowired
private RemoteWorkRequestRepository remoteWorkRepository;
@Autowired
private AccountingParameterRepository parameterRepository;
```

### Transaction Management
```java
// Use @Transactional at service level
@Service
@Transactional
public class CriticalService {
    // All methods are transactional
    // Rollback on exception
}

// Or at method level for specific methods
@Transactional(readOnly = true)
public List<DTO> getAll() {
    // Read-only transaction
}

@Transactional(rollbackFor = Exception.class)
public void criticalOperation() {
    // Custom rollback handling
}
```

## ✅ Testing Checklist

For each module, test:
- [ ] Happy path (successful operation)
- [ ] Entity not found (404)
- [ ] Invalid input (validation errors)
- [ ] Authorization (role-based access)
- [ ] Business logic (specific rules)
- [ ] Transaction rollback (failure scenarios)
- [ ] Audit logging

**Example Test:**
```java
@SpringBootTest
@AutoConfigureMockMvc
public class EmployeeServiceTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    @WithMockUser(roles = "HR")
    public void testCreateEmployee() throws Exception {
        // Test implementation
    }
}
```

## 🚀 Deployment Readiness Checklist

- [ ] All entities created with proper relationships
- [ ] All repositories with custom queries
- [ ] All DTOs with validation annotations
- [ ] All services with transaction management
- [ ] All controllers with security annotations
- [ ] All business logic in service layer
- [ ] Audit logging for critical operations
- [ ] Exception handling for all scenarios
- [ ] Database indexes on frequently queried columns
- [ ] Connection pooling configured
- [ ] Logging configured appropriately
- [ ] Security headers in responses

---

**Next Steps:**
1. Implement remaining services using templates above
2. Create integration tests
3. Set up CI/CD pipeline
4. Configure monitoring
5. Deploy to production environment
