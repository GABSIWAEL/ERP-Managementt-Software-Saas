package com.company.erp.employee.repository;

import com.company.erp.common.enums.EmployeeStatus;
import com.company.erp.employee.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByEmail(String email);

    boolean existsByEmail(String email);

    List<Employee> findByDepartmentId(Long departmentId);
    
    Page<Employee> findByDepartmentId(Long departmentId, Pageable pageable);

    List<Employee> findByStatus(EmployeeStatus status);

    Optional<Employee> findByUserId(Long userId);

}
