package com.company.erp.payroll.service.impl;

import com.company.erp.accounting.repository.AccountingParameterRepository;
import com.company.erp.attendance.repository.AttendanceRepository;
import com.company.erp.audit.entity.AuditLog;
import com.company.erp.audit.repository.AuditLogRepository;
import com.company.erp.common.enums.AttendanceStatus;
import com.company.erp.common.enums.LeaveStatus;
import com.company.erp.common.enums.LeaveType;
import com.company.erp.common.exception.BusinessLogicException;
import com.company.erp.common.exception.ResourceNotFoundException;
import com.company.erp.employee.entity.Employee;
import com.company.erp.employee.repository.EmployeeRepository;
import com.company.erp.leave.entity.LeaveRequest;
import com.company.erp.leave.repository.LeaveRequestRepository;
import com.company.erp.payroll.dto.PayrollDTO;
import com.company.erp.payroll.entity.Payroll;
import com.company.erp.payroll.repository.PayrollRepository;
import com.company.erp.payroll.service.PayrollService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PayrollServiceImpl implements PayrollService {
    
    private final PayrollRepository payrollRepository;
    private final EmployeeRepository employeeRepository;
    private final AccountingParameterRepository accountingParameterRepository;
    private final AuditLogRepository auditLogRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    
    @Override
    public PayrollDTO createPayroll(PayrollDTO payrollDTO) {
        log.info("Creating payroll for employee ID: {}", payrollDTO.getEmployeeId());
        
        Employee employee = employeeRepository.findById(payrollDTO.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        
        Payroll payroll = Payroll.builder()
                .employee(employee)
                .month(payrollDTO.getMonth())
                .year(payrollDTO.getYear())
                .baseSalary(payrollDTO.getBaseSalary())
                .overtimeAmount(payrollDTO.getOvertimeAmount())
                .bonusAmount(payrollDTO.getBonusAmount())
                .deductions(payrollDTO.getDeductions())
                .netSalary(calculateNetSalary(payrollDTO))
                .generatedDate(LocalDateTime.now())
                .locked(false)
                .build();
        
        payroll = payrollRepository.save(payroll);
        
        auditLogRepository.save(AuditLog.builder()
                .action("PAYROLL_CREATED")
                .entityName("Payroll")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Payroll created for month " + payrollDTO.getMonth())
                .build());
        
        return mapToDTO(payroll);
    }
    
    @Override
    public PayrollDTO generatePayroll(Long employeeId, int month, int year) {
        log.info("Generating payroll for employee ID: {}, month: {}, year: {}", employeeId, month, year);
        
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        
        // Check if payroll already exists
        var existingPayroll = payrollRepository.findByEmployeeIdAndMonth(employeeId, month + "/" + year);
        if (existingPayroll.isPresent()) {
            throw new BusinessLogicException("Payroll already exists for this month");
        }
        
        // Calculate base salary
        BigDecimal baseSalary = employee.getSalary();
        
        // Calculate overtime from Attendance
        BigDecimal overtimeAmount = calculateOvertimeAmount(employeeId, month, year);
        
        // Calculate unpaid leave deduction
        BigDecimal leaveDeduction = calculateLeaveDeduction(employeeId, month, year);
        
        BigDecimal bonusAmount = BigDecimal.ZERO;
        BigDecimal deductions = leaveDeduction;
        
        // Get accounting parameters for calculations
        var parameters = accountingParameterRepository.findAll();
        if (!parameters.isEmpty()) {
            var param = parameters.get(0);
            
            // Calculate deductions (tax + insurance)
            BigDecimal taxAmount = baseSalary.multiply(param.getTaxPercentage()).divide(BigDecimal.valueOf(100));
            BigDecimal insuranceAmount = baseSalary.multiply(param.getInsurancePercentage())
                    .divide(BigDecimal.valueOf(100));
            deductions = deductions.add(taxAmount).add(insuranceAmount);
        }
        
        BigDecimal netSalary = baseSalary.add(overtimeAmount).add(bonusAmount).subtract(deductions);
        
        Payroll payroll = Payroll.builder()
                .employee(employee)
                .month(String.valueOf(month) + "/" + year)
                .year(year)
                .baseSalary(baseSalary)
                .overtimeAmount(overtimeAmount)
                .bonusAmount(bonusAmount)
                .deductions(deductions)
                .netSalary(netSalary)
                .generatedDate(LocalDateTime.now())
                .locked(false)
                .build();
        
        payroll = payrollRepository.save(payroll);
        
        auditLogRepository.save(AuditLog.builder()
                .action("PAYROLL_GENERATED")
                .entityName("Payroll")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Payroll generated for month " + month + "/" + year)
                .build());
        
        return mapToDTO(payroll);
    }

    /**
     * Calculate overtime amount based on attendance records
     * Assumes employees working more than 8 hours per day or 40 hours per week get overtime
     */
    private BigDecimal calculateOvertimeAmount(Long employeeId, int month, int year) {
        // Get employee data
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        
        // Get all attendance records for the month
        YearMonth yearMonth = YearMonth.of(year, month);
        var attendanceRecords = attendanceRepository.findByEmployeeId(employeeId);
        
        // Filter by month and sum overtime (simplified: 1.5x hourly rate for extra hours)
        long overtimeHours = attendanceRecords.stream()
                .filter(a -> a.getDate().getYear() == year && a.getDate().getMonthValue() == month)
                .filter(a -> a.getStatus() == AttendanceStatus.PRESENT)
                .count();
        
        // Simplified: Assuming standard is 20 working days per month (8 hours each = 160 hours)
        // Anything beyond that is overtime at 1.5x hourly rate
        long standardHours = 160;
        long extraHours = Math.max(0, overtimeHours * 8 - standardHours);
        
        if (extraHours > 0 && employee.getSalary() != null) {
            // Calculate hourly rate (salary / 160 hours)
            BigDecimal hourlyRate = employee.getSalary().divide(BigDecimal.valueOf(160), 2, java.math.RoundingMode.HALF_UP);
            // Overtime = extra hours * hourly rate * 1.5
            return hourlyRate.multiply(BigDecimal.valueOf(extraHours)).multiply(BigDecimal.valueOf(1.5));
        }
        
        return BigDecimal.ZERO;
    }

    /**
     * Calculate unpaid leave deduction from payroll
     * Only UNPAID leave type is deducted from salary
     */
    private BigDecimal calculateLeaveDeduction(Long employeeId, int month, int year) {
        // Get all approved unpaid leave for the month
        var unpaidLeaves = leaveRequestRepository.findByEmployeeIdAndStatus(employeeId, LeaveStatus.APPROVED).stream()
                .filter(leave -> leave.getType() == LeaveType.UNPAID)
                .filter(leave -> leave.getStartDate().getYear() == year && leave.getStartDate().getMonthValue() == month)
                .collect(Collectors.toList());
        
        if (unpaidLeaves.isEmpty()) {
            return BigDecimal.ZERO;
        }
        
        // Calculate total unpaid days and deduct from salary
        int totalUnpaidDays = unpaidLeaves.stream()
                .mapToInt(LeaveRequest::getTotalDays)
                .sum();
        
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        
        if (employee.getSalary() != null) {
            // Calculate daily rate (salary / 20 working days per month)
            BigDecimal dailyRate = employee.getSalary().divide(BigDecimal.valueOf(20), 2, java.math.RoundingMode.HALF_UP);
            // Deduction = total unpaid days * daily rate
            return dailyRate.multiply(BigDecimal.valueOf(totalUnpaidDays));
        }
        
        return BigDecimal.ZERO;
    }
    
    @Override
    public PayrollDTO updatePayroll(Long id, PayrollDTO payrollDTO) {
        log.info("Updating payroll with ID: {}", id);
        
        Payroll payroll = payrollRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll not found"));
        
        if (payroll.getLocked()) {
            throw new BusinessLogicException("Cannot update locked payroll");
        }
        
        payroll.setBaseSalary(payrollDTO.getBaseSalary());
        payroll.setOvertimeAmount(payrollDTO.getOvertimeAmount());
        payroll.setBonusAmount(payrollDTO.getBonusAmount());
        payroll.setDeductions(payrollDTO.getDeductions());
        payroll.setNetSalary(calculateNetSalary(payrollDTO));
        
        payroll = payrollRepository.save(payroll);
        
        auditLogRepository.save(AuditLog.builder()
                .action("PAYROLL_UPDATED")
                .entityName("Payroll")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Payroll updated")
                .build());
        
        return mapToDTO(payroll);
    }
    
    @Override
    public void lockPayroll(Long id) {
        log.info("Locking payroll with ID: {}", id);
        
        Payroll payroll = payrollRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll not found"));
        
        payroll.setLocked(true);
        payrollRepository.save(payroll);
        
        auditLogRepository.save(AuditLog.builder()
                .action("PAYROLL_LOCKED")
                .entityName("Payroll")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Payroll locked")
                .build());
    }
    
    @Override
    public void unlockPayroll(Long id) {
        log.info("Unlocking payroll with ID: {}", id);
        
        Payroll payroll = payrollRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll not found"));
        
        payroll.setLocked(false);
        payrollRepository.save(payroll);
        
        auditLogRepository.save(AuditLog.builder()
                .action("PAYROLL_UNLOCKED")
                .entityName("Payroll")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Payroll unlocked")
                .build());
    }
    
    @Override
    public void deletePayroll(Long id) {
        log.info("Deleting payroll with ID: {}", id);
        
        Payroll payroll = payrollRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll not found"));
        
        payrollRepository.delete(payroll);
        
        auditLogRepository.save(AuditLog.builder()
                .action("PAYROLL_DELETED")
                .entityName("Payroll")
                .performedBy(getCurrentUsername())
                .timestamp(LocalDateTime.now())
                .details("Payroll deleted")
                .build());
    }
    
    @Override
    @Transactional(readOnly = true)
    public PayrollDTO getPayrollById(Long id) {
        Payroll payroll = payrollRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll not found"));
        return mapToDTO(payroll);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PayrollDTO> getPayrollsByEmployeeId(Long employeeId) {
        log.info("Fetching payrolls for employee ID: {}", employeeId);
        return payrollRepository.findByEmployeeId(employeeId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PayrollDTO> getPayrollsByMonth(int month, int year) {
        log.info("Fetching payrolls for month: {}/{}", month, year);
        return payrollRepository.findByMonth(month + "/" + year).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PayrollDTO> getUnlockedPayrolls() {
        log.info("Fetching unlocked payrolls");
        return payrollRepository.findAll().stream()
                .filter(p -> !p.getLocked())
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    private BigDecimal calculateNetSalary(PayrollDTO payrollDTO) {
        return payrollDTO.getBaseSalary()
                .add(payrollDTO.getOvertimeAmount())
                .add(payrollDTO.getBonusAmount())
                .subtract(payrollDTO.getDeductions());
    }
    
    private PayrollDTO mapToDTO(Payroll payroll) {
        return PayrollDTO.builder()
                .id(payroll.getId())
                .employeeId(payroll.getEmployee().getId())
                .month(payroll.getMonth())
                .baseSalary(payroll.getBaseSalary())
                .overtimeAmount(payroll.getOvertimeAmount())
                .bonusAmount(payroll.getBonusAmount())
                .deductions(payroll.getDeductions())
                .netSalary(payroll.getNetSalary())
                .locked(payroll.getLocked())
                .createdAt(payroll.getCreatedAt())
                .updatedAt(payroll.getUpdatedAt())
                .build();
    }
    
    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "SYSTEM";
    }
}
