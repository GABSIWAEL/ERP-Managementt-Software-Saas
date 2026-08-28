package com.company.erp.team.service.impl;

import com.company.erp.common.exception.ResourceNotFoundException;
import com.company.erp.common.enums.UserRole;
import com.company.erp.common.exception.BusinessLogicException;
import com.company.erp.department.entity.Department;
import com.company.erp.department.repository.DepartmentRepository;
import com.company.erp.employee.entity.Employee;
import com.company.erp.employee.repository.EmployeeRepository;
import com.company.erp.security.entity.User;
import com.company.erp.security.repository.UserRepository;
import com.company.erp.team.dto.TeamDTO;
import com.company.erp.team.entity.Team;
import com.company.erp.team.repository.TeamRepository;
import com.company.erp.team.service.TeamService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TeamServiceImpl implements TeamService {

    private final TeamRepository teamRepository;
    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    @Override
    public TeamDTO createTeam(TeamDTO teamDTO) {
        log.info("[TEAM_CREATE] Creating team: {}", teamDTO.getName());
        
        UserRole currentUserRole = getCurrentUserRole();
        Long currentEmployeeId = getCurrentEmployeeId();
        
        // If manager is creating the team, auto-set manager to current user
        if (UserRole.MANAGER.equals(currentUserRole)) {
            log.info("[TEAM_CREATE] Manager creating team, auto-setting manager to current user");
            teamDTO.setManagerId(currentEmployeeId);
        }
        
        // Validate required fields
        if (teamDTO.getDepartmentId() == null) {
            throw new IllegalArgumentException("Department ID is required");
        }
        if (teamDTO.getManagerId() == null) {
            throw new IllegalArgumentException("Manager ID is required");
        }
        
        // For managers, validate they are assigning themselves
        if (UserRole.MANAGER.equals(currentUserRole) && !currentEmployeeId.equals(teamDTO.getManagerId())) {
            throw new BusinessLogicException("Managers can only create teams for themselves");
        }
        
        Department department = departmentRepository.findById(teamDTO.getDepartmentId())
            .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        
        Employee manager = employeeRepository.findById(teamDTO.getManagerId())
            .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));
        
        Team team = Team.builder()
            .name(teamDTO.getName())
            .description(teamDTO.getDescription())
            .department(department)
            .manager(manager)
            .active(true)
            .build();
        
        Team savedTeam = teamRepository.save(team);
        log.info("[TEAM_CREATE] Team created successfully with ID: {}", savedTeam.getId());
        return mapToDTO(savedTeam);
    }

    @Override
    public TeamDTO updateTeam(Long id, TeamDTO teamDTO) {
        log.info("[TEAM_UPDATE] Updating team: {}", id);
        
        Team team = teamRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Team not found with ID: " + id));
        
        if (teamDTO.getName() != null) {
            team.setName(teamDTO.getName());
        }
        if (teamDTO.getDescription() != null) {
            team.setDescription(teamDTO.getDescription());
        }
        if (teamDTO.getManagerId() != null) {
            Employee manager = employeeRepository.findById(teamDTO.getManagerId())
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));
            team.setManager(manager);
        }
        
        Team updatedTeam = teamRepository.save(team);
        log.info("[TEAM_UPDATE] Team updated successfully");
        return mapToDTO(updatedTeam);
    }

    @Override
    @Transactional(readOnly = true)
    public TeamDTO getTeamById(Long id) {
        Team team = teamRepository.findByIdAndActiveTrue(id)
            .orElseThrow(() -> new ResourceNotFoundException("Team not found with ID: " + id));
        return mapToDTO(team);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TeamDTO> getAllTeams(Pageable pageable) {
        return teamRepository.findAll(pageable)
            .map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TeamDTO> getTeamsByDepartment(Long departmentId, Pageable pageable) {
        log.info("[TEAM_FETCH] Fetching teams for department: {}", departmentId);
        return teamRepository.findByDepartmentIdAndActiveTrue(departmentId, pageable)
            .map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TeamDTO> getTeamsByManager(Long managerId, Pageable pageable) {
        log.info("[TEAM_FETCH] Fetching teams managed by: {}", managerId);
        return teamRepository.findByManagerIdAndActiveTrue(managerId, pageable)
            .map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeamDTO> getTeamsByEmployeeId(Long employeeId) {
        log.info("[TEAM_FETCH] Fetching teams for employee: {}", employeeId);
        return teamRepository.getTeamsByEmployee(employeeId)
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public void deleteTeam(Long id) {
        log.info("[TEAM_DELETE] Soft deleting team: {}", id);
        Team team = teamRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Team not found with ID: " + id));
        team.setActive(false);
        teamRepository.save(team);
        log.info("[TEAM_DELETE] Team deleted successfully");
    }

    @Override
    public void addMemberToTeam(Long teamId, Long employeeId) {
        log.info("[TEAM_MEMBER_ADD] Adding employee {} to team {}", employeeId, teamId);
        
        Team team = teamRepository.findById(teamId)
            .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
        
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        
        team.getMembers().add(employee);
        teamRepository.save(team);
        log.info("[TEAM_MEMBER_ADD] Member added successfully");
    }

    @Override
    public void removeMemberFromTeam(Long teamId, Long employeeId) {
        log.info("[TEAM_MEMBER_REMOVE] Removing employee {} from team {}", employeeId, teamId);
        
        Team team = teamRepository.findById(teamId)
            .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
        
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        
        team.getMembers().remove(employee);
        teamRepository.save(team);
        log.info("[TEAM_MEMBER_REMOVE] Member removed successfully");
    }

    private TeamDTO mapToDTO(Team team) {
        return TeamDTO.builder()
            .id(team.getId())
            .name(team.getName())
            .description(team.getDescription())
            .departmentId(team.getDepartment().getId())
            .departmentName(team.getDepartment().getName())
            .managerId(team.getManager().getId())
            .managerName(team.getManager().getFirstName() + " " + team.getManager().getLastName())
            .memberIds(team.getMembers().stream().map(Employee::getId).collect(Collectors.toSet()))
            .memberCount(team.getMembers().size())
            .active(team.getActive())
            .createdAt(team.getCreatedAt())
            .updatedAt(team.getUpdatedAt())
            .build();
    }

    /**
     * Get the current authenticated user's role
     */
    private UserRole getCurrentUserRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BusinessLogicException("User not authenticated");
        }
        
        String role = authentication.getAuthorities().stream()
            .findFirst()
            .map(auth -> auth.getAuthority().replace("ROLE_", ""))
            .orElseThrow(() -> new BusinessLogicException("User role not found"));
        
        try {
            return UserRole.valueOf(role);
        } catch (IllegalArgumentException e) {
            throw new BusinessLogicException("Invalid user role: " + role);
        }
    }

    /**
     * Get the current authenticated user's employee ID
     */
    private Long getCurrentEmployeeId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BusinessLogicException("User not authenticated");
        }
        
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        Employee employee = employeeRepository.findAll().stream()
            .filter(emp -> emp.getUser() != null && emp.getUser().getId().equals(user.getId()))
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("Employee not found for user: " + username));
        
        return employee.getId();
    }

    /**
     * Get all managers (employees with MANAGER role)
     */
    public List<Employee> getAvailableManagers() {
        log.info("[TEAM_FETCH] Fetching available managers");
        return userRepository.findAll().stream()
            .filter(user -> UserRole.MANAGER.equals(user.getRole()))
            .map(user -> employeeRepository.findAll().stream()
                .filter(emp -> emp.getUser() != null && emp.getUser().getId().equals(user.getId()))
                .findFirst()
                .orElse(null))
            .filter(emp -> emp != null)
            .collect(Collectors.toList());
    }
}
