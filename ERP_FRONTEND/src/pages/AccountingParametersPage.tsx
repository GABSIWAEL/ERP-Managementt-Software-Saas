import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, Button, Badge, Input, Select, Modal, DataTable, Textarea } from '@components/ui'
import { MainLayout } from '@components/layout'
import { accountingApi } from '@api/index'
import { AccountingParameter } from '@types'
import { formatDate } from '@utils/helpers'
import { Plus, Edit2, History, Trash2 } from 'lucide-react'

const parameterSchema = z.object({
  parameterCode: z.string().min(1, 'Parameter code is required'),
  parameterValue: z.string().min(1, 'Parameter value is required'),
  parameterType: z.string().min(1, 'Parameter type is required'),
  description: z.string().optional(),
  parameterName: z.string().default(''),
  effectiveDate: z.string().min(1, 'Effective date is required'),
  isActive: z.boolean().optional(),
})

type ParameterFormData = z.infer<typeof parameterSchema>

export default function AccountingParametersPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [selectedParameter, setSelectedParameter] = useState<AccountingParameter | null>(null)
  const [parameterHistory, setParameterHistory] = useState<any[]>([])

  // Fetch parameters
  const { data: parametersData = { content: [] }, isLoading } = useQuery({
    queryKey: ['accountingParameters', page],
    queryFn: async () => {
      const response = await accountingApi.getParameters(page, 20)
      return response
    }
  })

  // Create parameter mutation
  const createParameterMutation = useMutation({
    mutationFn: (data: ParameterFormData) => accountingApi.createParameter(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accountingParameters'] })
      setShowCreateModal(false)
      resetCreateForm()
    }
  })

  // Update parameter mutation
  const updateParameterMutation = useMutation({
    mutationFn: (data: ParameterFormData) =>
      accountingApi.updateParameter(selectedParameter!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accountingParameters'] })
      setShowEditModal(false)
      setSelectedParameter(null)
      resetEditForm()
    }
  })

  // Get parameter history mutation
  const getHistoryMutation = useMutation({
    mutationFn: (id: number) => accountingApi.getParameterHistory(id),
    onSuccess: (data) => {
      setParameterHistory(data)
      setShowHistoryModal(true)
    }
  })

  // Delete parameter mutation
  const deleteParameterMutation = useMutation({
    mutationFn: (id: number) => accountingApi.deleteParameter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accountingParameters'] })
    }
  })

  const { register: registerCreate, handleSubmit: handleCreateSubmit, formState: { errors: createErrors }, reset: resetCreateForm } = useForm<ParameterFormData>({
    resolver: zodResolver(parameterSchema),
  })

  const { register: registerEdit, handleSubmit: handleEditSubmit, formState: { errors: editErrors }, reset: resetEditForm, setValue: setEditValue } = useForm<ParameterFormData>({
    resolver: zodResolver(parameterSchema),
  })

  const onCreateParameter = (data: ParameterFormData) => {
    createParameterMutation.mutate(data)
  }

  const onEditParameter = (data: ParameterFormData) => {
    updateParameterMutation.mutate(data)
  }

  const startEdit = (param: AccountingParameter) => {
    setSelectedParameter(param)
    setEditValue('parameterCode', param.parameterCode)
    setEditValue('parameterValue', param.parameterValue)
    setEditValue('parameterType', param.parameterType)
    setEditValue('effectiveDate', param.effectiveDate)
    setEditValue('description', param.description || '')
    setEditValue('parameterName', param.parameterName || '')
    setShowEditModal(true)
  }

  const filteredParameters = parametersData.content?.filter((param: AccountingParameter) =>
    param.parameterCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    param.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const columns = [
    {
      key: 'parameterCode' as const,
      label: 'Parameter Code',
      render: (value: string) => (
        <span className="font-mono font-semibold text-gray-900 dark:text-white">{value}</span>
      )
    },
    {
      key: 'parameterValue' as const,
      label: 'Value',
      render: (value: string, item: AccountingParameter) => {
        if (item.parameterType === 'PERCENTAGE') return `${value}%`
        if (item.parameterType === 'NUMBER') return value
        return value
      }
    },
    {
      key: 'parameterType' as const,
      label: 'Type',
      render: (value: string) => <Badge variant="info">{value}</Badge>
    },
    {
      key: 'description' as const,
      label: 'Description',
      render: (value: string) => (
        <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">{value || '-'}</span>
      )
    },
    {
      key: 'effectiveDate' as const,
      label: 'Effective Date',
      render: (value: string) => formatDate(value)
    },
    {
      key: 'id' as const,
      label: 'Actions',
      render: (value: number, item: AccountingParameter) => (
        <div className="flex gap-2">
          <button
            onClick={() => startEdit(item)}
            className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition-colors"
            title="Edit parameter"
          >
            <Edit2 size={16} className="text-blue-600 dark:text-blue-400" />
          </button>
          <button
            onClick={() => getHistoryMutation.mutate(item.id)}
            className="p-1.5 hover:bg-orange-100 dark:hover:bg-orange-900/20 rounded transition-colors"
            title="View history"
          >
            <History size={16} className="text-orange-600 dark:text-orange-400" />
          </button>
          <button
            onClick={() => deleteParameterMutation.mutate(item.id)}
            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
            title="Delete parameter"
          >
            <Trash2 size={16} className="text-red-600 dark:text-red-400" />
          </button>
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Accounting Parameters</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Configure system accounting parameters and settings</p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            New Parameter
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Parameters</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{filteredParameters.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Percentage Parameters</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {filteredParameters.filter((p: AccountingParameter) => p.parameterType === 'PERCENTAGE').length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Number Parameters</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {filteredParameters.filter((p: AccountingParameter) => p.parameterType === 'NUMBER').length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Input
          placeholder="Search parameters..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Parameters Table */}
        <DataTable
          columns={columns}
          data={filteredParameters}
          isLoading={isLoading}
          page={page}
          pageSize={20}
          onPageChange={setPage}
          emptyMessage="No parameters configured"
        />
      </div>

      {/* Create Parameter Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          resetCreateForm()
        }}
        title="Create New Parameter"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateSubmit(onCreateParameter)} isLoading={createParameterMutation.isPending}>
              Create Parameter
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input
            label="Parameter Code"
            placeholder="e.g., TAX_RATE"
            {...registerCreate('parameterCode')}
            error={createErrors.parameterCode?.message}
          />

          <Select
            label="Parameter Type"
            {...registerCreate('parameterType')}
            error={createErrors.parameterType?.message}
            options={[
              { value: 'STRING', label: 'String' },
              { value: 'NUMBER', label: 'Number' },
              { value: 'PERCENTAGE', label: 'Percentage' },
              { value: 'DATE', label: 'Date' },
              { value: 'BOOLEAN', label: 'Boolean' },
            ]}
          />

          <Input
            label="Parameter Value"
            placeholder="e.g., 18 (for 18%)"
            {...registerCreate('parameterValue')}
            error={createErrors.parameterValue?.message}
          />

          <Textarea
            label="Description (Optional)"
            placeholder="Describe this parameter..."
            {...registerCreate('description')}
            rows={3}
          />
        </form>
      </Modal>

      {/* Edit Parameter Modal */}
      <Modal
        isOpen={showEditModal && selectedParameter !== null}
        onClose={() => {
          setShowEditModal(false)
          setSelectedParameter(null)
          resetEditForm()
        }}
        title={`Edit Parameter - ${selectedParameter?.parameterCode}`}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleEditSubmit(onEditParameter)} isLoading={updateParameterMutation.isPending}>
              Update Parameter
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input
            label="Parameter Code"
            disabled
            {...registerEdit('parameterCode')}
          />

          <Select
            label="Parameter Type"
            disabled
            {...registerEdit('parameterType')}
            options={[
              { value: 'STRING', label: 'String' },
              { value: 'NUMBER', label: 'Number' },
              { value: 'PERCENTAGE', label: 'Percentage' },
              { value: 'DATE', label: 'Date' },
              { value: 'BOOLEAN', label: 'Boolean' },
            ]}
          />

          <Input
            label="Parameter Value"
            {...registerEdit('parameterValue')}
            error={editErrors.parameterValue?.message}
          />

          <Textarea
            label="Description (Optional)"
            {...registerEdit('description')}
            rows={3}
          />

          <div className="text-xs text-gray-600 dark:text-gray-400">
            Last modified: {selectedParameter?.effectiveDate && formatDate(selectedParameter.effectiveDate)}
          </div>
        </form>
      </Modal>

      {/* Parameter History Modal */}
      <Modal
        isOpen={showHistoryModal}
        onClose={() => {
          setShowHistoryModal(false)
          setParameterHistory([])
        }}
        title={`Parameter History - ${selectedParameter?.parameterCode}`}
        size="lg"
      >
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {parameterHistory.length > 0 ? (
            parameterHistory.map((entry: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{entry.value}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{formatDate(entry.effectiveDate)}</p>
                </div>
                {entry.status && <Badge status={entry.status as any}>{entry.status}</Badge>}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600 dark:text-gray-400 py-8">No history available</p>
          )}
        </div>
      </Modal>
    </MainLayout>
  )
}

