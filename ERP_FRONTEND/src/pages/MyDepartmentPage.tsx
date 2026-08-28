import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, Badge, Button, Input } from '@components/ui'
import { MainLayout } from '@components/layout'
import { employeeApi, teamApi, taskApi } from '@api/index'
import { getFullName } from '@utils/helpers'
import { Users, Building2, Plus } from 'lucide-react'
import { Employee, Team, Task, UserRole } from '@types'
import { useAuthStore } from '@store/authStore'

export default function MyDepartmentPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')

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
  const isManager = user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN

  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['departmentEmployees', currentEmployeeDepartmentId],
    queryFn: async () => {
      if (!currentEmployeeDepartmentId) return []
      const response = await employeeApi.getAll(0, 50, currentEmployeeDepartmentId)
      return response.content || response
    },
    enabled: !!currentEmployeeDepartmentId
  })

  const { data: teams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ['departmentTeams', currentEmployeeDepartmentId],
    queryFn: async () => {
      if (!currentEmployeeDepartmentId) return []
      const response = await teamApi.getByDepartment(currentEmployeeDepartmentId, 0, 50)
      return response.content || response
    },
    enabled: !!currentEmployeeDepartmentId
  })

  const { data: myTasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['myTasks', currentEmployeeData?.id],
    queryFn: async () => {
      if (!currentEmployeeData?.id) return []
      const response = await taskApi.getByAssignee(currentEmployeeData.id, 0, 50)
      return response.content || response
    },
    enabled: !!currentEmployeeData?.id
  })

  const filteredEmployees = employees.filter((emp: Employee) =>
    getFullName(emp.firstName, emp.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const departmentName = currentEmployeeData?.departmentName || currentEmployeeData?.department?.name || 'My Department'

  const taskStats = {
    todo: myTasks.filter((t: Task) => t.status === 'TODO').length,
    inProgress: myTasks.filter((t: Task) => t.status === 'IN_PROGRESS').length,
    completed: myTasks.filter((t: Task) => t.status === 'DONE').length
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Building2 size={24} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Department</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{departmentName}</p>
            </div>
          </div>
          {isManager && (
            <Button onClick={() => navigate('/teams')} className="gap-2">
              <Users size={16} />
              Manage Teams
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Members Column */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Team Members ({filteredEmployees.length})
            </h2>

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
                  <Card key={emp.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <p className="font-medium text-gray-900">{getFullName(emp.firstName, emp.lastName)}</p>
                      <p className="text-xs text-gray-600">{emp.position || 'N/A'}</p>
                      <p className="text-xs text-gray-500 truncate mt-1">{emp.email}</p>
                      <div className="flex items-center justify-between pt-2">
                        <Badge variant={emp.status === 'ACTIVE' ? 'success' : 'secondary'}>
                          {emp.status}
                        </Badge>
                        <button
                          onClick={() => navigate(`/employees/${emp.id}`)}
                          className="text-xs text-primary-600 hover:underline"
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

          {/* Teams Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Teams ({teams.length})</h2>
              {isManager && (
                <button onClick={() => navigate('/teams')} className="text-primary-600">
                  <Plus size={18} />
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {teamsLoading ? (
                <div className="text-center text-gray-500">Loading...</div>
              ) : teams.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-gray-500 text-sm">No teams yet</CardContent>
                </Card>
              ) : (
                teams.map((team: Team) => (
                  <Card key={team.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <h3 className="font-medium text-gray-900">{team.name}</h3>
                      {team.description && (
                        <p className="text-xs text-gray-600 line-clamp-2 mt-1">{team.description}</p>
                      )}
                      <div className="flex items-center gap-2 pt-2 text-xs text-gray-600">
                        <Users size={14} />
                        <span>{team.memberCount || 0} members</span>
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
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Tasks ({myTasks.length})</h2>
              {isManager && (
                <button onClick={() => navigate('/tasks')} className="text-primary-600">
                  <Plus size={18} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Card className="bg-blue-50">
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{taskStats.todo}</div>
                  <p className="text-xs text-gray-600 mt-1">To Do</p>
                </CardContent>
              </Card>
              <Card className="bg-amber-50">
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold text-amber-600">{taskStats.inProgress}</div>
                  <p className="text-xs text-gray-600 mt-1">In Progress</p>
                </CardContent>
              </Card>
              <Card className="bg-green-50 col-span-2">
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
                  <p className="text-xs text-gray-600 mt-1">Completed</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3 max-h-56 overflow-y-auto">
              {tasksLoading ? (
                <div className="text-center text-gray-500 text-sm">Loading...</div>
              ) : myTasks.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-gray-500 text-sm">No tasks assigned</CardContent>
                </Card>
              ) : (
                myTasks.slice(0, 5).map((task: Task) => (
                  <Card key={task.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">{task.title}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={task.priority === 'HIGH' ? 'danger' : 'secondary'}>
                          {task.priority}
                        </Badge>
                        <Badge variant={task.status === 'DONE' ? 'success' : 'warning'}>
                          {task.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
              {myTasks.length > 5 && (
                <Button variant="outline" size="sm" onClick={() => navigate('/tasks')} className="w-full">
                  View All
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

