import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, Badge } from '@components/ui'
import { MainLayout } from '@components/layout'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Users, Briefcase, Leaf, AlertCircle, TrendingUp, Calendar } from 'lucide-react'
import { useAuthStore } from '@store/authStore'
import { employeeApi, leaveApi } from '@api/index'
import { formatDate } from '@utils/helpers'

const recruitmentData = [
  { name: 'Jan', applications: 12, interviews: 8, offers: 3 },
  { name: 'Feb', applications: 15, interviews: 10, offers: 4 },
  { name: 'Mar', applications: 18, interviews: 12, offers: 5 },
  { name: 'Apr', applications: 14, interviews: 9, offers: 3 },
  { name: 'May', applications: 20, interviews: 14, offers: 6 },
  { name: 'Jun', applications: 16, interviews: 11, offers: 4 },
]

export default function HRDashboard() {
  const { user } = useAuthStore()

  const { data: employees = [] } = useQuery({
    queryKey: ['hr-employees'],
    queryFn: async () => {
      const response = await employeeApi.getAll(0, 100)
      return response.content || response
    },
  })

  const { data: leaves = [] } = useQuery({
    queryKey: ['hr-pending-leaves'],
    queryFn: async () => {
      const response = await leaveApi.getAll(0, 100, 'PENDING')
      return response.content || response
    },
  })

  const totalEmployees = employees.length
  const newEmployeesThisMonth = employees.filter((e: any) => {
    const hireDate = new Date(e.hireDate)
    const now = new Date()
    return hireDate.getMonth() === now.getMonth() && hireDate.getFullYear() === now.getFullYear()
  }).length
  const pendingLeaves = leaves.length

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">HR Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Human resources and recruitment overview
            </p>
          </div>
          <Badge className="text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
            HR Manager
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

          {/* New Hires This Month */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New Hires (Month)</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{newEmployeesThisMonth}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Leaves */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Leaves</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{pendingLeaves}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  <Leaf className="text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Open Positions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Open Positions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">5</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Briefcase className="text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Approvals */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approvals Needed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">8</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <AlertCircle className="text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recruitment Trend */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recruitment Trend (6 Months)</h3>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={recruitmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="interviews" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="offers" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Leave Types Distribution */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Leave Types Distribution</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Annual Leave</span>
                  <span className="font-medium text-gray-900 dark:text-white">42 requests</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Sick Leave</span>
                  <span className="font-medium text-gray-900 dark:text-white">18 requests</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Personal Leave</span>
                  <span className="font-medium text-gray-900 dark:text-white">8 requests</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Maternity/Paternity</span>
                  <span className="font-medium text-gray-900 dark:text-white">2 requests</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Leaves to Approve */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Leave Approvals</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaves.slice(0, 5).map((leave: any) => (
                <div key={leave.id} className="flex justify-between items-start pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{leave.employeeName || 'N/A'}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{leave.type} • {formatDate(leave.startDate)} to {formatDate(leave.endDate)}</p>
                  </div>
                  <Badge status="pending">Pending</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
