package com.company.erp.task.repository;

import com.company.erp.task.entity.Task;
import com.company.erp.task.entity.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {
    
    // Assigned tasks
    Page<Task> findByAssigneeIdAndActiveTrue(Long assigneeId, Pageable pageable);
    List<Task> findByAssigneeIdAndActiveTrue(Long assigneeId);
    List<Task> findByAssigneeIdAndStatusAndActiveTrue(Long assigneeId, TaskStatus status);
    
    // Team tasks
    Page<Task> findByTeamIdAndActiveTrue(Long teamId, Pageable pageable);
    List<Task> findByTeamIdAndActiveTrue(Long teamId);
    
    // Created by manager
    List<Task> findByCreatedByIdAndActiveTrue(Long managerId);
    Page<Task> findByCreatedByIdAndActiveTrue(Long managerId, Pageable pageable);
    
    // By status
    List<Task> findByStatusAndActiveTrue(TaskStatus status);
    
    // Due date queries
    List<Task> findByDueDateBetweenAndActiveTrue(LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT t FROM Task t WHERE t.assignee.id = :assigneeId AND t.status = :status AND t.active = true")
    List<Task> getTasksByAssigneeAndStatus(@Param("assigneeId") Long assigneeId, @Param("status") TaskStatus status);
    
    @Query("SELECT t FROM Task t WHERE t.team.id = :teamId AND t.active = true ORDER BY t.priority DESC, t.dueDate ASC")
    List<Task> getTeamTasksSorted(@Param("teamId") Long teamId);
    
    @Query("SELECT t FROM Task t WHERE t.assignee.id = :assigneeId AND t.active = true ORDER BY t.priority DESC, t.dueDate ASC")
    List<Task> getAssignedTasksSorted(@Param("assigneeId") Long assigneeId);
    
    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignee.id = :assigneeId AND t.status = 'DONE' AND t.active = true")
    long countCompletedTasks(@Param("assigneeId") Long assigneeId);
    
    Optional<Task> findByIdAndActiveTrue(Long id);
}
