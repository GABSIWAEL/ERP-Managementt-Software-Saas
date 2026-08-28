import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, Badge } from '@components/ui'
import { MainLayout } from '@components/layout'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, AlertTriangle, TrendingUp, DollarSign, Lock, FileText, Zap } from 'lucide-react'
import { useAuthStore } from '@store/authStore'
import { employeeApi, auditApi } from '@api/index'
import { formatDate } from '@utils/helpers'

// Mock data - replace with real API calls
const attendanceData = [
  { name: 'Mon', present: 45, absent: 5, leave: 10 },
  { name: 'Tue', present: 48, absent: 3, leave: 9 },
  { name: 'Wed', present: 46, absent: 6, leave: 8 },
  { name: 'Thu', present: 50, absent: 2, leave: 8 },
  { name: 'Fri', present: 44, absent: 4, leave: 12 },
]

const systemHealthData = [
  { name: 'Active Users', value: 45 },
  { name: 'Inactive Users', value: 5 },
  { name: 'Suspended Users', value: 2 },
]

const COLORS = ['#0ea5e9', '#ef4444', '#f59e0b']

export default function AdminDashboard() {
  const { user } = useAuthStore()

  // Fetch all system data
  const { data: employees = [] } = useQuery({
    queryKey: ['admin-employees'],
    queryFn: async () => {
      const response = await employeeApi.getAll(0, 100)
      return response.content || response
    },
  })

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: async () => {
      const response = await auditApi.getAll(0, 10)
      return response.content || response
    },
  })

  const totalEmployees = employees.length
  const activeEmployees = employees.filter((e: any) => e.status === 'ACTIVE').length
  const systemHealthScore = ((activeEmployees / totalEmployees) * 100).toFixed(1)

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              System-wide overview and management
            </p>
          </div>
          <Badge className="text-sm px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
            Administrator
          </Badge>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Employees */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalEmployees}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Users className="text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Employees */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Employees</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{activeEmployees}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Health</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{systemHealthScore}%</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Zap className="text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Audits */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Audits</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{auditLogs.length}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <FileText className="text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Critical Issues */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Critical Issues</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">0</p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Attendance */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Attendance</h3>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" stackId="a" fill="#10b981" />
                  <Bar dataKey="absent" stackId="a" fill="#ef4444" />
                  <Bar dataKey="leave" stackId="a" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* System Health Status */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Status Distribution</h3>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={systemHealthData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {systemHealthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Audit Logs */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent System Activity</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {auditLogs.slice(0, 5).map((log: any) => (
                <div key={log.id} className="flex justify-between items-start pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{log.action}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                      {log.performedBy} • {log.entityName}
                    </p>
                  </div>
                  <Badge variant="info">{formatDate(log.timestamp)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
