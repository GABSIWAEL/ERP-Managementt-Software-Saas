import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, Button, Input, Select, Textarea, Badge } from '@components/ui'
import { MainLayout } from '@components/layout'
import { taskApi, employeeApi, teamApi } from '@api/index'
import { getFullName } from '@utils/helpers'
import { Plus, X } from 'lucide-react'
import { Task, TaskStatus, Team, UserRole } from '@types'
import { useAuthStore } from '@store/authStore'
import TaskKanbanBoard from '@components/tasks/TaskKanbanBoard'

export default function TasksPage() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const isManager = user?.role === UserRole.MANAGER
  
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'ALL'>('ALL')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: TaskStatus.TODO,
    priority: 'MEDIUM',
    assigneeId: 0,
    dueDate: '',
    teamId: 0,
    completionPercentage: 0
  })

  // Fetch current employee data to get department
  const { data: currentEmployeeData } = useQuery({
    queryKey: ['currentEmployee'],
    queryFn: async () => await employeeApi.getProfile()
  })

  const userDepartmentId = currentEmployeeData?.department?.id || 0

  // Fetch tasks based on role
  const [teamFilter, setTeamFilter] = useState<number | 'ALL'>('ALL')

  const { data: tasksData = { content: [] }, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', filterStatus, userDepartmentId, teamFilter],
    queryFn: async () => {
      let tasks: Task[] = []

      if (user?.role === UserRole.ADMIN) {
        const response = await taskApi.getAll(0, 100)
        tasks = response.content || response
      } else if (isManager && currentEmployeeData?.id) {
        const response = await taskApi.getByManager(currentEmployeeData.id, 0, 100)
        tasks = response.content || response
      } else if (currentEmployeeData?.id) {
        const response = await taskApi.getByAssignee(currentEmployeeData.id, 0, 100)
        tasks = response.content || response
      }

      if (filterStatus !== 'ALL') {
        tasks = tasks.filter((t: Task) => t.status === filterStatus)
      }

      if (teamFilter !== 'ALL') {
        tasks = tasks.filter((t: Task) => t.teamId === teamFilter)
      }

      return tasks
    },
    enabled: !!currentEmployeeData?.id
  })

  const tasks = Array.isArray(tasksData) ? tasksData : tasksData.content || []

  // Fetch employees
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await employeeApi.getAll(0, 100)
      return response.content || response
    }
  })

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const response = await teamApi.getAll(0, 100)
      return response.content || response
    }
  })

  const createMutation = useMutation<any, any, any>({
    mutationFn: (data: any) => taskApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setShowCreateModal(false)
      resetForm()
    }
  })

  const updateMutation = useMutation<any, any, any>({
    mutationFn: (data: any) => taskApi.update(editingTask!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setEditingTask(null)
      resetForm()
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => taskApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: number; status: TaskStatus }) =>
      taskApi.updateStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: TaskStatus.TODO,
      priority: 'MEDIUM',
      assigneeId: 0,
      dueDate: '',
      teamId: 0,
      completionPercentage: 0
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.assigneeId) {
      alert('Please fill all required fields')
      return
    }

    const submitData = {
      ...formData,
      assigneeId: parseInt(formData.assigneeId.toString()),
      teamId: formData.teamId ? parseInt(formData.teamId.toString()) : null,
      completionPercentage: parseInt(formData.completionPercentage.toString())
    }

    if (editingTask?.id) {
      updateMutation.mutate(submitData)
    } else {
      createMutation.mutate(submitData)
    }
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      assigneeId: task.assigneeId,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      teamId: task.teamId || 0,
      completionPercentage: task.completionPercentage || 0
    })
    setShowCreateModal(true)
  }

  const handleStatusChange = (task: Task, newStatus: TaskStatus) => {
    updateStatusMutation.mutate({
      taskId: task.id,
      status: newStatus
    })
  }

  const filteredTasks = tasks.filter((task: Task) =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.assigneeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.teamName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const taskStats = {
    todo: filteredTasks.filter((task: Task) => task.status === TaskStatus.TODO).length,
    inProgress: filteredTasks.filter((task: Task) => task.status === TaskStatus.IN_PROGRESS).length,
    inReview: filteredTasks.filter((task: Task) => task.status === TaskStatus.IN_REVIEW).length,
    done: filteredTasks.filter((task: Task) => task.status === TaskStatus.DONE).length,
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Workboard</h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-2xl">Manage your team tasks, track progress, and move work forward from one central board.</p>
            </div>
            <Button onClick={() => {
              resetForm()
              setEditingTask(null)
              setShowCreateModal(true)
            }} className="gap-2">
              <Plus size={16} />
              Create Task
            </Button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-5">
              <p className="text-sm text-gray-500">To Do</p>
              <p className="mt-3 text-3xl font-semibold text-gray-900 dark:text-white">{taskStats.todo}</p>
            </div>
            <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-5">
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="mt-3 text-3xl font-semibold text-gray-900 dark:text-white">{taskStats.inProgress}</p>
            </div>
            <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-5">
              <p className="text-sm text-gray-500">In Review</p>
              <p className="mt-3 text-3xl font-semibold text-gray-900 dark:text-white">{taskStats.inReview}</p>
            </div>
            <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-5">
              <p className="text-sm text-gray-500">Done</p>
              <p className="mt-3 text-3xl font-semibold text-gray-900 dark:text-white">{taskStats.done}</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'ALL')}
          >
            <option value="ALL">All Statuses</option>
            {Object.values(TaskStatus).map(status => (
              <option key={status} value={status}>
                {status.replace(/_/g, ' ')}
              </option>
            ))}
            </Select>
          <Select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value))}
          >
            <option value="ALL">All Teams</option>
            {teams.map((team: Team) => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </Select>
        </div>

        {/* Kanban Board */}
        <TaskKanbanBoard
          tasks={filteredTasks}
          isLoading={tasksLoading}
          onTaskEdit={handleEdit}
          onTaskDelete={(task) => {
            if (confirm(`Delete task "${task.title}"?`)) {
              deleteMutation.mutate(task.id)
            }
          }}
          onTaskStatusChange={handleStatusChange}
          onTaskDetails={(task) => {
            handleEdit(task)
          }}
          showAddButton={true}
          onAddTask={() => setShowCreateModal(true)}
        />

        {/* Create/Edit Task Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md max-h-96 overflow-y-auto">
              <CardHeader className="flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingTask ? 'Edit Task' : 'Create Task'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingTask(null)
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X size={20} />
                </button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Task description"
                      rows={2}
                    />
                  </div>

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
                          {getFullName(emp.firstName, emp.lastName)}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Team
                    </label>
                    <Select
                      value={formData.teamId.toString()}
                      onChange={(e) => setFormData({ ...formData, teamId: parseInt(e.target.value) })}
                    >
                      <option value="0">No Team</option>
                      {teams.map((team: Team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Priority
                    </label>
                    <Select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <Select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                    >
                      {Object.values(TaskStatus).map(status => (
                        <option key={status} value={status}>
                          {status.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Progress: {formData.completionPercentage}%
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

                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="ghost" onClick={() => {
                      setShowCreateModal(false)
                      setEditingTask(null)
                    }} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending} className="flex-1">
                      {editingTask ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

