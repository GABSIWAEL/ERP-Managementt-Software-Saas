import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, Button, Input, Select } from '@components/ui'
import { MainLayout } from '@components/layout'
import { payrollApi, attendanceApi, leaveApi, performanceApi } from '@api/index'
import { formatCurrency, formatDate } from '@utils/helpers'
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Download, Filter } from 'lucide-react'

export default function ReportsPage() {
  const [reportType, setReportType] = useState('payroll')
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])

  // Fetch payroll reports
  const { data: payrollReportData } = useQuery({
    queryKey: ['reports-payroll', startDate, endDate],
    queryFn: async () => {
      const response = await payrollApi.getReport({
        startDate,
        endDate
      })
      return response
    },
    enabled: reportType === 'payroll'
  })

  // Fetch attendance reports
  const { data: attendanceReportData } = useQuery({
    queryKey: ['reports-attendance', startDate, endDate],
    queryFn: async () => {
      const response = await attendanceApi.getReport({
        startDate,
        endDate
      })
      return response
    },
    enabled: reportType === 'attendance'
  })

  // Fetch leave reports
  const { data: leaveReportData } = useQuery({
    queryKey: ['reports-leave', startDate, endDate],
    queryFn: async () => {
      const response = await leaveApi.getReport({
        startDate,
        endDate
      })
      return response
    },
    enabled: reportType === 'leave'
  })

  // Fetch performance reports
  const { data: performanceReportData } = useQuery({
    queryKey: ['reports-performance'],
    queryFn: async () => {
      const response = await performanceApi.getReport()
      return response
    },
    enabled: reportType === 'performance'
  })

  const payrollData = payrollReportData?.data || { totalPayroll: 0, employeeCount: 0, departmentBreakdown: [] }
  const attendanceData = attendanceReportData?.data || { presentDays: 0, absentDays: 0, leaveDays: 0, attendance: [] }
  const leaveData = leaveReportData?.data || { totalRequests: 0, approved: 0, rejected: 0, pending: 0, byType: [] }
  const performanceData = performanceReportData?.data || { averageRating: 0, topPerformers: [], ratings: [] }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View comprehensive analytics and reports</p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              label="Report Type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              options={[
                { value: 'payroll', label: 'Payroll Report' },
                { value: 'attendance', label: 'Attendance Report' },
                { value: 'leave', label: 'Leave Report' },
                { value: 'performance', label: 'Performance Report' },
              ]}
            />
            {reportType !== 'performance' && (
              <>
                <Input
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <Input
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </>
            )}
            <div className="flex items-end">
              <Button variant="secondary" className="flex items-center gap-2 w-full justify-center">
                <Download size={16} />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Payroll Report */}
        {reportType === 'payroll' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Payroll</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {formatCurrency(payrollData.totalPayroll)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Employees</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{payrollData.employeeCount}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Salary</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {formatCurrency((payrollData.totalPayroll || 0) / (payrollData.employeeCount || 1))}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payroll by Department */}
            {payrollData.departmentBreakdown && payrollData.departmentBreakdown.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Payroll by Department</h3>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={payrollData.departmentBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Bar dataKey="payroll" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Attendance Report */}
        {reportType === 'attendance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Present</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{attendanceData.presentDays}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Absent</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{attendanceData.absentDays}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">On Leave</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{attendanceData.leaveDays}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Attendance Rate</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                      {attendanceData.presentDays && attendanceData.absentDays
                        ? Math.round((attendanceData.presentDays / (attendanceData.presentDays + attendanceData.absentDays)) * 100)
                        : 0}%
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Attendance Chart */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-gray-900 dark:text-white">Attendance Distribution</h3>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Present', value: attendanceData.presentDays },
                        { name: 'Absent', value: attendanceData.absentDays },
                        { name: 'On Leave', value: attendanceData.leaveDays }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {['Present', 'Absent', 'On Leave'].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Leave Report */}
        {reportType === 'leave' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Requests</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{leaveData.totalRequests}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{leaveData.approved}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{leaveData.pending}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{leaveData.rejected}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Leave Breakdown */}
            {leaveData.byType && leaveData.byType.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Leaves by Type</h3>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={leaveData.byType}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Performance Report */}
        {reportType === 'performance' && (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {performanceData.averageRating?.toFixed(1)} / 5.0
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Top Performers */}
            {performanceData.topPerformers && performanceData.topPerformers.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Top Performers</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {performanceData.topPerformers.map((performer: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="font-medium text-gray-900 dark:text-white">{performer.name}</span>
                        <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">{performer.rating} ⭐</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rating Distribution */}
            {performanceData.ratings && performanceData.ratings.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Rating Distribution</h3>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceData.ratings}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      <XAxis dataKey="rating" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
