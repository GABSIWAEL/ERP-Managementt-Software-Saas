import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, Badge, Button, DataTable } from '@components/ui'
import { MainLayout } from '@components/layout'
import { leaveApi, reportingApi } from '@api/index'
import { LeaveRequest } from '@types'
import { formatDate, getFullName } from '@utils/helpers'
import { Calendar, AlertCircle, TrendingUp, Clock } from 'lucide-react'

const LEAVE_TYPES = ['ANNUAL', 'SICK', 'CASUAL', 'MATERNITY', 'PATERNITY', 'UNPAID']
const ANNUAL_LEAVE_DAYS = 20
const SICK_LEAVE_DAYS = 8
const CASUAL_LEAVE_DAYS = 5

export default function LeaveBalanceTrackerPage() {
  const [year] = useState(new Date().getFullYear())

  // Fetch all employee's leave requests for the year
  const { data: leaveData = [], isLoading } = useQuery({
    queryKey: ['employee-leaves', year],
    queryFn: async () => {
      try {
        const response = await leaveApi.getAll?.(0, 500)
        if (Array.isArray(response)) {
          return response
        }
        return response?.content || []
      } catch (error) {
        console.error('Failed to fetch leaves:', error)
        return []
      }
    },
  })

  // Calculate leave balance
  const calculateBalance = (leaveType: string) => {
    const allotted = leaveType === 'ANNUAL' ? ANNUAL_LEAVE_DAYS : 
                     leaveType === 'SICK' ? SICK_LEAVE_DAYS :
                     leaveType === 'CASUAL' ? CASUAL_LEAVE_DAYS : 0

    const taken = leaveData.filter(
      (leave: any) => leave.leaveType === leaveType && leave.status === 'APPROVED'
    ).length

    const pending = leaveData.filter(
      (leave: any) => leave.leaveType === leaveType && leave.status === 'PENDING'
    ).length

    return { allotted, taken, pending, remaining: allotted - taken }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'success'
      case 'PENDING':
        return 'warning'
      case 'REJECTED':
        return 'danger'
      default:
        return 'info'
    }
  }

  const leaveBalances = LEAVE_TYPES.map(type => ({
    type,
    ...calculateBalance(type),
  }))

  const allLeaveRequests = leaveData
    .sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())

  const columns = [
    {
      key: 'leaveType' as const,
      label: 'Leave Type',
      render: (value: string) => (
        <span className="font-medium text-gray-900 dark:text-white">{value}</span>
      ),
    },
    {
      key: 'startDate' as const,
      label: 'Start Date',
      render: (value: string) => formatDate(value),
    },
    {
      key: 'endDate' as const,
      label: 'End Date',
      render: (value: string) => formatDate(value),
    },
    {
      key: 'numberOfDays' as const,
      label: 'Days',
      render: (value: number) => (
        <span className="font-semibold text-gray-900 dark:text-white">{value}</span>
      ),
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: string) => (
        <Badge variant={getStatusColor(value)}>{value}</Badge>
      ),
    },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leave Balance Tracker</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your annual leave balance and usage for {year}</p>
        </div>

        {/* Balance Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {leaveBalances.map((balance) => (
            <Card key={balance.type}>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    {balance.type} Leave
                  </p>
                  <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                    {balance.remaining}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 mb-4">
                    of {balance.allotted} days
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>{balance.taken} taken</span>
                    <span>{balance.pending} pending</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Balance Alert */}
        {leaveBalances.some(b => b.remaining <= 2) && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Low Leave Balance</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                You have limited leave remaining. Plan your time off accordingly.
              </p>
            </div>
          </div>
        )}

        {/* Leave History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Leave History</h2>
              </div>
              <span className="text-sm text-gray-500">{allLeaveRequests.length} requests</span>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading leave history...</div>
            ) : allLeaveRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                <p>No leave requests yet</p>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={allLeaveRequests}
                striped
              />
            )}
          </CardContent>
        </Card>

        {/* Tips Section */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-primary-600" /> Tips
            </h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              ✓ Plan your leave in advance and submit requests at least 2 weeks before
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              ✓ You have {ANNUAL_LEAVE_DAYS} annual leave days per year
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              ✓ Unused leave may not be carried over to the next year (check policy)
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              ✓ Sick leave is for medical emergencies and requires documentation
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

