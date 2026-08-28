import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Task, TaskStatus } from '@types'
import { Card, Button, Input, Select, Textarea } from '@components/ui'
import { Modal } from '@components/ui'
import { taskApi } from '@api/index'
import { formatDate } from '@utils/helpers'
import { X, Plus } from 'lucide-react'

interface TaskModalProps {
  isOpen: boolean
  task?: Task | null
  teamId?: number
  onClose: () => void
  onSuccess?: () => void
}

const statusOptions = Object.values(TaskStatus).map(status => ({
  value: status,
  label: status.replace(/_/g, ' ')
}))

const priorityOptions = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' }
]

export default function TaskModal({ isOpen, task, teamId, onClose, onSuccess }: TaskModalProps) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || TaskStatus.TODO,
    priority: task?.priority || 'MEDIUM',
    assigneeId: task?.assigneeId || 0,
    dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
    teamId: task?.teamId || teamId || 0,
    completionPercentage: task?.completionPercentage || 0
  })

  const queryClient = useQueryClient()

  // Fetch employees for assignee dropdown
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await fetch('/api/employees')
      return response.json()
    }
  })

  const createMutation = useMutation({
    mutationFn: (data) => taskApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      onSuccess?.()
      onClose()
    }
  })

  const updateMutation = useMutation({
    mutationFn: (data) => taskApi.update(task!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      onSuccess?.()
      onClose()
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert('Title is required')
      return
    }

    if (!formData.assigneeId) {
      alert('Assignee is required')
      return
    }

    const submitData = {
      ...formData,
      assigneeId: parseInt(formData.assigneeId.toString()),
      teamId: formData.teamId ? parseInt(formData.teamId.toString()) : null,
      completionPercentage: parseInt(formData.completionPercentage.toString())
    }

    if (task?.id) {
      updateMutation.mutate(submitData)
    } else {
      createMutation.mutate(submitData)
    }
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task ? 'Edit Task' : 'Create Task'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title *
          </label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Task title"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Task description"
            rows={3}
          />
        </div>

        {/* Assignee */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Assign To *
          </label>
          <Select
            value={formData.assigneeId.toString()}
            onChange={(e) => setFormData({ ...formData, assigneeId: parseInt(e.target.value) })}
            required
          >
            <option value="">Select employee</option>
            {employees.map((emp: any) => (
              <option key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName}
              </option>
            ))}
          </Select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
          <Select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          >
            {priorityOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <Select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Completion Percentage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Completion: {formData.completionPercentage}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={formData.completionPercentage}
            onChange={(e) => setFormData({ ...formData, completionPercentage: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Due Date
          </label>
          <Input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
            {task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

