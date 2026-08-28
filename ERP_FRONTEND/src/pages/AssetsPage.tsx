import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, Button, Badge, Input, Select, Modal, DataTable } from '@components/ui'
import { MainLayout } from '@components/layout'
import { assetApi, employeeApi } from '@api/index'
import type { Asset, Employee } from '@/types'
import { useAuthStore } from '@store/authStore'
import { formatDate, formatCurrency } from '@utils/helpers'
import { Plus, Edit2, Box, User, Trash2, Eye, Download } from 'lucide-react'

const assetSchema = z.object({
  name: z.string().min(1, 'Asset name is required'),
  assetCode: z.string().min(1, 'Asset code is required'),
  category: z.string().min(1, 'Category is required'),
  purchaseDate: z.string().optional(),
  value: z.string().optional(),
  serialNumber: z.string().optional(),
  type: z.string().optional(),
})

const assignAssetSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
})

type AssetFormData = z.infer<typeof assetSchema>
type AssignAssetFormData = z.infer<typeof assignAssetSchema>

export default function AssetsPage() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN'
  const isAccountant = user?.role === 'ACCOUNTANT'
  const isHR = user?.role === 'HR'
  const isManager = user?.role === 'MANAGER'
  const canCreateOrEditAssets = isAdmin || isAccountant
  const canManageAssignments = isAdmin || isAccountant
  const canMarkDamaged = isAdmin || isAccountant || isManager
  const canMarkSold = isAccountant
  const [page, setPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showMarkDamagedModal, setShowMarkDamagedModal] = useState(false)
  const [showMarkSoldModal, setShowMarkSoldModal] = useState(false)
  const [damagingReason, setDamagingReason] = useState('')
  const [sellingReason, setSellingReason] = useState('')
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)

  // Fetch assets
  const { data: assetsData = { content: [] }, isLoading } = useQuery({
    queryKey: ['assets', page, filterCategory],
    queryFn: async () => {
      const response = await assetApi.getAll(page, 20, filterCategory || undefined)
      // Handle both paginated response and direct array response
      return {
        content: response.data || response.content || response || []
      }
    }
  })

  // Fetch employees
  const { data: employees = [] } = useQuery({
    queryKey: ['employees-for-assets'],
    queryFn: async () => {
      const response = await employeeApi.getAll(0, 100)
      // Handle both paginated response and direct array response
      return response.data || response.content || response || []
    }
  })

  // Create asset mutation
  const createAssetMutation = useMutation({
    mutationFn: (data: AssetFormData) =>
      assetApi.create({
        ...data,
        value: data.value ? parseFloat(data.value) : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      setShowCreateModal(false)
      resetCreateForm()
    }
  })

  // Update asset mutation
  const updateAssetMutation = useMutation({
    mutationFn: (data: AssetFormData) =>
      assetApi.update(selectedAsset!.id, {
        ...data,
        value: data.value ? parseFloat(data.value) : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      setShowEditModal(false)
      setSelectedAsset(null)
      resetEditForm()
    }
  })

  // Assign asset mutation
  const assignAssetMutation = useMutation({
    mutationFn: (data: AssignAssetFormData) =>
      assetApi.assign(selectedAsset!.id, parseInt(data.employeeId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      setShowAssignModal(false)
      setSelectedAsset(null)
      resetAssignForm()
    }
  })

  // Return asset mutation
  const returnAssetMutation = useMutation({
    mutationFn: (id: number) => assetApi.return(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
    }
  })

  // Delete asset mutation
  const deleteAssetMutation = useMutation({
    mutationFn: (id: number) => assetApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
    }
  })

  // Mark asset as damaged mutation
  const markDamagedMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      assetApi.markAsDamaged(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      setSelectedAsset(null)
    }
  })

  // Mark asset as sold mutation
  const markSoldMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      assetApi.markAsSold(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      setSelectedAsset(null)
    }
  })

  const { register: registerCreate, handleSubmit: handleCreateSubmit, formState: { errors: createErrors }, reset: resetCreateForm } = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
  })

  const { register: registerEdit, handleSubmit: handleEditSubmit, formState: { errors: editErrors }, reset: resetEditForm, setValue: setEditValue } = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
  })

  const { register: registerAssign, handleSubmit: handleAssignSubmit, formState: { errors: assignErrors }, reset: resetAssignForm } = useForm<AssignAssetFormData>({
    resolver: zodResolver(assignAssetSchema),
  })

  const onCreateAsset = (data: AssetFormData) => {
    createAssetMutation.mutate(data)
  }

  const onUpdateAsset = (data: AssetFormData) => {
    updateAssetMutation.mutate(data)
  }

  const onAssignAsset = (data: AssignAssetFormData) => {
    assignAssetMutation.mutate(data)
  }

  const handleEditClick = (asset: Asset) => {
    setSelectedAsset(asset)
    setEditValue('name', asset.name)
    setEditValue('assetCode', asset.assetCode)
    setEditValue('category', asset.category)
    setEditValue('purchaseDate', asset.purchaseDate || '')
    setEditValue('value', asset.purchasePrice?.toString() || '')
    setEditValue('serialNumber', asset.serialNumber || '')
    setEditValue('type', asset.description || '')
    setShowEditModal(true)
  }

  const filteredAssets = assetsData.content?.filter((asset: Asset) =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (asset.serialNumber && asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || []

  const availableAssets = filteredAssets.filter((a: Asset) => a.status === 'AVAILABLE')
  const assignedAssets = filteredAssets.filter((a: Asset) => a.status === 'ASSIGNED')

  const categories = [...new Set(assetsData.content?.map((a: Asset) => a.category) || [])]

  const columns = [
    {
      key: 'name' as const,
      label: 'Asset Name',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Box size={16} className="text-gray-600 dark:text-gray-400" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'assetCode' as const,
      label: 'Asset Code',
      render: (value: string) => (
        <span className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{value}</span>
      )
    },
    {
      key: 'serialNumber' as const,
      label: 'Serial Number',
      render: (value: string) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">{value || '-'}</span>
      )
    },
    {
      key: 'category' as const,
      label: 'Category',
      render: (value: string) => <Badge variant="info">{value}</Badge>
    },
    {
      key: 'value' as const,
      label: 'Value',
      render: (value: number) => formatCurrency(value)
    },
    {
      key: 'purchaseDate' as const,
      label: 'Purchase Date',
      render: (value: string) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">{value ? formatDate(value) : '-'}</span>
      )
    },
    {
      key: 'assignedTo' as const,
      label: 'Assigned To',
      render: (_value: Employee | undefined, item: Asset) => {
        const assigneeName = item.assignedTo
          ? `${item.assignedTo.firstName} ${item.assignedTo.lastName}`
          : item.assignedToName
            ? item.assignedToName
            : null

        return assigneeName ? (
          <div className="flex items-center gap-2">
            <User size={16} className="text-gray-600 dark:text-gray-400" />
            <span>{assigneeName}</span>
          </div>
        ) : (
          <span className="text-gray-500 dark:text-gray-400">Unassigned</span>
        )
      }
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: string, item: Asset) => (
        <div className="flex items-center gap-2">
          <Badge status={value as any}>{value}</Badge>
        </div>
      )
    },
    {
      key: 'actions' as const,
      label: 'Actions',
      render: (_, item: Asset) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedAsset(item)
              setShowDetailsModal(true)
            }}
            className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition-colors"
            title="View details"
          >
            <Eye size={14} className="text-blue-600 dark:text-blue-400" />
          </button>
          {canCreateOrEditAssets && (
            <>
              <button
                onClick={() => handleEditClick(item)}
                className="p-1.5 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded transition-colors"
                title="Edit"
              >
                <Edit2 size={14} className="text-purple-600 dark:text-purple-400" />
              </button>
              {item.status === 'AVAILABLE' && (
                <>
                  {canManageAssignments && (
                    <button
                      onClick={() => {
                        setSelectedAsset(item)
                        setShowAssignModal(true)
                      }}
                      className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900/20 rounded transition-colors"
                      title="Assign"
                    >
                      <Plus size={14} className="text-green-600 dark:text-green-400" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteAssetMutation.mutate(item.id)}
                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} className="text-red-600 dark:text-red-400" />
                  </button>
                </>
              )}
              {(item.status === 'ASSIGNED' || item.status === 'RETURNED') && (
                <>
                  {item.status === 'ASSIGNED' && canManageAssignments && (
                    <button
                      onClick={() => returnAssetMutation.mutate(item.id)}
                      className="px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded hover:bg-orange-200 dark:hover:bg-orange-900/40 transition-colors"
                      title="Return asset"
                    >
                      Return
                    </button>
                  )}
                  {item.status === 'RETURNED' && canManageAssignments && (
                    <button
                      onClick={() => {
                        setSelectedAsset(item)
                        setShowAssignModal(true)
                      }}
                      className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors"
                      title="Reassign"
                    >
                      Reassign
                    </button>
                  )}
                  {canMarkDamaged && (
                    <button
                      onClick={() => {
                        setSelectedAsset(item)
                        setDamagingReason('')
                        setShowMarkDamagedModal(true)
                      }}
                      className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded hover:bg-yellow-200 dark:hover:bg-yellow-900/40 transition-colors"
                      title="Mark as damaged"
                    >
                      Damaged
                    </button>
                  )}
                </>
              )}
              {canMarkSold && item.status !== 'SOLD' && (
                <button
                  onClick={() => {
                    setSelectedAsset(item)
                    setSellingReason('')
                    setShowMarkSoldModal(true)
                  }}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-900/40 transition-colors"
                  title="Mark as sold"
                >
                  Sold
                </button>
              )}
            </>
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Asset Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isAccountant
                ? 'Manage asset records, approvals, and financial updates'
                : isHR
                  ? 'View asset inventory and assigned records'
                  : 'Track and manage company assets'}
            </p>
          </div>
          {canCreateOrEditAssets && (
            <Button
              variant="primary"
              size="md"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2"
            >
              <Plus size={18} />
              New Asset
            </Button>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Assets</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{filteredAssets.length}</p>
                </div>
                <Box className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Available</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{availableAssets.length}</p>
                </div>
                <Box className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Assigned</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{assignedAssets.length}</p>
                </div>
                <User className="text-orange-600 dark:text-orange-400" size={24} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Input
            placeholder="Search assets by name, code, or serial number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat: string) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Assets Table */}
        <DataTable
          columns={columns}
          data={filteredAssets}
          isLoading={isLoading}
          page={page}
          pageSize={20}
          onPageChange={setPage}
          emptyMessage="No assets found"
        />
      </div>

      {/* Create Asset Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          resetCreateForm()
        }}
        title="Add New Asset"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateSubmit(onCreateAsset)} isLoading={createAssetMutation.isPending}>
              Add Asset
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input
            label="Asset Name"
            placeholder="e.g., Laptop, Monitor, Phone"
            {...registerCreate('name')}
            error={createErrors.name?.message}
          />

          <Input
            label="Asset Code"
            placeholder="e.g., ASSET-001"
            {...registerCreate('assetCode')}
            error={createErrors.assetCode?.message}
          />

          <Input
            label="Category"
            placeholder="e.g., Electronics, Furniture"
            {...registerCreate('category')}
            error={createErrors.category?.message}
          />

          <Input
            label="Type (Optional)"
            placeholder="e.g., Laptop, Desktop, Peripherals"
            {...registerCreate('type')}
            error={createErrors.type?.message}
          />

          <Input
            label="Purchase Date"
            type="date"
            {...registerCreate('purchaseDate')}
            error={createErrors.purchaseDate?.message}
          />

          <Input
            label="Value"
            type="number"
            placeholder="e.g., 1000.00"
            step="0.01"
            {...registerCreate('value')}
            error={createErrors.value?.message}
          />

          <Input
            label="Serial Number (Optional)"
            placeholder="e.g., SN12345"
            {...registerCreate('serialNumber')}
            error={createErrors.serialNumber?.message}
          />
        </form>
      </Modal>

      {/* Edit Asset Modal */}
      <Modal
        isOpen={showEditModal && selectedAsset !== null}
        onClose={() => {
          setShowEditModal(false)
          setSelectedAsset(null)
          resetEditForm()
        }}
        title={`Edit Asset - ${selectedAsset?.name}`}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleEditSubmit(onUpdateAsset)} isLoading={updateAssetMutation.isPending}>
              Update Asset
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input
            label="Asset Name"
            {...registerEdit('name')}
            error={editErrors.name?.message}
          />

          <Input
            label="Asset Code"
            {...registerEdit('assetCode')}
            error={editErrors.assetCode?.message}
          />

          <Input
            label="Category"
            {...registerEdit('category')}
            error={editErrors.category?.message}
          />

          <Input
            label="Type (Optional)"
            {...registerEdit('type')}
            error={editErrors.type?.message}
          />

          <Input
            label="Purchase Date"
            type="date"
            {...registerEdit('purchaseDate')}
            error={editErrors.purchaseDate?.message}
          />

          <Input
            label="Value"
            type="number"
            step="0.01"
            {...registerEdit('value')}
            error={editErrors.value?.message}
          />

          <Input
            label="Serial Number (Optional)"
            {...registerEdit('serialNumber')}
            error={editErrors.serialNumber?.message}
          />
        </form>
      </Modal>

      {/* Asset Details Modal */}
      <Modal
        isOpen={showDetailsModal && selectedAsset !== null}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedAsset(null)
        }}
        title={`Asset Details - ${selectedAsset?.name}`}
        size="md"
        footer={
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>Close</Button>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Asset Name</label>
              <p className="text-gray-900 dark:text-white font-semibold">{selectedAsset?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Asset Code</label>
              <p className="text-gray-900 dark:text-white font-mono">{selectedAsset?.assetCode}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Serial Number</label>
              <p className="text-gray-900 dark:text-white">{selectedAsset?.serialNumber || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Category</label>
              <p className="text-gray-900 dark:text-white">{selectedAsset?.category}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Type</label>
              <p className="text-gray-900 dark:text-white">{selectedAsset?.description || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Value</label>
              <p className="text-gray-900 dark:text-white font-semibold">{formatCurrency(selectedAsset?.purchasePrice || 0)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Purchase Date</label>
              <p className="text-gray-900 dark:text-white">{selectedAsset?.purchaseDate ? formatDate(selectedAsset.purchaseDate) : '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
              <Badge status={selectedAsset?.status as any}>{selectedAsset?.status}</Badge>
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Assigned To</label>
              <p className="text-gray-900 dark:text-white">
                {selectedAsset?.assignedTo
                  ? `${selectedAsset.assignedTo.firstName} ${selectedAsset.assignedTo.lastName}`
                  : selectedAsset?.assignedToName
                    ? selectedAsset.assignedToName
                    : 'Unassigned'}
              </p>
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Created</label>
              <p className="text-gray-900 dark:text-white text-sm">{selectedAsset?.createdAt ? formatDate(selectedAsset.createdAt) : '-'}</p>
            </div>
          </div>
        </div>
      </Modal>

      {/* Assign Asset Modal */}
      <Modal
        isOpen={showAssignModal && selectedAsset !== null}
        onClose={() => {
          setShowAssignModal(false)
          setSelectedAsset(null)
          resetAssignForm()
        }}
        title={`Assign Asset - ${selectedAsset?.name}`}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAssignModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAssignSubmit(onAssignAsset)} isLoading={assignAssetMutation.isPending}>
              Assign
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <Select
            label="Assign to Employee"
            {...registerAssign('employeeId')}
            error={assignErrors.employeeId?.message}
            options={employees.map((emp: Employee) => ({
              value: emp.id.toString(),
              label: `${emp.firstName} ${emp.lastName}`
            }))}
          />
        </form>
      </Modal>

      {/* Mark as Damaged Modal */}
      <Modal
        isOpen={showMarkDamagedModal && selectedAsset !== null}
        onClose={() => {
          setShowMarkDamagedModal(false)
          setSelectedAsset(null)
          setDamagingReason('')
        }}
        title={`Mark as Damaged - ${selectedAsset?.name}`}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowMarkDamagedModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => {
              markDamagedMutation.mutate({ id: selectedAsset!.id, reason: damagingReason })
            }} isLoading={markDamagedMutation.isPending}>
              Mark as Damaged
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Reason (Optional)
            </label>
            <textarea
              value={damagingReason}
              onChange={(e) => setDamagingReason(e.target.value)}
              placeholder="Enter reason for marking as damaged..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </Modal>

      {/* Mark as Sold Modal */}
      <Modal
        isOpen={showMarkSoldModal && selectedAsset !== null}
        onClose={() => {
          setShowMarkSoldModal(false)
          setSelectedAsset(null)
          setSellingReason('')
        }}
        title={`Mark as Sold - ${selectedAsset?.name}`}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowMarkSoldModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => {
              markSoldMutation.mutate({ id: selectedAsset!.id, reason: sellingReason })
            }} isLoading={markSoldMutation.isPending}>
              Mark as Sold
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Reason (Optional)
            </label>
            <textarea
              value={sellingReason}
              onChange={(e) => setSellingReason(e.target.value)}
              placeholder="Enter reason for selling the asset..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </Modal>
    </MainLayout>
  )
}
