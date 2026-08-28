import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, Badge, Input, DataTable } from '@components/ui'
import { MainLayout } from '@components/layout'
import { attendanceApi, employeeApi } from '@api/index'
import { Attendance, Employee, WorkMode, AttendanceStatus, UserRole } from '@types'
import { formatDate, formatTime, getFullName } from '@utils/helpers'
import { useAuthStore } from '@store/authStore'
import { Clock, AlertCircle } from 'lucide-react'

export default function AttendancePage() {
  const { user } = useAuthStore()
  const [page, setPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')

  // Get team members for manager
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members-for-attendance', user?.id],
    queryFn: async () => {
      if (user?.role === UserRole.MANAGER) {
        const response = await employeeApi.getAll(0, 100)
        const members = (response.content || response).filter((emp: any) => emp.managerId === user?.id)
        return members.map((m: any) => m.id)
      }
      return []
    },
    enabled: !!user && user.role === UserRole.MANAGER
  })

  // Fetch attendance records
  const { data: attendanceData = { content: [] }, isLoading } = useQuery({
    queryKey: ['attendance', page],
    queryFn: async () => {
      const response = await attendanceApi.getAll(page, 20)
      return response
    }
  })

  // Fetch employees
  const { data: employees = [] } = useQuery({
    queryKey: ['employees-for-attendance'],
    queryFn: async () => {
      const response = await employeeApi.getAll(0, 100)
      return response.content || response
    }
  })

  const getAttendanceEmployeeName = (att: Attendance) => {
    if (att.employeeName) return att.employeeName
    if (att.employee?.firstName || att.employee?.lastName) {
      return getFullName(att.employee?.firstName, att.employee?.lastName)
    }

    const match = employees.find((emp: Employee) => emp.id === att.employeeId)
    return match ? getFullName(match.firstName, match.lastName) : ''
  }

  const filteredAttendance = (attendanceData.content || []).filter((att: Attendance) => {
    // For managers, only show attendance of their team members
    const attendanceName = getAttendanceEmployeeName(att).toLowerCase()
    const attendanceMatches = attendanceName.includes(searchTerm.toLowerCase())
    const attendanceEmployeeId = att.employee?.id ?? att.employeeId
    
    if (user?.role === UserRole.MANAGER && teamMembers.length > 0) {
      return attendanceMatches && teamMembers.includes(attendanceEmployeeId)
    }
    
    return attendanceMatches
  }) || []

  const columns = [
    {
      key: 'employee' as const,
      label: 'Employee',
      render: (_value: Employee, item: Attendance) => getAttendanceEmployeeName(item) || '-'
    },
    {
      key: 'attendanceDate' as const,
      label: 'Date',
      render: (_value: string, item: Attendance) => formatDate((item as Attendance).attendanceDate || (item as Attendance).date || '')
    },
    {
      key: 'checkInTime' as const,
      label: 'Check In',
      render: (value: string) => value ? formatTime(value) : '-'
    },
    {
      key: 'checkOutTime' as const,
      label: 'Check Out',
      render: (value: string) => value ? formatTime(value) : '-'
    },
    {
      key: 'workMode' as const,
      label: 'Work Mode',
      render: (value: WorkMode) => <Badge variant="info">{value || '-'}</Badge>
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: AttendanceStatus) => <Badge status={value}>{value}</Badge>
    },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Attendance Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">View attendance records generated automatically by company devices</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Present Today</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {filteredAttendance.filter((a: Attendance) => a.status === 'PRESENT').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Clock className="text-green-600 dark:text-green-400" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Absent</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {filteredAttendance.filter((a: Attendance) => a.status === 'ABSENT').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <AlertCircle className="text-red-600 dark:text-red-400" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">On Leave</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {filteredAttendance.filter((a: Attendance) => a.status === 'ON_LEAVE').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  <Clock className="text-yellow-600 dark:text-yellow-400" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Input
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Attendance Table */}
        <DataTable
          columns={columns}
          data={filteredAttendance}
          isLoading={isLoading}
          page={page}
          pageSize={20}
          onPageChange={setPage}
          emptyMessage="No attendance records found"
        />
      </div>

    </MainLayout>
  )
}

