import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, Button } from '@components/ui'
import { MainLayout } from '@components/layout'
import { ArrowLeft, Edit2, Trash2, Mail, Phone, Calendar, Briefcase, Building2 } from 'lucide-react'
import { employeeApi } from '@api/index'
import { ConditionalRole } from '@components/RoleGuard'
import { UserRole } from '@types'
import { useAuthStore } from '@store/authStore'
import { formatDate } from '@utils/helpers'

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // SECURITY FIX: Employees can only view their own profile
  if (user?.role === UserRole.EMPLOYEE && user?.id !== parseInt(id!)) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400 mb-4">You can only view your own profile</p>
          <Link to="/profile" className="text-blue-600 hover:underline">
            Go to Your Profile
          </Link>
        </div>
      </MainLayout>
    )
  }

  const { data: employee, isLoading, error } = useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      const response = await employeeApi.getById(parseInt(id!))
      return response.data || response
    },
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600 dark:text-gray-400">Loading employee details...</p>
        </div>
      </MainLayout>
    )
  }

  if (error || !employee) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400 mb-4">Failed to load employee</p>
          <Link to="/employees" className="text-blue-600 hover:underline">
            Back to Employees
          </Link>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {employee.firstName} {employee.lastName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{employee.email}</p>
            </div>
          </div>

          <ConditionalRole roles={[UserRole.ADMIN, UserRole.HR]}>
            <div className="flex gap-2">
              <Link
                to={`/employees/${id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Edit2 size={18} />
                Edit
              </Link>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </ConditionalRole>
        </div>

        {/* Main Info Card */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Personal Information</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                <p className="text-lg text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                  <Mail size={18} />
                  {employee.email}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone</label>
                <p className="text-lg text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                  <Phone size={18} />
                  {employee.phone || 'N/A'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Date of Birth</label>
                <p className="text-lg text-gray-900 dark:text-white mt-1">
                  {employee.dateOfBirth ? formatDate(employee.dateOfBirth) : 'N/A'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Hire Date</label>
                <p className="text-lg text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                  <Calendar size={18} />
                  {formatDate(employee.hireDate)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employment Info Card */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Employment Details</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Department</label>
                <p className="text-lg text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                  <Building2 size={18} />
                  {employee.departmentName || 'N/A'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Employment Type</label>
                <p className="text-lg text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                  <Briefcase size={18} />
                  {employee.employmentType}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Salary</label>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400 mt-1">
                  ${employee.salary?.toLocaleString()}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
                <div className="mt-1">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      employee.status === 'ACTIVE'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}
                  >
                    {employee.status}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions Card - HR Only */}
        <ConditionalRole roles={[UserRole.ADMIN, UserRole.HR, UserRole.MANAGER]}>
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-white">View Attendance</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Check attendance records</p>
                </button>

                <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-white">View Leaves</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Leave requests & balance</p>
                </button>

                <ConditionalRole roles={[UserRole.ADMIN, UserRole.HR]}>
                  <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
                    <h3 className="font-semibold text-gray-900 dark:text-white">View Payroll</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Salary & deductions</p>
                  </button>
                </ConditionalRole>
              </div>
            </CardContent>
          </Card>
        </ConditionalRole>
      </div>
    </MainLayout>
  )
}

