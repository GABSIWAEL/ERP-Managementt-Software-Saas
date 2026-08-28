import { useState, type DragEvent } from 'react'
import { Task, TaskStatus } from '@types'
import TaskCard from './TaskCard'
import { Card, CardHeader, Button } from '@components/ui'
import { Plus } from 'lucide-react'

interface TaskKanbanBoardProps {
  tasks: Task[]
  isLoading?: boolean
  onTaskEdit?: (task: Task) => void
  onTaskDelete?: (task: Task) => void
  onTaskStatusChange?: (task: Task, status: TaskStatus) => void
  onTaskDetails?: (task: Task) => void
  showAddButton?: boolean
  onAddTask?: () => void
}

const statuses: TaskStatus[] = [
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.DONE,
  TaskStatus.BLOCKED,
  TaskStatus.CANCELLED
]

const statusLabels: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'To Do',
  [TaskStatus.IN_PROGRESS]: 'In Progress',
  [TaskStatus.IN_REVIEW]: 'In Review',
  [TaskStatus.DONE]: 'Done',
  [TaskStatus.BLOCKED]: 'Blocked',
  [TaskStatus.CANCELLED]: 'Cancelled'
}

const statusColors: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'bg-gray-50 dark:bg-gray-900/20',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-50 dark:bg-blue-900/20',
  [TaskStatus.IN_REVIEW]: 'bg-amber-50 dark:bg-amber-900/20',
  [TaskStatus.DONE]: 'bg-green-50 dark:bg-green-900/20',
  [TaskStatus.BLOCKED]: 'bg-red-50 dark:bg-red-900/20',
  [TaskStatus.CANCELLED]: 'bg-gray-50 dark:bg-gray-900/20'
}

export default function TaskKanbanBoard({
  tasks,
  isLoading,
  onTaskEdit,
  onTaskDelete,
  onTaskStatusChange,
  onTaskDetails,
  showAddButton,
  onAddTask
}: TaskKanbanBoardProps) {
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null)

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>, status: TaskStatus) => {
    event.preventDefault()
    setDragOverStatus(null)

    const taskId = event.dataTransfer.getData('text/plain')
    if (!taskId) return

    const task = tasks.find((t) => t.id.toString() === taskId)
    if (!task || task.status === status) return

    onTaskStatusChange?.(task, status)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statuses.slice(0, 3).map(status => (
          <Card key={status} className="p-6">
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-6">
      {(showAddButton && onAddTask) && (
        <div className="flex items-center justify-end">
          <Button size="sm" variant="secondary" onClick={onAddTask} className="gap-2">
            <Plus size={14} />
            Add Task
          </Button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {statuses.map(status => {
          const statusTasks = tasks.filter(t => t.status === status)
          const count = statusTasks.length

          return (
            <div
              key={status}
              className={`flex flex-col ${dragOverStatus === status ? 'ring-2 ring-primary-500/70' : ''}`}
              onDragOver={handleDragOver}
              onDragEnter={() => setDragOverStatus(status)}
              onDragLeave={() => setDragOverStatus(null)}
              onDrop={(event) => handleDrop(event, status)}
            >
              {/* Column Header */}
              <div className="mb-4 flex items-center justify-between px-2">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {statusLabels[status]}
                </h3>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  {count}
                </span>
              </div>

              {/* Drop Zone */}
              <div className={`flex-1 rounded-lg p-4 space-y-3 min-h-96 ${statusColors[status]} border-2 border-dashed border-gray-300 dark:border-gray-600`}>
                {statusTasks.length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-600">
                    <p className="text-sm">No tasks</p>
                  </div>
                ) : (
                  statusTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={onTaskEdit}
                      onDelete={onTaskDelete}
                      onStatusChange={onTaskStatusChange}
                      onDetails={onTaskDetails}
                      isDraggable={true}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

