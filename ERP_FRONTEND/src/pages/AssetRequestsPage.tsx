import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, Button, Badge, Input, Select, Modal, DataTable } from '@components/ui'
import { MainLayout } from '@components/layout'
import { assetApi, assetRequestApi, employeeApi } from '@api/index'
import { AssetRequestStatus, AssetRequestType } from '@/types'
import type { Asset, AssetRequest, AssetRequestDTO, Employee } from '@/types'
import { useAuthStore } from '@store/authStore'
import { formatDate } from '@utils/helpers'
import { Plus, CheckCircle2, XCircle } from 'lucide-react'

const requestSchema = z.object({
  requestType: z.enum(['NEW_ASSET', 'DAMAGED_ASSET']),
  reason: z.string().min(1, 'Reason is required'),
  details: z.string().optional(),
  assetName: z.string().optional(),
  assetCode: z.string().optional(),
  category: z.string().optional(),
  type: z.string().optional(),
  estimatedValue: z.string().optional(),
  assetId: z.string().optional(),
  requestedForEmployeeId: z.string().optional(),
})

type AssetRequestFormData = z.infer<typeof requestSchema>

export default function AssetRequestsPage() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN'
  const isAccountant = user?.role === 'ACCOUNTANT'
  const isManager = user?.role === 'MANAGER'
  const isEmployee = user?.role === 'EMPLOYEE'
  const canCreateRequests = isAdmin || isManager || isEmployee
  const canReviewRequests = isAdmin || isAccountant
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null)

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<AssetRequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      requestType: AssetRequestType.NEW_ASSET,
      reason: '',
      details: '',
    },
  })

  const selectedRequestType = watch('requestType')

  const { data: requestsData = [], isLoading } = useQuery({
    queryKey: ['asset-requests'],
    queryFn: () => assetRequestApi.getAll(),
  })

  const { data: assets = [] } = useQuery({
    queryKey: ['asset-requests-assets'],
    queryFn: async () => {
      const response = await assetApi.getAll(0, 100)
      return response.data || response.content || response || []
    },
  })

  const { data: employees = [] } = useQuery({
    queryKey: ['asset-requests-employees'],
    queryFn: async () => {
      const response = await employeeApi.getAll(0, 100)
      return response.data || response.content || response || []
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: AssetRequestFormData) => {
      const payload: AssetRequestDTO = {
        requestType: data.requestType as AssetRequestType,
        reason: data.reason,
        details: data.details || undefined,
        assetName: data.assetName || undefined,
        assetCode: data.assetCode || undefined,
        category: data.category || undefined,
        type: data.type || undefined,
        estimatedValue: data.estimatedValue ? Number(data.estimatedValue) : undefined,
        assetId: data.assetId ? Number(data.assetId) : undefined,
        requestedForEmployeeId: data.requestedForEmployeeId ? Number(data.requestedForEmployeeId) : undefined,
      } as AssetRequestDTO

      return assetRequestApi.create(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-requests'] })
      setIsCreateModalOpen(false)
      reset()
    },
  })

  const approveMutation = useMutation({
    mutationFn: (id: number) => assetRequestApi.approve(id, 'Approved'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-requests'] })
      setSelectedRequestId(null)
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (id: number) => assetRequestApi.reject(id, 'Rejected by reviewer'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-requests'] })
      setSelectedRequestId(null)
    },
  })

  const onSubmitRequest = (data: AssetRequestFormData) => {
    createMutation.mutate(data)
  }

  const requestItems = useMemo(() => {
    if (!Array.isArray(requestsData)) {
      return []
    }

    return requestsData as AssetRequest[]
  }, [requestsData])

  const getStatusBadgeClass = (status?: AssetRequestStatus) => {
    switch (status) {
      case AssetRequestStatus.APPROVED:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case AssetRequestStatus.REJECTED:
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    }
  }

  const columns = [
    {
      key: 'requestType' as const,
      label: 'Type',
      render: (value: AssetRequestType) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {value === AssetRequestType.NEW_ASSET ? 'New Asset Request' : 'Damaged Asset Request'}
        </span>
      ),
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: AssetRequestStatus) => (
        <Badge className={getStatusBadgeClass(value)}>{value || 'PENDING'}</Badge>
      ),
    },
    {
      key: 'requestedByName' as const,
      label: 'Requested By',
      render: (value: string | undefined) => <span className="text-sm text-gray-700 dark:text-gray-300">{value || '-'}</span>,
    },
    {
      key: 'reason' as const,
      label: 'Reason',
      render: (value: string) => <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>,
    },
    {
      key: 'assetName' as const,
      label: 'Asset',
      render: (_value: string | undefined, item: AssetRequest) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {item.assetName || item.assetCode || (item.assetId ? `Asset #${item.assetId}` : '-')}
        </span>
      ),
    },
    {
      key: 'createdAt' as const,
      label: 'Created',
      render: (value: string | undefined) => <span className="text-sm text-gray-700 dark:text-gray-300">{value ? formatDate(value) : '-'}</span>,
    },
    {
      key: 'actions' as const,
      label: 'Actions',
      render: (_value: unknown, item: AssetRequest) => (
        <div className="flex items-center gap-2">
          {canReviewRequests && item.status === AssetRequestStatus.PENDING && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => approveMutation.mutate(item.id!)}
                isLoading={approveMutation.isPending}
                className="flex items-center gap-1"
              >
                <CheckCircle2 size={14} />
                Approve
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => rejectMutation.mutate(item.id!)}
                isLoading={rejectMutation.isPending}
                className="flex items-center gap-1"
              >
                <XCircle size={14} />
                Reject
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Asset Requests</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {canCreateRequests
                ? 'Submit and track asset requests for approval'
                : 'Review pending asset requests from managers'}
            </p>
          </div>
          {canCreateRequests && (
            <Button variant="primary" size="md" onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
              <Plus size={18} />
              New Request
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="p-6">
            <DataTable
              columns={columns}
              data={requestItems}
              isLoading={isLoading}
              emptyMessage="No asset requests found"
            />
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false)
          reset()
        }}
        title="New Asset Request"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit(onSubmitRequest)} isLoading={createMutation.isPending}>
              Submit Request
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <Select
            label="Request Type"
            {...register('requestType')}
            options={[
              { value: AssetRequestType.NEW_ASSET, label: 'New Asset Request' },
              { value: AssetRequestType.DAMAGED_ASSET, label: 'Damaged Asset Request' },
            ]}
            error={errors.requestType?.message}
          />

          <Input
            label="Reason"
            placeholder="Describe why you need this asset action"
            {...register('reason')}
            error={errors.reason?.message}
          />

          <Input
            label="Details"
            placeholder="Optional context or comments"
            {...register('details')}
            error={errors.details?.message}
          />

          {selectedRequestType === AssetRequestType.NEW_ASSET ? (
            <>
              <Input
                label="Asset Name"
                placeholder="e.g. Laptop"
                {...register('assetName')}
                error={errors.assetName?.message}
              />
              <Input
                label="Asset Code"
                placeholder="Optional"
                {...register('assetCode')}
                error={errors.assetCode?.message}
              />
              <Input
                label="Category"
                placeholder="Optional"
                {...register('category')}
                error={errors.category?.message}
              />
              <Input
                label="Type"
                placeholder="Optional"
                {...register('type')}
                error={errors.type?.message}
              />
              <Input
                label="Estimated Value"
                type="number"
                step="0.01"
                placeholder="Optional"
                {...register('estimatedValue')}
                error={errors.estimatedValue?.message}
              />
            </>
          ) : (
            <>
              <Select
                label="Asset"
                {...register('assetId')}
                options={assets.map((asset: Asset) => ({ value: asset.id.toString(), label: `${asset.name} (${asset.assetCode})` }))}
                error={errors.assetId?.message}
              />
            </>
          )}

          <Select
            label="Requested For (Optional)"
            {...register('requestedForEmployeeId')}
            options={employees.map((employee: Employee) => ({ value: employee.id.toString(), label: `${employee.firstName} ${employee.lastName}` }))}
            error={errors.requestedForEmployeeId?.message}
          />
        </form>
      </Modal>
    </MainLayout>
  )
}
