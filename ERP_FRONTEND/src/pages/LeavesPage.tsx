import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, Button, Badge, Input, Select, Modal, DataTable, ConfirmModal, Textarea } from '@components/ui'
import { MainLayout } from '@components/layout'
import { leaveApi, employeeApi } from '@api/index'
import { useAuthStore } from '@store/authStore'
import { LeaveRequest, LeaveStatus, LeaveType, Employee } from '@types'
import { formatDate, getFullName, calculateDaysBetween } from '@utils/helpers'
import { Plus, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react'
import { LeaveRequestForm } from '@components/LeaveRequestForm'

const leaveRequestSchema = z.object({
  leaveType: z.enum(['SICK', 'ANNUAL', 'CASUAL', 'MATERNITY', 'PATERNITY', 'UNPAID']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().optional(),
})

type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>

interface LeaveBalance {
  [key: string]: number
}

export default function LeavesPage() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [page, setPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<LeaveStatus | ''>('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null)
  const [showApproveConfirm, setShowApproveConfirm] = useState(false)
  const [showRejectConfirm, setShowRejectConfirm] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<LeaveRequest | null>(null)
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>('ANNUAL')

  // Fetch leave requests - backend handles role-based filtering
  const { data: leavesData = { content: [] }, isLoading } = useQuery({
    queryKey: ['leaves', page, filterStatus, user?.id, user?.role],
    queryFn: async () => {
      // Backend handles all role-based filtering
      // Employees see their own, Managers see their department, HR/Admin see all
      return await leaveApi.getAll(page, 20, filterStatus || undefined)
    },
    enabled: !!user?.id
  })

  // Fetch current employee data with leave balance
  const { data: currentEmployee } = useQuery({
    queryKey: ['current-employee-details', user?.id],
    queryFn: async () => {
      if (!user?.id) return null
      const response = await employeeApi.getById(user.id)
      return response
    },
    enabled: !!user?.id && user?.role === 'EMPLOYEE'
  })

  // Fetch employees (for reference, not used in filtering)
  const { data: employees = [] } = useQuery({
    queryKey: ['employees-for-leave'],
    queryFn: async () => {
      const response = await employeeApi.getAll(0, 100)
      return response.content || response
    }
  })

  // Create leave mutation
  const createLeaveMutation = useMutation({
    mutationFn: (data: LeaveRequestFormData) => leaveApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] })
      queryClient.invalidateQueries({ queryKey: ['current-employee-details'] })
      setShowCreateModal(false)
      alert('Leave request created successfully!')
    },
    onError: (error: any) => {
      console.error('Error creating leave request:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create leave request'
      alert(`Error: ${errorMessage}`)
    }
  })

  // Approve leave mutation
  const approveLeaveMutation = useMutation({
    mutationFn: (id: number) => leaveApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] })
      setShowApproveConfirm(false)
      setSelectedLeave(null)
    }
  })

  // Reject leave mutation
  const rejectLeaveMutation = useMutation({
    mutationFn: (id: number) => leaveApi.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] })
      setShowRejectConfirm(false)
      setSelectedLeave(null)
    }
  })

  // Delete leave mutation
  const deleteLeaveMutation = useMutation({
    mutationFn: (id: number) => leaveApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] })
      setDeleteConfirm(null)
    }
  })

  const onCreateLeave = (data: LeaveRequestFormData) => {
    if (!user?.id) {
      console.error('User ID not available')
      return
    }
    
    const leaveRequestDTO = {
      employeeId: user.id,
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      status: 'PENDING',
      managerComment: data.reason || '',
    }
    
    console.log('Creating leave request:', leaveRequestDTO)
    createLeaveMutation.mutate(leaveRequestDTO as any)
  }

  // Get leave balance for selected type from employee data
  const leaveBalance = currentEmployee?.[`${selectedLeaveType.toLowerCase()}LeaveBalance`] || 0

  const filteredLeaves = leavesData.content?.filter((leave: LeaveRequest) =>
    getFullName(leave.employee?.firstName, leave.employee?.lastName).toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const columns = [
    {
      key: 'employee' as const,
      label: 'Employee',
      render: (value: Employee) => value ? `${value.firstName} ${value.lastName}` : '-'
    },
    {
      key: 'leaveType' as const,
      label: 'Leave Type',
      render: (value: LeaveType) => <Badge variant="info">{value}</Badge>
    },
    {
      key: 'startDate' as const,
      label: 'Start Date',
      render: (value: string) => formatDate(value)
    },
    {
      key: 'endDate' as const,
      label: 'End Date',
      render: (value: string) => formatDate(value)
    },
    {
      key: 'numberOfDays' as const,
      label: 'Days',
      render: (value: number) => `${value || '-'} days`
    },
    {
      key: 'status' as const,
      label: 'Status & Actions',
      render: (value: LeaveStatus, item: LeaveRequest) => (
        <div className="flex items-center gap-3">
          <Badge status={value}>{value}</Badge>
          
          {/* Show action buttons only if leave is PENDING and user is authorized */}
          {value === 'PENDING' && user && ['MANAGER', 'HR', 'ADMIN'].includes(user.role) && (
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-700/50 rounded">
              <button
                onClick={() => {
                  setSelectedLeave(item)
                  setShowApproveConfirm(true)
                }}
                className="p-1.5 hover:bg-green-200 dark:hover:bg-green-700/70 rounded transition-colors"
                title="Approve this leave request"
              >
                <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
              </button>
              <button
                onClick={() => {
                  setSelectedLeave(item)
                  setShowRejectConfirm(true)
                }}
                className="p-1.5 hover:bg-red-200 dark:hover:bg-red-700/70 rounded transition-colors"
                title="Reject this leave request"
              >
                <XCircle size={18} className="text-red-600 dark:text-red-400" />
              </button>
              <button
                onClick={() => setDeleteConfirm(item)}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                title="Delete this leave request"
              >
                <Trash2 size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          )}

          {/* Show message if pending but user not authorized */}
          {value === 'PENDING' && !(user && ['MANAGER', 'HR', 'ADMIN'].includes(user.role)) && (
            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded">
              Awaiting approval
            </span>
          )}

          {/* Show non-pending status info */}
          {value !== 'PENDING' && (
            <span className="text-xs text-gray-500 dark:text-gray-400 italic">
              No actions available
            </span>
          )}
        </div>
      )
    },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leave Requests</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage employee leave requests and approvals</p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            New Leave Request
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{leavesData.content?.length || 0}</p>
                </div>
                <Clock className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {leavesData.content?.filter((l: LeaveRequest) => l.status === 'PENDING').length || 0}
                  </p>
                </div>
                <Clock className="text-yellow-600 dark:text-yellow-400" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {leavesData.content?.filter((l: LeaveRequest) => l.status === 'APPROVED').length || 0}
                  </p>
                </div>
                <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {leavesData.content?.filter((l: LeaveRequest) => l.status === 'REJECTED').length || 0}
                  </p>
                </div>
                <XCircle className="text-red-600 dark:text-red-400" size={24} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as LeaveStatus | '')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Leaves Table */}
        <DataTable
          columns={columns}
          data={filteredLeaves}
          isLoading={isLoading}
          page={page}
          pageSize={20}
          onPageChange={setPage}
          emptyMessage="No leave requests found"
        />
      </div>

      {/* Create Leave Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setSelectedLeaveType('ANNUAL')
        }}
        title="New Leave Request"
        size="lg"
        footer={null}
      >
        {user?.role === 'EMPLOYEE' ? (
          <LeaveRequestForm
            leaveBalance={leaveBalance}
            leaveType={selectedLeaveType}
            onSubmit={onCreateLeave}
            isLoading={createLeaveMutation.isPending}
          />
        ) : (
          <div className="p-4 text-center text-gray-600 dark:text-gray-400">
            Only employees can create leave requests
          </div>
        )}
      </Modal>

      {/* Approve Confirmation Modal */}
      <ConfirmModal
        isOpen={showApproveConfirm}
        onClose={() => {
          setShowApproveConfirm(false)
          setSelectedLeave(null)
        }}
        onConfirm={() => {
          if (selectedLeave) {
            approveLeaveMutation.mutate(selectedLeave.id)
          }
        }}
        title="Approve Leave Request"
        message={`Approve leave request for ${selectedLeave?.employee?.firstName} ${selectedLeave?.employee?.lastName} from ${formatDate(selectedLeave?.startDate || '')} to ${formatDate(selectedLeave?.endDate || '')}?`}
        confirmText="Approve"
        isLoading={approveLeaveMutation.isPending}
      />

      {/* Reject Confirmation Modal */}
      <ConfirmModal
        isOpen={showRejectConfirm}
        onClose={() => {
          setShowRejectConfirm(false)
          setSelectedLeave(null)
        }}
        onConfirm={() => {
          if (selectedLeave) {
            rejectLeaveMutation.mutate(selectedLeave.id)
          }
        }}
        title="Reject Leave Request"
        message={`Reject leave request for ${selectedLeave?.employee?.firstName} ${selectedLeave?.employee?.lastName}?`}
        confirmText="Reject"
        isDangerous
        isLoading={rejectLeaveMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            deleteLeaveMutation.mutate(deleteConfirm.id)
          }
        }}
        title="Delete Leave Request"
        message={`Delete leave request for ${deleteConfirm?.employee?.firstName} ${deleteConfirm?.employee?.lastName} from ${formatDate(deleteConfirm?.startDate || '')} to ${formatDate(deleteConfirm?.endDate || '')}? This action cannot be undone.`}
        confirmText="Delete"
        isDangerous
        isLoading={deleteLeaveMutation.isPending}
      />
    </MainLayout>
  )
}

