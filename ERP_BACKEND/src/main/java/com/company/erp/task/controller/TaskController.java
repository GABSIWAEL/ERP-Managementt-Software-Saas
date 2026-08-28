package com.company.erp.task.controller;

import com.company.erp.common.dto.ApiResponse;
import com.company.erp.task.dto.TaskDTO;
import com.company.erp.task.entity.TaskStatus;
import com.company.erp.task.service.TaskService;
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
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Slf4j
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public ResponseEntity<ApiResponse<TaskDTO>> createTask(@RequestBody TaskDTO taskDTO) {
        log.info("[TASK_ENDPOINT] Creating task: {}", taskDTO.getTitle());
        TaskDTO createdTask = taskService.createTask(taskDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(createdTask, "Task created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<TaskDTO>> updateTask(@PathVariable Long id, @RequestBody TaskDTO taskDTO) {
        log.info("[TASK_ENDPOINT] Updating task: {}", id);
        TaskDTO updatedTask = taskService.updateTask(id, taskDTO);
        return ResponseEntity.ok(ApiResponse.success(updatedTask, "Task updated successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<TaskDTO>> getTaskById(@PathVariable Long id) {
        log.info("[TASK_ENDPOINT] Fetching task: {}", id);
        TaskDTO task = taskService.getTaskById(id);
        return ResponseEntity.ok(ApiResponse.success(task));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<Page<TaskDTO>>> getAllTasks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("[TASK_ENDPOINT] Fetching all tasks");
        Pageable pageable = PageRequest.of(page, size);
        Page<TaskDTO> tasks = taskService.getAllTasks(pageable);
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @GetMapping("/assignee/{assigneeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<Page<TaskDTO>>> getTasksByAssignee(
            @PathVariable Long assigneeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("[TASK_ENDPOINT] Fetching tasks for assignee: {}", assigneeId);
        Pageable pageable = PageRequest.of(page, size);
        Page<TaskDTO> tasks = taskService.getTasksByAssignee(assigneeId, pageable);
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @GetMapping("/team/{teamId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<Page<TaskDTO>>> getTasksByTeam(
            @PathVariable Long teamId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("[TASK_ENDPOINT] Fetching tasks for team: {}", teamId);
        Pageable pageable = PageRequest.of(page, size);
        Page<TaskDTO> tasks = taskService.getTasksByTeam(teamId, pageable);
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @GetMapping("/manager/{managerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public ResponseEntity<ApiResponse<Page<TaskDTO>>> getTasksByManager(
            @PathVariable Long managerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("[TASK_ENDPOINT] Fetching tasks created by manager: {}", managerId);
        Pageable pageable = PageRequest.of(page, size);
        Page<TaskDTO> tasks = taskService.getTasksByManager(managerId, pageable);
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @GetMapping("/assignee/{assigneeId}/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<TaskDTO>>> getTasksByAssigneeAndStatus(
            @PathVariable Long assigneeId,
            @PathVariable TaskStatus status) {
        log.info("[TASK_ENDPOINT] Fetching tasks for assignee {} with status {}", assigneeId, status);
        List<TaskDTO> tasks = taskService.getTasksByAssigneeAndStatus(assigneeId, status);
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<TaskDTO>> updateTaskStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        log.info("[TASK_ENDPOINT] Updating task status: {}", id);
        TaskStatus newStatus = TaskStatus.valueOf(request.get("status"));
        TaskDTO updatedTask = taskService.updateTaskStatus(id, newStatus);
        return ResponseEntity.ok(ApiResponse.success(updatedTask, "Task status updated successfully"));
    }

    @PatchMapping("/{id}/progress")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<TaskDTO>> updateTaskProgress(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> request) {
        log.info("[TASK_ENDPOINT] Updating task progress: {}", id);
        Integer completionPercentage = request.get("completionPercentage");
        TaskDTO updatedTask = taskService.updateTaskProgress(id, completionPercentage);
        return ResponseEntity.ok(ApiResponse.success(updatedTask, "Task progress updated successfully"));
    }

    @PostMapping("/{id}/comments")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<TaskDTO>> addComment(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        log.info("[TASK_ENDPOINT] Adding comment to task: {}", id);
        String comment = request.get("comment");
        TaskDTO updatedTask = taskService.addComment(id, comment);
        return ResponseEntity.ok(ApiResponse.success(updatedTask, "Comment added successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<String>> deleteTask(@PathVariable Long id) {
        log.info("[TASK_ENDPOINT] Deleting task: {}", id);
        taskService.deleteTask(id);
        return ResponseEntity.ok(ApiResponse.success("Task deleted successfully"));
    }
}
