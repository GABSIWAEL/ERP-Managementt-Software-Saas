package com.company.erp.team.repository;

import com.company.erp.team.entity.Team;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TeamRepository extends JpaRepository<Team, Long> {
    List<Team> findByDepartmentIdAndActiveTrue(Long departmentId);
    List<Team> findByManagerIdAndActiveTrue(Long managerId);
    Page<Team> findByDepartmentIdAndActiveTrue(Long departmentId, Pageable pageable);
    Page<Team> findByManagerIdAndActiveTrue(Long managerId, Pageable pageable);
    
    @Query("SELECT t FROM Team t WHERE t.department.id = :departmentId AND t.active = true")
    List<Team> getTeamsByDepartment(@Param("departmentId") Long departmentId);
    
    @Query("SELECT t FROM Team t JOIN t.members m WHERE m.id = :employeeId AND t.active = true")
    List<Team> getTeamsByEmployee(@Param("employeeId") Long employeeId);
    
    Optional<Team> findByIdAndActiveTrue(Long id);
}
