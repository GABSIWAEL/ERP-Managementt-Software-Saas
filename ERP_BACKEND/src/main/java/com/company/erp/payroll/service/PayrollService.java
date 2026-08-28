package com.company.erp.payroll.service;

import com.company.erp.payroll.dto.PayrollDTO;
import java.util.List;

public interface PayrollService {
    
    PayrollDTO createPayroll(PayrollDTO payrollDTO);
    
    PayrollDTO generatePayroll(Long employeeId, int month, int year);
    
    PayrollDTO updatePayroll(Long id, PayrollDTO payrollDTO);
    
    void lockPayroll(Long id);
    
    void unlockPayroll(Long id);
    
    void deletePayroll(Long id);
    
    PayrollDTO getPayrollById(Long id);
    
    List<PayrollDTO> getPayrollsByEmployeeId(Long employeeId);
    
    List<PayrollDTO> getPayrollsByMonth(int month, int year);
    
    List<PayrollDTO> getUnlockedPayrolls();
}
