import { type DragEvent } from 'react'
import { Task, TaskStatus, TaskPriority } from '@types'
import { Card, CardContent, Badge, Button } from '@components/ui'
import { Edit2, Trash2, MessageSquare } from 'lucide-react'

interface TaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
  onStatusChange?: (task: Task, status: TaskStatus) => void
  onDetails?: (task: Task) => void
  isDraggable?: boolean
}

const statusColors: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'secondary',
  [TaskStatus.IN_PROGRESS]: 'warning',
  [TaskStatus.IN_REVIEW]: 'info',
  [TaskStatus.DONE]: 'success',
  [TaskStatus.BLOCKED]: 'danger',
  [TaskStatus.CANCELLED]: 'secondary',
}

const priorityColors: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'secondary',
  [TaskPriority.MEDIUM]: 'warning',
  [TaskPriority.HIGH]: 'danger',
  [TaskPriority.CRITICAL]: 'danger',
}

export default function TaskCard({ task, onEdit, onDelete, onStatusChange, onDetails, isDraggable }: TaskCardProps) {
  const handleStatusChange = (newStatus: TaskStatus) => {
    if (onStatusChange) {
      onStatusChange(task, newStatus)
    }
  }

  const handleDragStart = (event: DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('text/plain', task.id.toString())
    event.dataTransfer.effectAllowed = 'move'
  }

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    const statusFlow: Record<TaskStatus, TaskStatus | null> = {
      [TaskStatus.TODO]: TaskStatus.IN_PROGRESS,
      [TaskStatus.IN_PROGRESS]: TaskStatus.IN_REVIEW,
      [TaskStatus.IN_REVIEW]: TaskStatus.DONE,
      [TaskStatus.DONE]: null,
      [TaskStatus.BLOCKED]: TaskStatus.TODO,
      [TaskStatus.CANCELLED]: null,
    }
    return statusFlow[current]
  }

  const nextStatus = getNextStatus(task.status)

  return (
    <Card
      className={`hover:shadow-lg transition-shadow ${isDraggable ? 'cursor-move' : ''}`}
      draggable={isDraggable}
      onDragStart={isDraggable ? handleDragStart : undefined}
    >
      <CardContent className="pt-6">
        <div className="space-y-3">
          {/* Priority & Status Badges */}
          <div className="flex gap-2">
            <Badge variant={priorityColors[task.priority]}>
              {task.priority}
            </Badge>
            <Badge variant={statusColors[task.status]}>
              {task.status.replace(/_/g, ' ')}
            </Badge>
          </div>

          {/* Title */}
          <div>
            <h3
              className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-primary-600 dark:hover:text-primary-400"
              onClick={() => onDetails?.(task)}
            >
              {task.title}
            </h3>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Assignee & Team */}
          <div className="space-y-1 text-sm">
            {task.assigneeName && (
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">Assigned to:</span> {task.assigneeName}
              </p>
            )}
            {task.teamName && (
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">Team:</span> {task.teamName}
              </p>
            )}
          </div>

          {/* Progress Bar */}
          {task.completionPercentage !== undefined && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {task.completionPercentage}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full rounded-full bg-primary-600 transition-all"
                  style={{ width: `${task.completionPercentage}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Due Date */}
          {task.dueDate && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </p>
          )}

          {/* Comments Count */}
          {task.comments && (
            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
              <MessageSquare size={14} />
              <span>{task.comments.split('---').filter(c => c.trim()).length} comments</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            {nextStatus && onStatusChange && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange(nextStatus)}
                className="flex-1"
              >
                Move Forward
              </Button>
            )}
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(task)}
                className="flex-1"
              >
                <Edit2 size={14} />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(task)}
                className="flex-1"
              >
                <Trash2 size={14} />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

