package com.company.erp.team.controller;

import com.company.erp.common.dto.ApiResponse;
import com.company.erp.employee.dto.EmployeeDTO;
import com.company.erp.team.dto.TeamDTO;
import com.company.erp.team.service.TeamService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
@Slf4j
public class TeamController {

    private final TeamService teamService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public ResponseEntity<ApiResponse<TeamDTO>> createTeam(@RequestBody TeamDTO teamDTO) {
        log.info("[TEAM_ENDPOINT] Creating team: {}", teamDTO.getName());
        TeamDTO createdTeam = teamService.createTeam(teamDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(createdTeam, "Team created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public ResponseEntity<ApiResponse<TeamDTO>> updateTeam(@PathVariable Long id, @RequestBody TeamDTO teamDTO) {
        log.info("[TEAM_ENDPOINT] Updating team: {}", id);
        TeamDTO updatedTeam = teamService.updateTeam(id, teamDTO);
        return ResponseEntity.ok(ApiResponse.success(updatedTeam, "Team updated successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<TeamDTO>> getTeamById(@PathVariable Long id) {
        log.info("[TEAM_ENDPOINT] Fetching team: {}", id);
        TeamDTO team = teamService.getTeamById(id);
        return ResponseEntity.ok(ApiResponse.success(team));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<Page<TeamDTO>>> getAllTeams(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("[TEAM_ENDPOINT] Fetching all teams");
        Pageable pageable = PageRequest.of(page, size);
        Page<TeamDTO> teams = teamService.getAllTeams(pageable);
        return ResponseEntity.ok(ApiResponse.success(teams));
    }

    @GetMapping("/department/{departmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<Page<TeamDTO>>> getTeamsByDepartment(
            @PathVariable Long departmentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("[TEAM_ENDPOINT] Fetching teams for department: {}", departmentId);
        Pageable pageable = PageRequest.of(page, size);
        Page<TeamDTO> teams = teamService.getTeamsByDepartment(departmentId, pageable);
        return ResponseEntity.ok(ApiResponse.success(teams));
    }

    @GetMapping("/manager/{managerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public ResponseEntity<ApiResponse<Page<TeamDTO>>> getTeamsByManager(
            @PathVariable Long managerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("[TEAM_ENDPOINT] Fetching teams for manager: {}", managerId);
        Pageable pageable = PageRequest.of(page, size);
        Page<TeamDTO> teams = teamService.getTeamsByManager(managerId, pageable);
        return ResponseEntity.ok(ApiResponse.success(teams));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<TeamDTO>>> getTeamsByEmployee(@PathVariable Long employeeId) {
        log.info("[TEAM_ENDPOINT] Fetching teams for employee: {}", employeeId);
        List<TeamDTO> teams = teamService.getTeamsByEmployeeId(employeeId);
        return ResponseEntity.ok(ApiResponse.success(teams));
    }

    @PostMapping("/{teamId}/members/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public ResponseEntity<ApiResponse<String>> addMemberToTeam(
            @PathVariable Long teamId,
            @PathVariable Long employeeId) {
        log.info("[TEAM_ENDPOINT] Adding member {} to team {}", employeeId, teamId);
        teamService.addMemberToTeam(teamId, employeeId);
        return ResponseEntity.ok(ApiResponse.success("Member added to team successfully"));
    }

    @DeleteMapping("/{teamId}/members/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public ResponseEntity<ApiResponse<String>> removeMemberFromTeam(
            @PathVariable Long teamId,
            @PathVariable Long employeeId) {
        log.info("[TEAM_ENDPOINT] Removing member {} from team {}", employeeId, teamId);
        teamService.removeMemberFromTeam(teamId, employeeId);
        return ResponseEntity.ok(ApiResponse.success("Member removed from team successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<String>> deleteTeam(@PathVariable Long id) {
        log.info("[TEAM_ENDPOINT] Deleting team: {}", id);
        teamService.deleteTeam(id);
        return ResponseEntity.ok(ApiResponse.success("Team deleted successfully"));
    }

    @GetMapping("/managers/available")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<List<EmployeeDTO>>> getAvailableManagers() {
        log.info("[TEAM_ENDPOINT] Fetching available managers for team creation");
        List<EmployeeDTO> managers = teamService.getAvailableManagers().stream()
            .map(emp -> EmployeeDTO.builder()
                .id(emp.getId())
                .firstName(emp.getFirstName())
                .lastName(emp.getLastName())
                .email(emp.getEmail())
                .build())
            .toList();
        return ResponseEntity.ok(ApiResponse.success(managers, "Available managers retrieved successfully"));
    }
}
