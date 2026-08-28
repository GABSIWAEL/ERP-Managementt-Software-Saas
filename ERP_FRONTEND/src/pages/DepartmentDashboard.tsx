import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, Badge, Button, Input } from '@components/ui'
import { MainLayout } from '@components/layout'
import { employeeApi, teamApi, taskApi } from '@api/index'
import { getFullName } from '@utils/helpers'
import { Users, Building2, Plus, ChevronRight } from 'lucide-react'
import { Employee, Team, Task, UserRole } from '@types'
import { useAuthStore } from '@store/authStore'

export default function DepartmentDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')

  // Get current employee profile
  const { data: currentEmployeeData } = useQuery({
    queryKey: ['currentEmployee'],
    queryFn: async () => {
      try {
        return await employeeApi.getProfile()
      } catch {
        return null
      }
    }
  })

  const currentEmployeeDepartmentId = currentEmployeeData?.departmentId ?? currentEmployeeData?.department?.id
  const currentEmployeeId = currentEmployeeData?.id
  const isManager = user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN
  const isAdmin = user?.role === UserRole.ADMIN

  // Fetch department employees
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['departmentEmployees', currentEmployeeDepartmentId],
    queryFn: async () => {
      if (!currentEmployeeDepartmentId) return []
      const response = await employeeApi.getAll(0, 50, currentEmployeeDepartmentId)
      return response.content || response
    },
    enabled: !!currentEmployeeDepartmentId
  })

  // Fetch department teams
  const { data: allTeams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ['departmentTeams', currentEmployeeDepartmentId],
    queryFn: async () => {
      if (!currentEmployeeDepartmentId) return []
      const response = await teamApi.getByDepartment(currentEmployeeDepartmentId, 0, 50)
      return response.content || response
    },
    enabled: !!currentEmployeeDepartmentId
  })

  // Filter teams based on role
  // Managers see only teams they manage; Admins see all; Employees see teams they're in
  const myTeams = allTeams.filter((team: Team) => {
    if (isAdmin) return true // Admin sees all
    if (isManager) return team.managerId === currentEmployeeId // Manager sees own teams
    return false // Regular employees see no teams on dashboard
  })

  // Fetch current employee's tasks
  const { data: myTasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['myCurrentTasks', currentEmployeeId],
    queryFn: async () => {
      if (!currentEmployeeId) return []
      const response = await taskApi.getByAssignee(currentEmployeeId, 0, 50)
      return response.content || response
    },
    enabled: !!currentEmployeeId
  })

  const filteredEmployees = employees.filter((emp: Employee) =>
    getFullName(emp.firstName, emp.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const departmentName = currentEmployeeData?.departmentName || currentEmployeeData?.department?.name || 'Department'

  const taskStats = {
    todo: myTasks.filter((t: Task) => t.status === 'TODO').length,
    inProgress: myTasks.filter((t: Task) => t.status === 'IN_PROGRESS').length,
    completed: myTasks.filter((t: Task) => t.status === 'DONE').length
  }

  // Breadcrumbs
  const breadcrumbs = [
    { label: 'Dashboard', active: true }
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          {breadcrumbs.map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-2">
              {idx > 0 && <ChevronRight size={14} />}
              <span className={crumb.active ? 'text-gray-900 dark:text-white font-medium' : ''}>
                {crumb.label}
              </span>
            </div>
          ))}
        </div>

        {/* Header with role badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Building2 size={24} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Department</h1>
                {isManager && (
                  <Badge variant={isAdmin ? 'danger' : 'warning'}>
                    {isAdmin ? 'Admin' : 'Manager'}
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{departmentName}</p>
            </div>
          </div>
          <Button onClick={() => navigate('/teams')} className="gap-2">
            <Users size={16} />
            Manage Teams
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{employees.length}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Department Members</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{myTeams.length}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {isManager ? 'Teams I Manage' : 'Teams'}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{myTasks.length}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">My Tasks</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {taskStats.completed}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Completed Today</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Members Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Team Members ({filteredEmployees.length})
              </h2>
              <button
                onClick={() => navigate('/members')}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View All
              </button>
            </div>

            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="sm"
            />

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {employeesLoading ? (
                <div className="text-center text-gray-500">Loading...</div>
              ) : filteredEmployees.length === 0 ? (
                <div className="text-center text-gray-500">No members found</div>
              ) : (
                filteredEmployees.map((emp: Employee) => (
                  <Card key={emp.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="pt-4">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {getFullName(emp.firstName, emp.lastName)}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{emp.position || 'N/A'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 truncate mt-1">{emp.email}</p>
                      <div className="flex items-center justify-between pt-2">
                        <Badge variant={emp.status === 'ACTIVE' ? 'success' : 'secondary'}>
                          {emp.status}
                        </Badge>
                        <button
                          onClick={() => navigate(`/employees/${emp.id}`)}
                          className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                        >
                          View
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Teams Column - MANAGER ONLY */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isManager ? 'Teams I Manage' : 'Teams'} ({myTeams.length})
              </h2>
              {isManager && (
                <button
                  onClick={() => navigate('/teams')}
                  className="text-primary-600 hover:text-primary-700"
                >
                  <Plus size={18} />
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {teamsLoading ? (
                <div className="text-center text-gray-500">Loading...</div>
              ) : myTeams.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-gray-500 text-sm">
                    {isManager ? 'No teams yet. Create one to get started!' : 'You are not managing any teams'}
                  </CardContent>
                </Card>
              ) : (
                myTeams.map((team: Team) => (
                  <Card
                    key={team.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate('/teams')}
                  >
                    <CardContent className="pt-4">
                      <h3 className="font-medium text-gray-900 dark:text-white">{team.name}</h3>
                      {team.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                          {team.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-2 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Users size={14} />
                          <span>{team.memberCount || 0} members</span>
                        </div>
                        <ChevronRight size={14} className="text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Tasks Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                My Tasks ({myTasks.length})
              </h2>
              <button
                onClick={() => navigate('/tasks')}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View All
              </button>
            </div>

            {/* Task Stats */}
            <div className="grid grid-cols-2 gap-2">
              <Card className="bg-blue-50 dark:bg-blue-900/20">
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{taskStats.todo}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">To Do</p>
                </CardContent>
              </Card>
              <Card className="bg-amber-50 dark:bg-amber-900/20">
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{taskStats.inProgress}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">In Progress</p>
                </CardContent>
              </Card>
              <Card className="bg-green-50 dark:bg-green-900/20 col-span-2">
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{taskStats.completed}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Completed</p>
                </CardContent>
              </Card>
            </div>

            {/* Task List */}
            <div className="space-y-3 max-h-56 overflow-y-auto">
              {tasksLoading ? (
                <div className="text-center text-gray-500 text-sm">Loading...</div>
              ) : myTasks.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-gray-500 text-sm">
                    No tasks assigned
                  </CardContent>
                </Card>
              ) : (
                myTasks.slice(0, 5).map((task: Task) => (
                  <Card
                    key={task.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate('/tasks')}
                  >
                    <CardContent className="pt-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant={task.priority === 'HIGH' ? 'danger' : 'secondary'} size="sm">
                          {task.priority}
                        </Badge>
                        <Badge variant={task.status === 'DONE' ? 'success' : 'warning'} size="sm">
                          {task.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
              {myTasks.length > 5 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/tasks')}
                  className="w-full"
                >
                  View All {myTasks.length} Tasks
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

