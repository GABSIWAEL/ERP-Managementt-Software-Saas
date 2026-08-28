import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, Badge } from '@components/ui'
import { MainLayout } from '@components/layout'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Users, TrendingUp, CheckCircle, AlertCircle, Clock, Target } from 'lucide-react'
import { useAuthStore } from '@store/authStore'
import { employeeApi, leaveApi, performanceApi } from '@api/index'
import { formatDate } from '@utils/helpers'

const teamPerformanceData = [
  { name: 'Week 1', completion: 85, quality: 90, productivity: 88 },
  { name: 'Week 2', completion: 88, quality: 92, productivity: 89 },
  { name: 'Week 3', completion: 90, quality: 89, productivity: 91 },
  { name: 'Week 4', completion: 87, quality: 94, productivity: 92 },
]

const taskStatusData = [
  { name: 'Completed', value: 24, fill: '#10b981' },
  { name: 'In Progress', value: 12, fill: '#3b82f6' },
  { name: 'Pending', value: 8, fill: '#f59e0b' },
]

export default function ManagerDashboard() {
  const { user } = useAuthStore()

  // FIXED: Filter team members by manager ID only (not all employees)
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['manager-team', user?.id],
    queryFn: async () => {
      try {
        // Query employees where this user is the manager
        const response = await employeeApi.getAll(0, 50)
        // Filter to only team members (backend should do this, but frontend filtering as fallback)
        const filtered = Array.isArray(response.content) 
          ? response.content.filter((emp: any) => emp.managerId === user?.id)
          : (Array.isArray(response) ? response.filter((emp: any) => emp.managerId === user?.id) : [])
        return filtered
      } catch (error) {
        console.error('Failed to fetch team members:', error)
        return []
      }
    },
    enabled: !!user?.id,
  })

  // FIXED: Filter pending leaves to manager's team only
  const { data: pendingLeaves = [] } = useQuery({
    queryKey: ['manager-pending-leaves', user?.id],
    queryFn: async () => {
      try {
        // Query pending leaves from all employees first
        const response = await leaveApi.getAll(0, 50, 'PENDING')
        // Filter to only leaves from team members
        const allLeaves = Array.isArray(response.content) ? response.content : (Array.isArray(response) ? response : [])
        const teamMemberIds = teamMembers.map((emp: any) => emp.id)
        return allLeaves.filter((leave: any) => teamMemberIds.includes(leave.employeeId))
      } catch (error) {
        console.error('Failed to fetch pending leaves:', error)
        return []
      }
    },
    enabled: !!user?.id && teamMembers.length > 0,
  })

  // FIXED: Filter performances to manager's direct reports only
  const { data: performances = [] } = useQuery({
    queryKey: ['manager-performance', user?.id],
    queryFn: async () => {
      try {
        const response = await performanceApi.getAll(0, 50)
        // Filter to only performance reviews for this manager's team
        const allPerfs = Array.isArray(response.content) ? response.content : (Array.isArray(response) ? response : [])
        const teamMemberIds = teamMembers.map((emp: any) => emp.id)
        return allPerfs.filter((perf: any) => teamMemberIds.includes(perf.employeeId))
      } catch (error) {
        console.error('Failed to fetch performances:', error)
        return []
      }
    },
    enabled: !!user?.id && teamMembers.length > 0,
  })

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manager Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Team performance and approvals overview
            </p>
          </div>
          <Badge className="text-sm px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
            Team Manager
          </Badge>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Team Members */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Team Members</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{teamMembers.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Users className="text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completed Tasks */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Tasks</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">24</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Approvals */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Approvals</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{pendingLeaves.length}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <Clock className="text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Performance Score */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Team Performance</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">4.2/5</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Target className="text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overdue Tasks */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue Tasks</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">2</p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <AlertCircle className="text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team Performance Trends */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Performance Trends</h3>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={teamPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="completion" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="quality" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="productivity" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Task Summary */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Task Status Summary</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {taskStatusData.map((task) => (
                  <div key={task.name} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: task.fill }}></div>
                      <span className="text-gray-600 dark:text-gray-400">{task.name}</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{task.value} tasks</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Leave Approvals */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Leave Requests (Pending Approval)</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingLeaves.slice(0, 5).map((leave: any) => (
                <div key={leave.id} className="flex justify-between items-start pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{leave.employeeName || 'N/A'}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                      {leave.type} • {formatDate(leave.startDate)} to {formatDate(leave.endDate)} ({leave.numberOfDays} days)
                    </p>
                  </div>
                  <Badge status="pending">Needs Action</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
