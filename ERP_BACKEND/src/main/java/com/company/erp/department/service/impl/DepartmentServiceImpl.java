package com.company.erp.department.service.impl;

import com.company.erp.common.exception.BusinessLogicException;
import com.company.erp.common.exception.ResourceNotFoundException;
import com.company.erp.department.dto.DepartmentDTO;
import com.company.erp.department.entity.Department;
import com.company.erp.department.repository.DepartmentRepository;
import com.company.erp.department.service.DepartmentService;
import com.company.erp.employee.entity.Employee;
import com.company.erp.employee.repository.EmployeeRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class DepartmentServiceImpl implements DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Override
    public DepartmentDTO createDepartment(DepartmentDTO departmentDTO) {
        if (departmentRepository.existsByName(departmentDTO.getName())) {
            throw new BusinessLogicException("Department with name '" + departmentDTO.getName() + "' already exists");
        }

        Department department = Department.builder()
                .name(departmentDTO.getName())
                .description(departmentDTO.getDescription())
                .build();

        Department saved = departmentRepository.save(department);
        log.info("Department created with ID: {}", saved.getId());

        return mapToDTO(saved);
    }

    @Override
    public DepartmentDTO updateDepartment(Long id, DepartmentDTO departmentDTO) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));

        if (!department.getName().equals(departmentDTO.getName()) &&
                departmentRepository.existsByName(departmentDTO.getName())) {
            throw new BusinessLogicException("Department with name '" + departmentDTO.getName() + "' already exists");
        }

        department.setName(departmentDTO.getName());
        department.setDescription(departmentDTO.getDescription());

        Department updated = departmentRepository.save(department);
        log.info("Department updated with ID: {}", updated.getId());

        return mapToDTO(updated);
    }

    @Override
    public void deleteDepartment(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));

        long employeeCount = employeeRepository.findByDepartmentId(id).size();
        if (employeeCount > 0) {
            throw new BusinessLogicException("Cannot delete department. It has " + employeeCount + " active employees");
        }

        departmentRepository.delete(department);
        log.info("Department deleted with ID: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public DepartmentDTO getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));

        return mapToDTO(department);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DepartmentDTO> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public DepartmentDTO assignManager(Long departmentId, Long employeeId) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + departmentId));

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + employeeId));

        department.setManager(employee);
        Department updated = departmentRepository.save(department);

        log.info("Manager assigned to department ID: {}", departmentId);

        return mapToDTO(updated);
    }

    private DepartmentDTO mapToDTO(Department department) {
        return DepartmentDTO.builder()
                .id(department.getId())
                .name(department.getName())
                .description(department.getDescription())
                .managerId(department.getManager() != null ? department.getManager().getId() : null)
                .managerName(department.getManager() != null ? 
                    department.getManager().getFirstName() + " " + department.getManager().getLastName() : null)
                .build();
    }

}
