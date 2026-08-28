import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, Button, Badge, Input, Select, Modal, DataTable, ConfirmModal } from '@components/ui'
import { MainLayout } from '@components/layout'
import { remoteWorkApi, employeeApi } from '@api/index'
import { RemoteWorkRequest, Employee } from '@types'
import { formatDate, getFullName } from '@utils/helpers'
import { Plus, CheckCircle, XCircle, Clock, Home } from 'lucide-react'

const remoteWorkSchema = z.object({
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().optional(),
})

type RemoteWorkFormData = z.infer<typeof remoteWorkSchema>

export default function RemoteWorkPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<RemoteWorkRequest | null>(null)
  const [showApproveConfirm, setShowApproveConfirm] = useState(false)
  const [showRejectConfirm, setShowRejectConfirm] = useState(false)

  // Fetch remote work requests
  const { data: requestsData = { content: [] }, isLoading } = useQuery({
    queryKey: ['remoteWork', page, filterStatus],
    queryFn: async () => {
      const response = await remoteWorkApi.getAll(page, 20, filterStatus || undefined)
      return response
    }
  })

  // Fetch employees
  const { data: employees = [] } = useQuery({
    queryKey: ['employees-for-remote'],
    queryFn: async () => {
      const response = await employeeApi.getAll(0, 100)
      return response.content || response
    }
  })

  // Create request mutation
  const createRequestMutation = useMutation({
    mutationFn: (data: RemoteWorkFormData) => remoteWorkApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['remoteWork'] })
      setShowCreateModal(false)
      resetCreateForm()
    }
  })

  // Approve request mutation
  const approveRequestMutation = useMutation({
    mutationFn: (id: number) => remoteWorkApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['remoteWork'] })
      setShowApproveConfirm(false)
      setSelectedRequest(null)
    }
  })

  // Reject request mutation
  const rejectRequestMutation = useMutation({
    mutationFn: (id: number) => remoteWorkApi.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['remoteWork'] })
      setShowRejectConfirm(false)
      setSelectedRequest(null)
    }
  })

  const { register: registerCreate, handleSubmit: handleCreateSubmit, formState: { errors: createErrors }, reset: resetCreateForm } = useForm<RemoteWorkFormData>({
    resolver: zodResolver(remoteWorkSchema),
    defaultValues: {
      reason: ''
    }
  })

  const onCreateRequest = (data: RemoteWorkFormData) => {
    createRequestMutation.mutate(data)
  }

  const filteredRequests = requestsData.content?.filter((request: RemoteWorkRequest) =>
    getFullName(request.employee?.firstName, request.employee?.lastName).toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const columns = [
    {
      key: 'employee' as const,
      label: 'Employee',
      render: (value: Employee) => value ? `${value.firstName} ${value.lastName}` : '-'
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
      key: 'duration' as const,
      label: 'Duration',
      render: (value: number) => `${value || '-'} days`
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: string, item: RemoteWorkRequest) => (
        <div className="flex items-center gap-2">
          <Badge status={value as any}>{value}</Badge>
          {value === 'PENDING' && (
            <div className="flex gap-1">
              <button
                onClick={() => {
                  setSelectedRequest(item)
                  setShowApproveConfirm(true)
                }}
                className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900/20 rounded transition-colors"
                title="Approve"
              >
                <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
              </button>
              <button
                onClick={() => {
                  setSelectedRequest(item)
                  setShowRejectConfirm(true)
                }}
                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                title="Reject"
              >
                <XCircle size={16} className="text-red-600 dark:text-red-400" />
              </button>
            </div>
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Remote Work Requests</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage remote work approvals and schedules</p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            New Request
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{requestsData.content?.length || 0}</p>
                </div>
                <Home className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {requestsData.content?.filter((r: RemoteWorkRequest) => r.status === 'PENDING').length || 0}
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
                    {requestsData.content?.filter((r: RemoteWorkRequest) => r.status === 'APPROVED').length || 0}
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
                    {requestsData.content?.filter((r: RemoteWorkRequest) => r.status === 'REJECTED').length || 0}
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
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Requests Table */}
        <DataTable
          columns={columns}
          data={filteredRequests}
          isLoading={isLoading}
          page={page}
          pageSize={20}
          onPageChange={setPage}
          emptyMessage="No remote work requests found"
        />
      </div>

      {/* Create Request Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          resetCreateForm()
        }}
        title="New Remote Work Request"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateSubmit(onCreateRequest)} isLoading={createRequestMutation.isPending}>
              Submit Request
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input
            label="Start Date"
            type="date"
            {...registerCreate('startDate')}
            error={createErrors.startDate?.message}
          />

          <Input
            label="End Date"
            type="date"
            {...registerCreate('endDate')}
            error={createErrors.endDate?.message}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason (Optional)</label>
            <textarea
              placeholder="Provide reason for remote work..."
              rows={3}
              {...registerCreate('reason')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </form>
      </Modal>

      {/* Approve Confirmation Modal */}
      <ConfirmModal
        isOpen={showApproveConfirm}
        onClose={() => {
          setShowApproveConfirm(false)
          setSelectedRequest(null)
        }}
        onConfirm={() => {
          if (selectedRequest) {
            approveRequestMutation.mutate(selectedRequest.id)
          }
        }}
        title="Approve Remote Work Request"
        message={`Approve remote work request for ${selectedRequest?.employee?.firstName} ${selectedRequest?.employee?.lastName} from ${formatDate(selectedRequest?.startDate || '')} to ${formatDate(selectedRequest?.endDate || '')}?`}
        confirmText="Approve"
        isLoading={approveRequestMutation.isPending}
      />

      {/* Reject Confirmation Modal */}
      <ConfirmModal
        isOpen={showRejectConfirm}
        onClose={() => {
          setShowRejectConfirm(false)
          setSelectedRequest(null)
        }}
        onConfirm={() => {
          if (selectedRequest) {
            rejectRequestMutation.mutate(selectedRequest.id)
          }
        }}
        title="Reject Remote Work Request"
        message={`Reject remote work request for ${selectedRequest?.employee?.firstName} ${selectedRequest?.employee?.lastName}?`}
        confirmText="Reject"
        isDangerous
        isLoading={rejectRequestMutation.isPending}
      />
    </MainLayout>
  )
}

