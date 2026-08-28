package com.company.erp.employee.service;

import com.company.erp.employee.dto.EmployeeDTO;
import com.company.erp.employee.dto.UpdateEmployeeDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface EmployeeService {

    EmployeeDTO createEmployee(EmployeeDTO employeeDTO);

    EmployeeDTO updateEmployee(Long id, EmployeeDTO employeeDTO);

    EmployeeDTO updateEmployee(Long id, UpdateEmployeeDTO updateEmployeeDTO);

    void terminateEmployee(Long id);

    EmployeeDTO getEmployeeById(Long id);

    List<EmployeeDTO> getAllEmployees();

    List<EmployeeDTO> getEmployeesByDepartment(Long departmentId);
    
    Page<EmployeeDTO> getEmployeesPaginated(Pageable pageable, Long departmentId);

    EmployeeDTO transferDepartment(Long employeeId, Long newDepartmentId);

    EmployeeDTO getEmployeeProfile();

}
