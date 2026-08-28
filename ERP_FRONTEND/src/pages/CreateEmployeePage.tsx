import { useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@components/ui'
import { MainLayout } from '@components/layout'
import { ArrowLeft, Save, X, CheckCircle, Mail } from 'lucide-react'
import { employeeApi, departmentApi } from '@api/index'

interface NewEmployeeFormData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: string
  departmentId?: number
  salary: number
  employmentType: string
  hireDate: string
  status: string
  jobPosition?: string
  systemRole?: string
}

interface SuccessDialogData {
  visible: boolean
  firstName: string
  lastName: string
  email: string
  employeeId: number
  systemRole?: string
}

const initialFormData: NewEmployeeFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  departmentId: undefined,
  salary: 0,
  employmentType: 'FULL_TIME',
  hireDate: new Date().toISOString().split('T')[0],
  status: 'ACTIVE',
  jobPosition: '',
  systemRole: '',
}

export default function CreateEmployeePage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<NewEmployeeFormData>(initialFormData)
  const [error, setError] = useState<string>('')
  const [successDialog, setSuccessDialog] = useState<SuccessDialogData>({
    visible: false,
    firstName: '',
    lastName: '',
    email: '',
    employeeId: 0,
  })

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await departmentApi.getAll()
      return response.data || response
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: NewEmployeeFormData) => {
      return employeeApi.create(data)
    },
    onSuccess: (response) => {
      const newEmployeeId = response.data?.id || response.id
      const systemRole = response.data?.systemRole || formData.systemRole || 'EMPLOYEE'
      setSuccessDialog({
        visible: true,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        employeeId: newEmployeeId,
        systemRole: systemRole,
      })
      setFormData(initialFormData)
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to create employee')
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'salary') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? 0 : parseFloat(value) }))
    } else if (name === 'departmentId') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? undefined : parseInt(value, 10) }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError('First name, last name, and email are required')
      return
    }
    if (formData.salary <= 0) {
      setError('Salary must be greater than 0')
      return
    }
    if (!formData.status) {
      setError('Status is required')
      return
    }

    createMutation.mutate(formData)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Employee</h1>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 rounded-lg">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Personal Information</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">System Access Level</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              This determines what permissions and features they have access to in the system
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  System Role *
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">(Optional - will auto-assign based on job position)</span>
                </label>
                <select
                  name="systemRole"
                  value={formData.systemRole}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Auto-assign (default)</option>
                  <option value="EMPLOYEE">Employee - Standard access to own data</option>
                  <option value="MANAGER">Manager - Can manage team and view department data</option>
                  <option value="HR">HR - Full employee management capabilities</option>
                  <option value="ACCOUNTANT">Accountant - Financial access</option>
                  <option value="ADMIN">Admin - Full system access</option>
                </select>
                <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                  💡 Tip: If a job position contains "manager" or "supervisor", MANAGER role will be auto-assigned
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Job Information</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Define their position and department
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Job Position/Title *
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">(e.g., Backend Engineer, HR Manager)</span>
                </label>
                <input
                  type="text"
                  name="jobPosition"
                  value={formData.jobPosition || ''}
                  onChange={handleChange}
                  placeholder="e.g., Senior Backend Engineer, HR Manager, Frontend Developer"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Department *
                </label>
                <select
                  name="departmentId"
                  value={formData.departmentId || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">Select a department</option>
                  {departments.map((dept: any) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Employment Details</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Employment Type *
                </label>
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="TEMPORARY">Temporary</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hire Date *
                </label>
                <input
                  type="date"
                  name="hireDate"
                  value={formData.hireDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="ACTIVE">Active</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="TERMINATED">Terminated</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Salary (Annual) *
                </label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary || ''}
                  onChange={handleChange}
                  placeholder="50000"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                  min="1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
          >
            <X size={18} />
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition-colors"
          >
            <Save size={18} />
            {createMutation.isPending ? 'Creating...' : 'Create Employee'}
          </button>
        </div>

        {/* Success Dialog */}
        {successDialog.visible && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Employee Created Successfully!
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {successDialog.firstName} {successDialog.lastName} has been added to the system.
                  </p>

                  {/* Credentials Info */}
                  <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-600 p-4 text-left rounded">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                          Credentials Sent to Email
                        </h3>
                        <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
                          An email has been automatically sent to <strong>{successDialog.email}</strong> containing:
                        </p>
                        <ul className="text-sm text-blue-800 dark:text-blue-300 list-disc list-inside space-y-1">
                          <li>Username: {successDialog.email}</li>
                          <li>Temporary password (randomly generated)</li>
                          <li>Login instructions</li>
                          <li>Account Role: <strong>{successDialog.systemRole || 'EMPLOYEE'}</strong></li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 p-3 rounded text-sm text-amber-800 dark:text-amber-200">
                    ⚠️ The employee must change their password on first login for security.
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setSuccessDialog({ ...successDialog, visible: false })
                        navigate(`/employees/${successDialog.employeeId}`)
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                    >
                      View Employee Details
                    </button>
                    <button
                      onClick={() => {
                        setSuccessDialog({ ...successDialog, visible: false })
                        navigate('/employees')
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 font-medium"
                    >
                      Back to Employees
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
