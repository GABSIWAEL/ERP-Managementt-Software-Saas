import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, Button, Badge, Input, Select, Modal, DataTable } from '@components/ui'
import { MainLayout } from '@components/layout'
import { exitApi, employeeApi } from '@api/index'
import { ResignationRequest, Employee } from '@types'
import { formatDate, getFullName } from '@utils/helpers'
import { Plus, CheckCircle, Clock, Archive } from 'lucide-react'

const resignationSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required').transform(val => parseInt(val, 10)),
  resignationDate: z.string().min(1, 'Resignation date is required'),
  reason: z.string().optional(),
})

type ResignationFormData = z.infer<typeof resignationSchema>

const stageColors: Record<string, string> = {
  'SUBMITTED': 'info',
  'APPROVED_MANAGER': 'warning',
  'APPROVED_HR': 'warning',
  'COMPLETED': 'success',
  'REJECTED': 'danger',
}

export default function ExitManagementPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedResignation, setSelectedResignation] = useState<ResignationRequest | null>(null)
  const [showChecklistModal, setShowChecklistModal] = useState(false)

  // Fetch resignations
  const { data: resignationsData = { content: [] }, isLoading } = useQuery({
    queryKey: ['resignations', page, filterStatus],
    queryFn: async () => {
      const response = await exitApi.getAll(page, 20, filterStatus || undefined)
      return response
    }
  })

  // Fetch employees
  const { data: employees = [] } = useQuery({
    queryKey: ['employees-for-exit'],
    queryFn: async () => {
      const response = await employeeApi.getAll(0, 100)
      return response.content || response
    }
  })

  // Create resignation mutation
  const createResignationMutation = useMutation({
    mutationFn: (data: ResignationFormData) =>
      exitApi.submitResignation({
        ...data,
        employeeId: parseInt(data.employeeId)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resignations'] })
      setShowCreateModal(false)
      resetCreateForm()
    }
  })

  // Approve resignation mutation
  const approveResignationMutation = useMutation({
    mutationFn: (id: number) => exitApi.approveResignation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resignations'] })
    }
  })

  // Mark checklist item as done mutation
  const markChecklistMutation = useMutation({
    mutationFn: ({ checklistId, completed }: { checklistId: number; completed: boolean }) =>
      exitApi.markChecklistItem(checklistId, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resignations'] })
    }
  })

  const { register: registerCreate, handleSubmit: handleCreateSubmit, formState: { errors: createErrors }, reset: resetCreateForm } = useForm<ResignationFormData>({
    resolver: zodResolver(resignationSchema),
  })

  const onCreateResignation = (data: ResignationFormData) => {
    createResignationMutation.mutate(data)
  }

  const filteredResignations = resignationsData.content?.filter((r: ResignationRequest) =>
    getFullName(r.employee?.firstName, r.employee?.lastName).toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const columns = [
    {
      key: 'employee' as const,
      label: 'Employee',
      render: (value: Employee) => value ? `${value.firstName} ${value.lastName}` : '-'
    },
    {
      key: 'resignationDate' as const,
      label: 'Resignation Date',
      render: (value: string) => formatDate(value)
    },
    {
      key: 'submissionDate' as const,
      label: 'Submitted On',
      render: (value: string) => formatDate(value)
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: string) => <Badge status={stageColors[value] as any}>{value.replace(/_/g, ' ')}</Badge>
    },
    {
      key: 'checklistCompletion' as const,
      label: 'Checklist',
      render: (value: number, item: ResignationRequest) => (
        <div className="flex items-center gap-2">
          <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: `${value || 0}%` }}
            />
          </div>
          <span className="text-xs font-semibold">{value || 0}%</span>
          <button
            onClick={() => {
              setSelectedResignation(item)
              setShowChecklistModal(true)
            }}
            className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
          >
            Update
          </button>
        </div>
      )
    },
    {
      key: 'id' as const,
      label: 'Actions',
      render: (value: number, item: ResignationRequest) => (
        <div className="flex gap-2">
          {item.status === 'SUBMITTED' && (
            <button
              onClick={() => approveResignationMutation.mutate(item.id)}
              className="px-3 py-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors"
              title="Approve resignation"
            >
              Approve
            </button>
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Exit Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage employee resignations and exit procedures</p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            New Resignation
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Resignations</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{filteredResignations.length}</p>
                </div>
                <Archive className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {filteredResignations.filter((r: ResignationRequest) => r.status === 'SUBMITTED').length}
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
                    {filteredResignations.filter((r: ResignationRequest) => r.status === 'APPROVED_HR').length}
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {filteredResignations.filter((r: ResignationRequest) => r.status === 'COMPLETED').length}
                  </p>
                </div>
                <Archive className="text-green-600 dark:text-green-400" size={24} />
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
            <option value="SUBMITTED">Submitted</option>
            <option value="APPROVED_MANAGER">Manager Approved</option>
            <option value="APPROVED_HR">HR Approved</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Resignations Table */}
        <DataTable
          columns={columns}
          data={filteredResignations}
          isLoading={isLoading}
          page={page}
          pageSize={20}
          onPageChange={setPage}
          emptyMessage="No resignations"
        />

        {/* Exit Process Info */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Exit Process Pipeline</h3>
            <div className="flex items-center justify-between">
              {[
                { label: 'Submitted', icon: Clock },
                { label: 'Manager Approval', icon: CheckCircle },
                { label: 'HR Approval', icon: CheckCircle },
                { label: 'Checklist', icon: Archive },
                { label: 'Completed', icon: CheckCircle },
              ].map((stage, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-2">
                    <stage.icon className="text-blue-600 dark:text-blue-400" size={20} />
                  </div>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">{stage.label}</p>
                  {idx < 4 && (
                    <div className="w-8 h-1 bg-gray-300 dark:bg-gray-600 mt-2 -mr-8" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Resignation Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          resetCreateForm()
        }}
        title="Submit Resignation"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateSubmit(onCreateResignation)} isLoading={createResignationMutation.isPending}>
              Submit Resignation
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <Select
            label="Employee"
            {...registerCreate('employeeId')}
            error={createErrors.employeeId?.message}
            options={employees.map((emp: Employee) => ({
              value: emp.id.toString(),
              label: `${emp.firstName} ${emp.lastName}`
            }))}
          />

          <Input
            label="Last Working Date"
            type="date"
            {...registerCreate('resignationDate')}
            error={createErrors.resignationDate?.message}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason for Leaving (Optional)</label>
            <textarea
              placeholder="Describe reason for resignation..."
              rows={4}
              {...registerCreate('reason')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </form>
      </Modal>

      {/* Checklist Modal */}
      <Modal
        isOpen={showChecklistModal && selectedResignation !== null}
        onClose={() => {
          setShowChecklistModal(false)
          setSelectedResignation(null)
        }}
        title={`Exit Checklist - ${selectedResignation?.employee?.firstName} ${selectedResignation?.employee?.lastName}`}
        size="md"
      >
        {selectedResignation && (
          <div className="space-y-3">
            {[
              { id: 1, name: 'Payroll Processed', description: 'Final salary and benefits processed' },
              { id: 2, name: 'Leave Settlement', description: 'Remaining leave balance settled' },
              { id: 3, name: 'Assets Returned', description: 'All company assets returned' },
              { id: 4, name: 'System Access Revoked', description: 'Email and system access revoked' },
              { id: 5, name: 'Exit Interview Conducted', description: 'Exit interview completed' },
              { id: 6, name: 'Records Archived', description: 'Employee records archived' },
            ].map((item) => (
              <label key={item.id} className="flex items-start gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 mt-1"
                  onChange={(e) => {
                    if (e.target.checked) {
                      markChecklistMutation.mutate({ checklistId: item.id, completed: true })
                    }
                  }}
                  defaultChecked={selectedResignation.checklistItems?.find((c: any) => c.id === item.id)?.completed || false}
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                </div>
              </label>
            ))}
          </div>
        )}
      </Modal>
    </MainLayout>
  )
}

