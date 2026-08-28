package com.company.erp.task.service.impl;

import com.company.erp.common.exception.ResourceNotFoundException;
import com.company.erp.employee.entity.Employee;
import com.company.erp.employee.repository.EmployeeRepository;
import com.company.erp.security.entity.User;
import com.company.erp.security.repository.UserRepository;
import com.company.erp.task.dto.TaskDTO;
import com.company.erp.task.entity.Task;
import com.company.erp.task.entity.TaskStatus;
import com.company.erp.task.repository.TaskRepository;
import com.company.erp.task.service.TaskService;
import com.company.erp.team.entity.Team;
import com.company.erp.team.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final EmployeeRepository employeeRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;

    @Override
    public TaskDTO createTask(TaskDTO taskDTO) {
        log.info("[TASK_CREATE] Creating task: {}", taskDTO.getTitle());
        
        Employee assignee = employeeRepository.findById(taskDTO.getAssigneeId())
            .orElseThrow(() -> new ResourceNotFoundException("Assignee not found"));
        
        Employee createdBy = resolveTaskCreator(taskDTO);
        
        Task task = Task.builder()
            .title(taskDTO.getTitle())
            .description(taskDTO.getDescription())
            .status(taskDTO.getStatus() != null ? taskDTO.getStatus() : TaskStatus.TODO)
            .priority(taskDTO.getPriority() != null ? taskDTO.getPriority() : com.company.erp.task.entity.TaskPriority.MEDIUM)
            .assignee(assignee)
            .createdBy(createdBy)
            .dueDate(taskDTO.getDueDate())
            .completionPercentage(0)
            .active(true)
            .build();
        
        if (taskDTO.getTeamId() != null) {
            Team team = teamRepository.findById(taskDTO.getTeamId())
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
            task.setTeam(team);
        }
        
        Task savedTask = taskRepository.save(task);
        log.info("[TASK_CREATE] Task created successfully with ID: {}", savedTask.getId());
        return mapToDTO(savedTask);
    }

    @Override
    public TaskDTO updateTask(Long id, TaskDTO taskDTO) {
        log.info("[TASK_UPDATE] Updating task: {}", id);
        
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + id));
        
        if (taskDTO.getTitle() != null) task.setTitle(taskDTO.getTitle());
        if (taskDTO.getDescription() != null) task.setDescription(taskDTO.getDescription());
        if (taskDTO.getStatus() != null) task.setStatus(taskDTO.getStatus());
        if (taskDTO.getPriority() != null) task.setPriority(taskDTO.getPriority());
        if (taskDTO.getDueDate() != null) task.setDueDate(taskDTO.getDueDate());
        if (taskDTO.getCompletionPercentage() != null) task.setCompletionPercentage(taskDTO.getCompletionPercentage());
        
        if (taskDTO.getAssigneeId() != null) {
            Employee assignee = employeeRepository.findById(taskDTO.getAssigneeId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignee not found"));
            task.setAssignee(assignee);
        }
        
        Task updatedTask = taskRepository.save(task);
        log.info("[TASK_UPDATE] Task updated successfully");
        return mapToDTO(updatedTask);
    }

    @Override
    @Transactional(readOnly = true)
    public TaskDTO getTaskById(Long id) {
        Task task = taskRepository.findByIdAndActiveTrue(id)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + id));
        return mapToDTO(task);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TaskDTO> getAllTasks(Pageable pageable) {
        return taskRepository.findAll(pageable)
            .map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TaskDTO> getTasksByAssignee(Long assigneeId, Pageable pageable) {
        log.info("[TASK_FETCH] Fetching tasks for assignee: {}", assigneeId);
        return taskRepository.findByAssigneeIdAndActiveTrue(assigneeId, pageable)
            .map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TaskDTO> getTasksByTeam(Long teamId, Pageable pageable) {
        log.info("[TASK_FETCH] Fetching tasks for team: {}", teamId);
        return taskRepository.findByTeamIdAndActiveTrue(teamId, pageable)
            .map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TaskDTO> getTasksByManager(Long managerId, Pageable pageable) {
        log.info("[TASK_FETCH] Fetching tasks created by manager: {}", managerId);
        return taskRepository.findByCreatedByIdAndActiveTrue(managerId, pageable)
            .map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskDTO> getTasksByAssigneeAndStatus(Long assigneeId, TaskStatus status) {
        return taskRepository.getTasksByAssigneeAndStatus(assigneeId, status)
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public TaskDTO updateTaskStatus(Long taskId, TaskStatus newStatus) {
        log.info("[TASK_STATUS_UPDATE] Updating task {} status to {}", taskId, newStatus);
        
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        
        task.setStatus(newStatus);
        if (newStatus == TaskStatus.DONE) {
            task.setCompletionPercentage(100);
        }
        
        Task updatedTask = taskRepository.save(task);
        log.info("[TASK_STATUS_UPDATE] Task status updated successfully");
        return mapToDTO(updatedTask);
    }

    @Override
    public TaskDTO updateTaskProgress(Long taskId, Integer completionPercentage) {
        log.info("[TASK_PROGRESS_UPDATE] Updating task {} progress to {}%", taskId, completionPercentage);
        
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        
        if (completionPercentage < 0 || completionPercentage > 100) {
            throw new IllegalArgumentException("Completion percentage must be between 0 and 100");
        }
        
        task.setCompletionPercentage(completionPercentage);
        
        // Auto-update status based on progress
        if (completionPercentage == 0) {
            task.setStatus(TaskStatus.TODO);
        } else if (completionPercentage == 100) {
            task.setStatus(TaskStatus.DONE);
        } else if (task.getStatus() == TaskStatus.TODO) {
            task.setStatus(TaskStatus.IN_PROGRESS);
        }
        
        Task updatedTask = taskRepository.save(task);
        log.info("[TASK_PROGRESS_UPDATE] Task progress updated successfully");
        return mapToDTO(updatedTask);
    }

    @Override
    public TaskDTO addComment(Long taskId, String comment) {
        log.info("[TASK_COMMENT] Adding comment to task: {}", taskId);
        
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        
        String existingComments = task.getComments() != null ? task.getComments() : "";
        String newComment = existingComments.isEmpty() 
            ? comment 
            : existingComments + "\n---\n" + comment;
        
        task.setComments(newComment);
        Task updatedTask = taskRepository.save(task);
        log.info("[TASK_COMMENT] Comment added successfully");
        return mapToDTO(updatedTask);
    }

    @Override
    public void deleteTask(Long id) {
        log.info("[TASK_DELETE] Soft deleting task: {}", id);
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + id));
        task.setActive(false);
        taskRepository.save(task);
        log.info("[TASK_DELETE] Task deleted successfully");
    }

    private Employee resolveTaskCreator(TaskDTO taskDTO) {
        if (taskDTO.getCreatedById() != null) {
            return employeeRepository.findById(taskDTO.getCreatedById())
                .orElseThrow(() -> new ResourceNotFoundException("Creator not found"));
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResourceNotFoundException("Authenticated user not found");
        }

        String username = authentication.getName();
        User currentUser = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

        return employeeRepository.findByUserId(currentUser.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Creator employee not found for authenticated user"));
    }

    private TaskDTO mapToDTO(Task task) {
        return TaskDTO.builder()
            .id(task.getId())
            .title(task.getTitle())
            .description(task.getDescription())
            .status(task.getStatus())
            .priority(task.getPriority())
            .teamId(task.getTeam() != null ? task.getTeam().getId() : null)
            .teamName(task.getTeam() != null ? task.getTeam().getName() : null)
            .assigneeId(task.getAssignee().getId())
            .assigneeName(task.getAssignee().getFirstName() + " " + task.getAssignee().getLastName())
            .assigneeEmail(task.getAssignee().getEmail())
            .createdById(task.getCreatedBy().getId())
            .createdByName(task.getCreatedBy().getFirstName() + " " + task.getCreatedBy().getLastName())
            .dueDate(task.getDueDate())
            .comments(task.getComments())
            .completionPercentage(task.getCompletionPercentage())
            .active(task.getActive())
            .createdAt(task.getCreatedAt())
            .updatedAt(task.getUpdatedAt())
            .build();
    }
}
