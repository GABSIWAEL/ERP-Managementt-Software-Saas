package com.company.erp.team.service;

import com.company.erp.employee.entity.Employee;
import com.company.erp.team.dto.TeamDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TeamService {
    TeamDTO createTeam(TeamDTO teamDTO);
    TeamDTO updateTeam(Long id, TeamDTO teamDTO);
    TeamDTO getTeamById(Long id);
    Page<TeamDTO> getAllTeams(Pageable pageable);
    Page<TeamDTO> getTeamsByDepartment(Long departmentId, Pageable pageable);
    Page<TeamDTO> getTeamsByManager(Long managerId, Pageable pageable);
    List<TeamDTO> getTeamsByEmployeeId(Long employeeId);
    void deleteTeam(Long id);
    void addMemberToTeam(Long teamId, Long employeeId);
    void removeMemberFromTeam(Long teamId, Long employeeId);
    List<Employee> getAvailableManagers();
}
