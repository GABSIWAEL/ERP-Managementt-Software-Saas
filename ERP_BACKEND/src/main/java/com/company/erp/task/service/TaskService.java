package com.company.erp.task.service;

import com.company.erp.task.dto.TaskDTO;
import com.company.erp.task.entity.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TaskService {
    TaskDTO createTask(TaskDTO taskDTO);
    TaskDTO updateTask(Long id, TaskDTO taskDTO);
    TaskDTO getTaskById(Long id);
    Page<TaskDTO> getAllTasks(Pageable pageable);
    Page<TaskDTO> getTasksByAssignee(Long assigneeId, Pageable pageable);
    Page<TaskDTO> getTasksByTeam(Long teamId, Pageable pageable);
    Page<TaskDTO> getTasksByManager(Long managerId, Pageable pageable);
    List<TaskDTO> getTasksByAssigneeAndStatus(Long assigneeId, TaskStatus status);
    TaskDTO updateTaskStatus(Long taskId, TaskStatus newStatus);
    TaskDTO updateTaskProgress(Long taskId, Integer completionPercentage);
    TaskDTO addComment(Long taskId, String comment);
    void deleteTask(Long id);
}
