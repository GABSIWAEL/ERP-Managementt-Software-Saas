package com.company.erp.reporting.service.impl;

import com.company.erp.attendance.entity.Attendance;
import com.company.erp.attendance.repository.AttendanceRepository;
import com.company.erp.common.enums.AttendanceStatus;
import com.company.erp.common.enums.EmployeeStatus;
import com.company.erp.common.enums.LeaveStatus;
import com.company.erp.department.entity.Department;
import com.company.erp.department.repository.DepartmentRepository;
import com.company.erp.employee.entity.Employee;
import com.company.erp.employee.repository.EmployeeRepository;
import com.company.erp.leave.entity.LeaveRequest;
import com.company.erp.leave.repository.LeaveRequestRepository;
import com.company.erp.payroll.entity.Payroll;
import com.company.erp.payroll.repository.PayrollRepository;
import com.company.erp.performance.entity.PerformanceEvaluation;
import com.company.erp.performance.repository.PerformanceEvaluationRepository;
import com.company.erp.reporting.dto.*;
import com.company.erp.reporting.service.ReportingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Implementation of reporting service
 * Generates various ERP reports and analytics
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportingServiceImpl implements ReportingService {
    
    private final PayrollRepository payrollRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final PerformanceEvaluationRepository performanceEvaluationRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    
    @Override
    public List<PayrollSummaryDTO> getPayrollSummary(int month, int year) {
        log.info("Generating payroll summary for month: {}, year: {}", month, year);
        
        String monthStr = String.format("%04d-%02d", year, month);
        List<Payroll> payrolls = payrollRepository.findAll().stream()
                .filter(p -> p.getMonth() != null && p.getMonth().startsWith(monthStr))
                .collect(Collectors.toList());
        
        return payrolls.stream()
                .map(this::mapPayrollToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public PayrollSummaryDTO getEmployeePayrollSummary(Long employeeId, int month, int year) {
        log.info("Generating payroll summary for employee: {}, month: {}, year: {}", employeeId, month, year);
        
        String monthStr = String.format("%04d-%02d", year, month);
        Optional<Payroll> payroll = payrollRepository.findAll().stream()
                .filter(p -> p.getEmployee().getId().equals(employeeId) && 
                           p.getMonth() != null && p.getMonth().startsWith(monthStr))
                .findFirst();
        
        return payroll.map(this::mapPayrollToDTO).orElse(null);
    }
    
    @Override
    public List<PayrollSummaryDTO> getDepartmentPayrollSummary(Long departmentId, int month, int year) {
        log.info("Generating payroll summary for department: {}, month: {}, year: {}", departmentId, month, year);
        
        String monthStr = String.format("%04d-%02d", year, month);
        List<Payroll> payrolls = payrollRepository.findAll().stream()
                .filter(p -> p.getEmployee().getDepartment() != null &&
                           p.getEmployee().getDepartment().getId().equals(departmentId) &&
                           p.getMonth() != null && p.getMonth().startsWith(monthStr))
                .collect(Collectors.toList());
        
        return payrolls.stream()
                .map(this::mapPayrollToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<AttendanceSummaryDTO> getAttendanceSummary(int month, int year) {
        log.info("Generating attendance summary for month: {}, year: {}", month, year);
        
        List<Employee> employees = employeeRepository.findAll();
        return employees.stream()
                .map(emp -> getEmployeeAttendanceSummary(emp.getId(), month, year))
                .collect(Collectors.toList());
    }
    
    @Override
    public AttendanceSummaryDTO getEmployeeAttendanceSummary(Long employeeId, int month, int year) {
        log.info("Generating attendance summary for employee: {}, month: {}, year: {}", employeeId, month, year);
        
        Employee employee = employeeRepository.findById(employeeId).orElse(null);
        if (employee == null) {
            return null;
        }
        
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.getMonth().length(startDate.isLeapYear()));
        
        List<Attendance> attendances = attendanceRepository.findAll().stream()
                .filter(a -> a.getEmployee().getId().equals(employeeId) &&
                           !a.getDate().isBefore(startDate) &&
                           !a.getDate().isAfter(endDate))
                .collect(Collectors.toList());
        
        int presentDays = (int) attendances.stream()
                .filter(a -> a.getStatus() == AttendanceStatus.PRESENT)
                .count();
        int absentDays = (int) attendances.stream()
                .filter(a -> a.getStatus() == AttendanceStatus.ABSENT)
                .count();
        int lateDays = (int) attendances.stream()
                .filter(a -> a.getStatus() == AttendanceStatus.LATE)
                .count();
        
        return AttendanceSummaryDTO.builder()
                .employeeId(employeeId)
                .employeeName(employee.getFirstName() + " " + employee.getLastName())
                .department(employee.getDepartment() != null ? employee.getDepartment().getName() : "N/A")
                .totalWorkDays(endDate.getDayOfMonth())
                .attendanceDays(presentDays)
                .absentDays(absentDays)
                .lateDays(lateDays)
                .attendancePercentage((presentDays * 100.0) / endDate.getDayOfMonth())
                .month(month)
                .year(year)
                .build();
    }
    
    @Override
    public List<AttendanceSummaryDTO> getDepartmentAttendanceSummary(Long departmentId, int month, int year) {
        log.info("Generating attendance summary for department: {}, month: {}, year: {}", departmentId, month, year);
        
        List<Employee> employees = employeeRepository.findAll().stream()
                .filter(e -> e.getDepartment() != null && e.getDepartment().getId().equals(departmentId))
                .collect(Collectors.toList());
        
        return employees.stream()
                .map(emp -> getEmployeeAttendanceSummary(emp.getId(), month, year))
                .collect(Collectors.toList());
    }
    
    @Override
    public List<LeaveSummaryDTO> getLeaveSummary(int month, int year) {
        log.info("Generating leave summary for month: {}, year: {}", month, year);
        
        List<Employee> employees = employeeRepository.findAll();
        return employees.stream()
                .map(emp -> getEmployeeLeaveSummary(emp.getId(), month, year))
                .collect(Collectors.toList());
    }
    
    @Override
    public LeaveSummaryDTO getEmployeeLeaveSummary(Long employeeId, int month, int year) {
        log.info("Generating leave summary for employee: {}, month: {}, year: {}", employeeId, month, year);
        
        Employee employee = employeeRepository.findById(employeeId).orElse(null);
        if (employee == null) {
            return null;
        }
        
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.getMonth().length(startDate.isLeapYear()));
        
        List<LeaveRequest> leaves = leaveRequestRepository.findAll().stream()
                .filter(l -> l.getEmployee().getId().equals(employeeId) &&
                           l.getStartDate().getYear() == year &&
                           l.getStartDate().getMonthValue() == month)
                .collect(Collectors.toList());
        
        long approvedCount = leaves.stream()
                .filter(l -> l.getStatus() == LeaveStatus.APPROVED)
                .count();
        long pendingCount = leaves.stream()
                .filter(l -> l.getStatus() == LeaveStatus.PENDING)
                .count();
        long rejectedCount = leaves.stream()
                .filter(l -> l.getStatus() == LeaveStatus.REJECTED)
                .count();
        
        return LeaveSummaryDTO.builder()
                .employeeId(employeeId)
                .employeeName(employee.getFirstName() + " " + employee.getLastName())
                .department(employee.getDepartment() != null ? employee.getDepartment().getName() : "N/A")
                .totalLeaveBalance(22) // Default annual leave
                .leaveUsed((int) approvedCount)
                .leaveRemaining(22 - (int) approvedCount)
                .pendingRequests((int) pendingCount)
                .approvedRequests((int) approvedCount)
                .rejectedRequests((int) rejectedCount)
                .month(month)
                .year(year)
                .build();
    }
    
    @Override
    public List<LeaveSummaryDTO> getDepartmentLeaveSummary(Long departmentId, int month, int year) {
        log.info("Generating leave summary for department: {}, month: {}, year: {}", departmentId, month, year);
        
        List<Employee> employees = employeeRepository.findAll().stream()
                .filter(e -> e.getDepartment() != null && e.getDepartment().getId().equals(departmentId))
                .collect(Collectors.toList());
        
        return employees.stream()
                .map(emp -> getEmployeeLeaveSummary(emp.getId(), month, year))
                .collect(Collectors.toList());
    }
    
    @Override
    public List<DepartmentSummaryDTO> getDepartmentSummary() {
        log.info("Generating department summary");
        
        return departmentRepository.findAll().stream()
                .map(this::mapDepartmentToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public DepartmentSummaryDTO getDepartmentSummary(Long departmentId) {
        log.info("Generating department summary for department: {}", departmentId);
        
        return departmentRepository.findById(departmentId)
                .map(this::mapDepartmentToDTO)
                .orElse(null);
    }
    
    @Override
    public List<PerformanceSummaryDTO> getPerformanceSummary(int month, int year) {
        log.info("Generating performance summary for month: {}, year: {}", month, year);
        
        List<Employee> employees = employeeRepository.findAll();
        return employees.stream()
                .map(emp -> getEmployeePerformanceSummary(emp.getId(), month, year))
                .filter(p -> p != null)
                .collect(Collectors.toList());
    }
    
    @Override
    public PerformanceSummaryDTO getEmployeePerformanceSummary(Long employeeId, int month, int year) {
        log.info("Generating performance summary for employee: {}, month: {}, year: {}", employeeId, month, year);
        
        Employee employee = employeeRepository.findById(employeeId).orElse(null);
        if (employee == null) {
            return null;
        }
        
        List<PerformanceEvaluation> evaluations = performanceEvaluationRepository.findAll().stream()
                .filter(e -> e.getEmployee().getId().equals(employeeId) &&
                           e.getEvaluationDate().getYear() == year &&
                           e.getEvaluationDate().getMonthValue() == month)
                .collect(Collectors.toList());
        
        if (evaluations.isEmpty()) {
            return null;
        }
        
        double avgTechnical = evaluations.stream()
                .mapToInt(PerformanceEvaluation::getTechnicalScore)
                .average()
                .orElse(0);
        double avgTeamwork = evaluations.stream()
                .mapToInt(PerformanceEvaluation::getTeamworkScore)
                .average()
                .orElse(0);
        double avgProductivity = evaluations.stream()
                .mapToInt(PerformanceEvaluation::getProductivityScore)
                .average()
                .orElse(0);
        
        double averageScore = (avgTechnical + avgTeamwork + avgProductivity) / 3;
        String rating = getRatingByScore(averageScore);
        
        return PerformanceSummaryDTO.builder()
                .employeeId(employeeId)
                .employeeName(employee.getFirstName() + " " + employee.getLastName())
                .department(employee.getDepartment() != null ? employee.getDepartment().getName() : "N/A")
                .technicalScore(avgTechnical)
                .teamworkScore(avgTeamwork)
                .productivityScore(avgProductivity)
                .averageScore(averageScore)
                .performanceRating(rating)
                .evaluationsCount(evaluations.size())
                .month(month)
                .year(year)
                .build();
    }
    
    @Override
    public List<PerformanceSummaryDTO> getDepartmentPerformanceSummary(Long departmentId, int month, int year) {
        log.info("Generating performance summary for department: {}, month: {}, year: {}", departmentId, month, year);
        
        List<Employee> employees = employeeRepository.findAll().stream()
                .filter(e -> e.getDepartment() != null && e.getDepartment().getId().equals(departmentId))
                .collect(Collectors.toList());
        
        return employees.stream()
                .map(emp -> getEmployeePerformanceSummary(emp.getId(), month, year))
                .filter(p -> p != null)
                .collect(Collectors.toList());
    }
    
    // Helper methods
    
    private PayrollSummaryDTO mapPayrollToDTO(Payroll payroll) {
        return PayrollSummaryDTO.builder()
                .employeeId(payroll.getEmployee().getId())
                .employeeName(payroll.getEmployee().getFirstName() + " " + payroll.getEmployee().getLastName())
                .department(payroll.getEmployee().getDepartment() != null ? 
                           payroll.getEmployee().getDepartment().getName() : "N/A")
                .baseSalary(payroll.getBaseSalary())
                .totalOvertime(payroll.getOvertimeAmount())
                .totalDeductions(payroll.getDeductions())
                .netSalary(payroll.getNetSalary())
                .month(payroll.getMonth() != null ? 
                       Integer.parseInt(payroll.getMonth().substring(5, 7)) : 0)
                .year(payroll.getMonth() != null ? 
                      Integer.parseInt(payroll.getMonth().substring(0, 4)) : 0)
                .locked(payroll.getLocked())
                .build();
    }
    
    private DepartmentSummaryDTO mapDepartmentToDTO(Department department) {
        List<Employee> employees = employeeRepository.findAll().stream()
                .filter(e -> e.getDepartment() != null && e.getDepartment().getId().equals(department.getId()))
                .collect(Collectors.toList());
        
        long activeCount = employees.stream()
                .filter(e -> e.getStatus() == EmployeeStatus.ACTIVE)
                .count();
        long inactiveCount = employees.stream()
                .filter(e -> e.getStatus() != EmployeeStatus.ACTIVE)
                .count();
        
        return DepartmentSummaryDTO.builder()
                .departmentId(department.getId())
                .departmentName(department.getName())
                .totalEmployees(employees.size())
                .activeEmployees((int) activeCount)
                .inactiveEmployees((int) inactiveCount)
                .build();
    }
    
    private String getRatingByScore(double score) {
        if (score >= 4.5) return "EXCELLENT";
        if (score >= 3.5) return "GOOD";
        if (score >= 2.5) return "AVERAGE";
        return "POOR";
    }
}
