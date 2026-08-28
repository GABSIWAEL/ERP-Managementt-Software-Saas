import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, Badge } from '@components/ui'
import { MainLayout } from '@components/layout'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Leaf, Clock, Home, Calendar, Target, TrendingUp } from 'lucide-react'
import { useAuthStore } from '@store/authStore'
import { employeeApi, leaveApi, attendanceApi, taskApi } from '@api/index'
import { formatDate } from '@utils/helpers'

const attendanceTrend = [
  { week: 'Week 1', attendance: 95 },
  { week: 'Week 2', attendance: 98 },
  { week: 'Week 3', attendance: 92 },
  { week: 'Week 4', attendance: 97 },
]

const leaveData = [
  { month: 'Jan', used: 2, available: 20 },
  { month: 'Feb', used: 1, available: 20 },
  { month: 'Mar', used: 3, available: 20 },
  { month: 'Apr', used: 2, available: 20 },
  { month: 'May', used: 0, available: 20 },
  { month: 'Jun', used: 1, available: 20 },
]

export default function EmployeeDashboard() {
  const { user } = useAuthStore()

  const { data: employee } = useQuery({
    queryKey: ['employee-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null
      const response = await employeeApi.getById(user.id)
      return response.data || response
    },
    enabled: !!user?.id,
  })

  const { data: myLeaves = [] } = useQuery({
    queryKey: ['my-leaves'],
    queryFn: async () => {
      const response = await leaveApi.getAll(0, 50)
      return response.content || response
    },
  })

  const { data: myAttendance = [] } = useQuery({
    queryKey: ['my-attendance'],
    queryFn: async () => {
      const response = await attendanceApi.getAll(0, 50)
      return response.content || response
    },
  })

  const { data: myTasks = [] } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: async () => {
      const response = await tasksApi.getAll(0, 50)
      return response.content || response
    },
  })

  const leaveBalance = 12
  const attendanceRate = 96
  const completedTasks = myTasks.filter((t: any) => t.status === 'COMPLETED').length
  const remoteWorkRequests = 3

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Welcome back! Here's your personal overview.
            </p>
          </div>
          <Badge className="text-sm px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
            Employee
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Leave Balance */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Leave Balance</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{leaveBalance} days</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  <Leaf className="text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Rate */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Attendance Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{attendanceRate}%</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Clock className="text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completed Tasks */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tasks Completed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{completedTasks}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Target className="text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Remote Work Requests */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Remote Days (Month)</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{remoteWorkRequests}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Home className="text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Trend */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Attendance Trend (Last 4 Weeks)</h3>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="attendance" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Leave Balance Trend */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Leave Balance (Current Year)</h3>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={leaveData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="used" stackId="a" fill="#ef4444" />
                  <Bar dataKey="available" stackId="a" fill="#d1d5db" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* My Upcoming Leave Requests */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Leave Requests</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myLeaves.slice(0, 5).map((leave: any) => (
                <div key={leave.id} className="flex justify-between items-start pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{leave.type}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                      {formatDate(leave.startDate)} to {formatDate(leave.endDate)}
                    </p>
                  </div>
                  <Badge status={leave.status}>{leave.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Personal Profile Info */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Profile Information</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Employee ID</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">{employee?.employeeId || 'N/A'}</p>
              </div>
              <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Department</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">{employee?.department?.name || 'N/A'}</p>
              </div>
              <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Job Position</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">{employee?.jobPosition || 'N/A'}</p>
              </div>
              <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Hire Date</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">{formatDate(employee?.hireDate) || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
