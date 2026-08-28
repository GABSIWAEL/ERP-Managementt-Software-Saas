package com.company.erp.task.dto;

import com.company.erp.task.entity.TaskPriority;
import com.company.erp.task.entity.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskDTO {
    private Long id;
    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private Long teamId;
    private String teamName;
    private Long assigneeId;
    private String assigneeName;
    private String assigneeEmail;
    private Long createdById;
    private String createdByName;
    private LocalDate dueDate;
    private String comments;
    private Integer completionPercentage;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
