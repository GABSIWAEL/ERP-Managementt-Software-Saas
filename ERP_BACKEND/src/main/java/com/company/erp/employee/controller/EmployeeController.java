package com.company.erp.employee.controller;

import com.company.erp.common.dto.ApiResponse;
import com.company.erp.employee.dto.EmployeeDTO;
import com.company.erp.employee.dto.UpdateEmployeeDTO;
import com.company.erp.employee.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "*", maxAge = 3600)
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<EmployeeDTO>> createEmployee(
            @Valid @RequestBody EmployeeDTO employeeDTO) {
        log.info("Creating new employee: {} {}", employeeDTO.getFirstName(), employeeDTO.getLastName());
        EmployeeDTO response = employeeService.createEmployee(employeeDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Employee created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<EmployeeDTO>> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody UpdateEmployeeDTO updateEmployeeDTO) {
        log.info("Updating employee with ID: {}", id);
        EmployeeDTO response = employeeService.updateEmployee(id, updateEmployeeDTO);
        return ResponseEntity.ok()
                .body(ApiResponse.success(response, "Employee updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> terminateEmployee(@PathVariable Long id) {
        log.info("Terminating employee with ID: {}", id);
        employeeService.terminateEmployee(id);
        return ResponseEntity.ok()
                .body(ApiResponse.success(null, "Employee terminated successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'ACCOUNTANT', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<EmployeeDTO>> getEmployeeById(@PathVariable Long id) {
        log.info("Getting employee with ID: {}", id);
        EmployeeDTO response = employeeService.getEmployeeById(id);
        return ResponseEntity.ok()
                .body(ApiResponse.success(response, "Employee retrieved successfully"));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'ACCOUNTANT') or (hasRole('EMPLOYEE') and #departmentId != null)")
    public ResponseEntity<ApiResponse<Object>> getAllEmployees(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long departmentId) {
        log.info("Getting employees with page={}, size={}, departmentId={}", page, size, departmentId);
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        org.springframework.data.domain.Page<EmployeeDTO> response = employeeService.getEmployeesPaginated(pageable, departmentId);
        return ResponseEntity.ok()
                .body(ApiResponse.success(response, "Employees retrieved successfully"));
    }

    @GetMapping("/department/{departmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'ACCOUNTANT', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<EmployeeDTO>>> getEmployeesByDepartment(
            @PathVariable Long departmentId) {
        log.info("Getting employees for department: {}", departmentId);
        List<EmployeeDTO> response = employeeService.getEmployeesByDepartment(departmentId);
        return ResponseEntity.ok()
                .body(ApiResponse.success(response, "Employees retrieved successfully"));
    }

    @PostMapping("/{employeeId}/transfer-department/{departmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<EmployeeDTO>> transferDepartment(
            @PathVariable Long employeeId,
            @PathVariable Long departmentId) {
        log.info("Transferring employee {} to department {}", employeeId, departmentId);
        EmployeeDTO response = employeeService.transferDepartment(employeeId, departmentId);
        return ResponseEntity.ok()
                .body(ApiResponse.success(response, "Employee transferred successfully"));
    }

    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER')")
    public ResponseEntity<ApiResponse<EmployeeDTO>> getEmployeeProfile() {
        log.info("Getting current employee profile");
        EmployeeDTO response = employeeService.getEmployeeProfile();
        return ResponseEntity.ok()
                .body(ApiResponse.success(response, "Profile retrieved successfully"));
    }

}
