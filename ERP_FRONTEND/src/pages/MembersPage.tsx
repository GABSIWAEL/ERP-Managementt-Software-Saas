import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, Input, Badge } from '@components/ui'
import { MainLayout } from '@components/layout'
import { employeeApi } from '@api/index'
import { getFullName } from '@utils/helpers'
import { Users, ChevronRight, ArrowLeft, Search, Mail, Briefcase } from 'lucide-react'
import { Employee } from '@types'
import { useAuthStore } from '@store/authStore'

export default function MembersPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('ALL')

  // Get current employee profile
  const { data: currentEmployeeData } = useQuery({
    queryKey: ['currentEmployee'],
    queryFn: async () => {
      try {
        return await employeeApi.getProfile()
      } catch {
        return null
      }
    }
  })

  const currentEmployeeDepartmentId = currentEmployeeData?.departmentId ?? currentEmployeeData?.department?.id
  const departmentName = currentEmployeeData?.departmentName || currentEmployeeData?.department?.name || 'Department'

  // Fetch department employees
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['departmentEmployees', currentEmployeeDepartmentId],
    queryFn: async () => {
      if (!currentEmployeeDepartmentId) return []
      const response = await employeeApi.getByDepartment(currentEmployeeDepartmentId)
      return response
    },
    enabled: !!currentEmployeeDepartmentId
  })

  const filteredEmployees = employees.filter((emp: Employee) => {
    const matchesSearch = 
      getFullName(emp.firstName, emp.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  const breadcrumbs = [
    { label: 'Dashboard', onClick: () => navigate('/') },
    { label: 'Members', active: true }
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
          {breadcrumbs.map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-1">
              {idx > 0 && <ChevronRight size={14} />}
              {crumb.active ? (
                <span className="text-gray-900 dark:text-white font-medium">{crumb.label}</span>
              ) : (
                <button
                  onClick={crumb.onClick}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  {crumb.label}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
          >
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Users size={24} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Department Members</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {departmentName} • {employees.length} members
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search by name, email, or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employeesLoading ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              <div className="animate-spin">
                <Users size={32} className="mx-auto text-gray-400 mb-2" />
              </div>
              Loading members...
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Users size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? 'No members match your search' : 'No members found'}
              </p>
            </div>
          ) : (
            filteredEmployees.map((emp: Employee) => (
              <Card
                key={emp.id}
                className="hover:shadow-lg transition-all cursor-pointer group hover:border-primary-300 dark:hover:border-primary-600"
                onClick={() => navigate(`/employees/${emp.id}`)}
              >
                <CardContent className="pt-6">
                  {/* Employee Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600">
                        {getFullName(emp.firstName, emp.lastName)}
                      </h3>
                      {emp.position && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1">
                          <Briefcase size={14} />
                          {emp.position}
                        </p>
                      )}
                    </div>
                    <Badge variant={emp.status === 'ACTIVE' ? 'success' : 'warning'}>
                      {emp.status}
                    </Badge>
                  </div>

                  {/* Employee Details */}
                  <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={14} className="text-gray-400" />
                      <p className="text-gray-600 dark:text-gray-400 truncate" title={emp.email}>
                        {emp.email}
                      </p>
                    </div>

                    {emp.phone && (
                      <div className="text-sm">
                        <p className="text-gray-600 dark:text-gray-400">
                          <span className="text-gray-500 dark:text-gray-500">Phone:</span> {emp.phone}
                        </p>
                      </div>
                    )}

                    {/* Hire Date */}
                    <div className="text-sm">
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="text-gray-500 dark:text-gray-500">Joined:</span>{' '}
                        {emp.hireDate ? new Date(emp.hireDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>

                    {/* Employment Type */}
                    <div>
                      <Badge variant="info" className="px-2 py-1 text-xs">
                        {emp.employmentType || 'Full-Time'}
                      </Badge>
                    </div>
                  </div>

                  {/* View Profile Link */}
                  <button className="w-full mt-4 py-2 px-3 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded font-medium text-sm hover:bg-primary-100 dark:hover:bg-primary-900/40 transition">
                    View Profile →
                  </button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Stats Footer */}
        {filteredEmployees.length > 0 && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{filteredEmployees.length}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Members Found</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {filteredEmployees.filter(e => e.status === 'ACTIVE').length}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Active</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {filteredEmployees.filter(e => e.employmentType === 'FULL_TIME').length}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Full-Time</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {new Set(filteredEmployees.map(e => e.position)).size}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Positions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}

