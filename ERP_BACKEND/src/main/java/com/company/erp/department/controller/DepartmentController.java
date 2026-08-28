package com.company.erp.department.controller;

import com.company.erp.common.dto.ApiResponse;
import com.company.erp.department.dto.DepartmentDTO;
import com.company.erp.department.service.DepartmentService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/departments")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DepartmentController {

    @Autowired
    private DepartmentService departmentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<DepartmentDTO>> createDepartment(
            @Valid @RequestBody DepartmentDTO departmentDTO) {
        log.info("Creating new department: {}", departmentDTO.getName());
        DepartmentDTO response = departmentService.createDepartment(departmentDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Department created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<DepartmentDTO>> updateDepartment(
            @PathVariable Long id,
            @Valid @RequestBody DepartmentDTO departmentDTO) {
        log.info("Updating department with ID: {}", id);
        DepartmentDTO response = departmentService.updateDepartment(id, departmentDTO);
        return ResponseEntity.ok()
                .body(ApiResponse.success(response, "Department updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteDepartment(@PathVariable Long id) {
        log.info("Deleting department with ID: {}", id);
        departmentService.deleteDepartment(id);
        return ResponseEntity.ok()
                .body(ApiResponse.success(null, "Department deleted successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<DepartmentDTO>> getDepartmentById(@PathVariable Long id) {
        log.info("Getting department with ID: {}", id);
        DepartmentDTO response = departmentService.getDepartmentById(id);
        return ResponseEntity.ok()
                .body(ApiResponse.success(response, "Department retrieved successfully"));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<List<DepartmentDTO>>> getAllDepartments() {
        log.info("Getting all departments");
        List<DepartmentDTO> response = departmentService.getAllDepartments();
        return ResponseEntity.ok()
                .body(ApiResponse.success(response, "Departments retrieved successfully"));
    }

    @PostMapping("/{departmentId}/assign-manager/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<DepartmentDTO>> assignManager(
            @PathVariable Long departmentId,
            @PathVariable Long employeeId) {
        log.info("Assigning manager {} to department {}", employeeId, departmentId);
        DepartmentDTO response = departmentService.assignManager(departmentId, employeeId);
        return ResponseEntity.ok()
                .body(ApiResponse.success(response, "Manager assigned successfully"));
    }

}
