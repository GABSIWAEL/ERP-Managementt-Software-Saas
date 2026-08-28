import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, Badge } from '@components/ui'
import { MainLayout } from '@components/layout'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, Users2, Leaf, Clock, Calendar, TrendingUp, DollarSign, Package } from 'lucide-react'
import { useAuthStore } from '@store/authStore'
import { ConditionalRole } from '@components/RoleGuard'
import { UserRole, AssetStatus, type Asset } from '@types'
import { employeeApi, eventApi, leaveApi, assetApi } from '@api/index'
import { formatDate } from '@utils/helpers'

const attendanceData = [
  { name: 'Mon', present: 45, absent: 5, leave: 10 },
  { name: 'Tue', present: 48, absent: 3, leave: 9 },
  { name: 'Wed', present: 46, absent: 6, leave: 8 },
  { name: 'Thu', present: 50, absent: 2, leave: 8 },
  { name: 'Fri', present: 44, absent: 4, leave: 12 },
]

const payrollData = [
  { name: 'Salary', value: 70 },
  { name: 'Bonus', value: 15 },
  { name: 'Allowance', value: 10 },
  { name: 'Deduction', value: 5 },
]

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444']

export default function DashboardPage() {
  const { user } = useAuthStore()
  
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await employeeApi.getAll(0, 10)
      return response.content || response
    },
    enabled: [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER].includes(user?.role!)
  })

  const { data: events = [] } = useQuery({
    queryKey: ['upcoming-events'],
    queryFn: async () => {
      const response = await eventApi.getUpcoming(30)
      return response
    },
    enabled: [UserRole.ADMIN, UserRole.HR].includes(user?.role!)
  })

  const { data: leaves = [] } = useQuery({
    queryKey: ['pending-leaves'],
    queryFn: async () => {
      const response = await leaveApi.getAll(0, 10, 'PENDING')
      return response.content || response
    },
    enabled: [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER].includes(user?.role!)
  })

  const { data: assets = [] } = useQuery({
    queryKey: ['my-assets', user?.employeeId],
    queryFn: async () => {
      const response = await assetApi.getAll(0, 100)
      const allAssets = Array.isArray(response) ? response : response.content || []
      return allAssets.filter((asset: any) => asset.assignedToId === user?.employeeId && asset.status === AssetStatus.ASSIGNED)
    },
    enabled: user?.role === UserRole.EMPLOYEE && !!user?.employeeId,
  })

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header with Role Info */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Welcome back! Here's what's happening in your system.
            </p>
          </div>
          {user && (
            <Badge className="text-sm px-3 py-1">
              {user.role === 'ADMIN' && 'Administrator'}
              {user.role === 'HR' && 'HR Manager'}
              {user.role === 'MANAGER' && 'Team Manager'}
              {user.role === 'ACCOUNTANT' && 'Accountant'}
              {user.role === 'EMPLOYEE' && 'Employee'}
            </Badge>
          )}
        </div>

        {/* ADMIN & HR Dashboard */}
        <ConditionalRole roles={[UserRole.ADMIN, UserRole.HR]}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Employee Stats */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Employees</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {employees.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Users className="text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attendance */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Present Today</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">45</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Users2 className="text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leaves */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Leaves</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{leaves.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                    <Leaf className="text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requests */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Requests</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">12</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <Clock className="text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Events */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming Events</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{events.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Calendar className="text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts for HR & ADMIN */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attendance Chart */}
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

            {/* Payroll Distribution */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payroll Distribution</h3>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={payrollData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {payrollData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Events</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.slice(0, 5).map((event: any) => (
                    <div key={event.id} className="flex justify-between items-start pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{event.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{formatDate(event.eventDate)}</p>
                      </div>
                      <Badge variant="info">{event.type}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pending Leaves */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Leaves</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaves.slice(0, 5).map((leave: any) => (
                    <div key={leave.id} className="flex justify-between items-start pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{leave.employeeName || 'N/A'}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{leave.type}</p>
                      </div>
                      <Badge status={leave.status}>{leave.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </ConditionalRole>

        {/* MANAGER Dashboard */}
        <ConditionalRole roles={[UserRole.MANAGER]}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Team Members</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">12</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Users className="text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Present Today</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">10</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Users2 className="text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Leaves</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">3</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                    <Leaf className="text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Team Performance</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">4.2/5</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Manager-specific charts */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Attendance This Week</h3>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </ConditionalRole>

        {/* ACCOUNTANT Dashboard */}
        <ConditionalRole roles={[UserRole.ACCOUNTANT]}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Payrolls</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">45</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <DollarSign className="text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Locks</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">8</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <Clock className="text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Total</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">$125K</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Accounting Parameters Overview</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tax Percentage</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">12.5%</p>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Insurance Percentage</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">8.0%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </ConditionalRole>

        {/* EMPLOYEE Dashboard */}
        <ConditionalRole roles={[UserRole.EMPLOYEE]}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Leave Balance</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">12</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                    <Leaf className="text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Attendance Rate</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">96%</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Users2 className="text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">My Assets</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{assets.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Package className="text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assets Section */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Assigned Assets</h3>
              </CardHeader>
              <CardContent>
                {assets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="mx-auto mb-2 opacity-50" size={32} />
                    <p>No assets assigned yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assets.slice(0, 5).map((asset: any) => (
                      <div key={asset.id} className="flex justify-between items-start pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{asset.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Code: {asset.assetCode}</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">{asset.status}</Badge>
                      </div>
                    ))}
                    {assets.length > 5 && (
                      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-3">
                        + {assets.length - 5} more assets
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Profile Section */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Profile</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Employee ID</span>
                    <span className="font-medium text-gray-900 dark:text-white">EMP001</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Department</span>
                    <span className="font-medium text-gray-900 dark:text-white">Engineering</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Hire Date</span>
                    <span className="font-medium text-gray-900 dark:text-white">Jan 15, 2024</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Status</span>
                    <Badge variant="success">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ConditionalRole>
      </div>
    </MainLayout>
  )
}

