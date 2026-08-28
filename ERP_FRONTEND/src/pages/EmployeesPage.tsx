import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, Badge, Button, Input } from '@components/ui'
import { MainLayout } from '@components/layout'
import { employeeApi, departmentApi } from '@api/index'
import { formatDate, getFullName } from '@utils/helpers'
import { Edit3, Trash2, Eye, Plus, Filter, AlertCircle } from 'lucide-react'
import { Employee, Department, UserRole } from '@types'
import { useAuthStore } from '@store/authStore'

export default function EmployeesPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN'
  const isManager = user?.role === UserRole.MANAGER
  const [page, setPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [managerDepartmentId, setManagerDepartmentId] = useState<number | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Get current manager's department if user is a manager
  const { data: currentEmployee } = useQuery({
    queryKey: ['currentEmployee'],
    queryFn: async () => {
      if (isManager) {
        try {
          const response = await employeeApi.getProfile()
          setManagerDepartmentId(response.departmentId)
          return response
        } catch (error) {
          console.error('Failed to load manager profile:', error)
          return null
        }
      }
      return null
    },
    enabled: isManager
  })

  // Determine which department to filter by
  const effectiveDepartmentId = isManager && managerDepartmentId ? managerDepartmentId : (selectedDepartment ? parseInt(selectedDepartment) : undefined)

  // For managers, only fetch employees after we have their department ID loaded
  // For admins/HR, fetch immediately
  const shouldFetchEmployees = isManager ? managerDepartmentId !== null : true

  const { data: employees = [], isLoading, refetch } = useQuery({
    queryKey: ['employees', page, effectiveDepartmentId],
    queryFn: async () => {
      const response = await employeeApi.getAll(page, 20, effectiveDepartmentId)
      return response.content || response
    },
    enabled: shouldFetchEmployees  // Only fetch when we have the department ID for managers
  })

  const handleDeleteEmployee = async () => {
    if (!deleteConfirm) return
    
    try {
      setIsDeleting(true)
      await employeeApi.delete(deleteConfirm.id)
      setDeleteConfirm(null)
      refetch()
    } catch (error) {
      console.error('Error deleting employee:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const { data: departmentsData = { content: [] } } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await departmentApi.getAll(0, 100)
      return response
    }
  })

  const departments = Array.isArray(departmentsData) ? departmentsData : (departmentsData.content || [])

  const filteredEmployees = employees.filter((emp: Employee) =>
    getFullName(emp.firstName, emp.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Employees</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your workforce</p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/employees/new')}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            Add Employee
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-64">
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {/* Department filter - hidden for managers (they see their department only) */}
              {!isManager && (
                <select
                  value={selectedDepartment}
                  onChange={(e) => {
                    setSelectedDepartment(e.target.value)
                    setPage(0)
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept: Department) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              )}
              {/* Show manager info for managers */}
              {isManager && managerDepartmentId && (
                <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                    Showing employees from your department only
                  </p>
                </div>
              )}
              <Button variant="secondary" className="flex items-center gap-2">
                <Filter size={18} />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Employees Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Employee</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Department</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Position</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Hire Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      Loading employees...
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No employees found
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee: Employee) => (
                    <tr key={employee.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{getFullName(employee.firstName, employee.lastName)}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{employee.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {employee.departmentName || employee.department?.name || '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {employee.jobPosition || employee.position || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge status={employee.status}>{employee.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {formatDate(employee.hireDate)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/employees/${employee.id}`)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye size={18} className="text-gray-600 dark:text-gray-400" />
                          </button>
                          <button
                            onClick={() => navigate(`/employees/${employee.id}/edit`)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit3 size={18} className="text-gray-600 dark:text-gray-400" />
                          </button>
                          {isAdmin ? (
                            <button
                              onClick={() => setDeleteConfirm({ id: employee.id, name: getFullName(employee.firstName, employee.lastName) })}
                              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={18} className="text-red-600 dark:text-red-400" />
                            </button>
                          ) : (
                            <button
                              disabled
                              className="p-2 cursor-not-allowed opacity-50"
                              title="Only admins can delete employees"
                            >
                              <Trash2 size={18} className="text-gray-400 dark:text-gray-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredEmployees.length} employees
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage(Math.max(0, page - 1))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={filteredEmployees.length < 20}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Delete Employee?</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="danger"
                    onClick={handleDeleteEmployee}
                    isLoading={isDeleting}
                    className="flex-1"
                  >
                    Delete
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

