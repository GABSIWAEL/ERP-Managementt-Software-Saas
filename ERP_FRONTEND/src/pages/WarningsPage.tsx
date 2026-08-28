import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, Button, Badge, Input, Select, Modal, DataTable, Textarea, ConfirmModal } from '@components/ui'
import { MainLayout } from '@components/layout'
import { warningApi, employeeApi } from '@api/index'
import { EmployeeWarning, Employee, UserRole, WarningStatus } from '@types'
import { useAuthStore } from '@store/authStore'
import { formatDate, getFullName } from '@utils/helpers'
import { Plus, AlertTriangle, CheckCircle, Eye, Zap, Clock, FileText } from 'lucide-react'

const warningSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  reason: z.string().min(1, 'Reason is required'),
  comments: z.string().optional(),
})

type WarningFormData = z.infer<typeof warningSchema>

const severityColors: Record<string, string> = {
  'LOW': 'info',
  'MEDIUM': 'warning',
  'HIGH': 'danger',
}

const statusColors: Record<string, string> = {
  'PENDING_HR_REVIEW': 'warning',
  'ESCALATED': 'danger',
  'REUNION_SCHEDULED': 'info',
  'RESOLVED': 'success',
  'CLOSED': 'secondary',
}

export default function WarningsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSeverity, setFilterSeverity] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedWarning, setSelectedWarning] = useState<EmployeeWarning | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showResolveConfirm, setShowResolveConfirm] = useState(false)
  const [showEscalateConfirm, setShowEscalateConfirm] = useState(false)
  const [showScheduleReunionModal, setShowScheduleReunionModal] = useState(false)
  const [showSubmitReportModal, setShowSubmitReportModal] = useState(false)
  const [reunionDateTime, setReunionDateTime] = useState('')
  const [reunionReport, setReunionReport] = useState('')

  // Fetch warnings
  const { data: warningsData = [], isLoading } = useQuery({
    queryKey: ['warnings', page, filterSeverity],
    queryFn: async () => {
      const response = await warningApi.getAll(page, 20, filterSeverity || undefined)
      return response
    }
  })

  // Fetch current employee profile so the department can be determined reliably
  const { user, hasRole } = useAuthStore()

  const { data: currentEmployeeData } = useQuery({
    queryKey: ['currentEmployeeProfile'],
    queryFn: async () => {
      try {
        return await employeeApi.getProfile()
      } catch {
        return null
      }
    }
  })

  const departmentId = currentEmployeeData?.departmentId ?? currentEmployeeData?.department?.id

  const { data: employees = [] } = useQuery({
    queryKey: ['employees-for-warnings', departmentId, hasRole(UserRole.MANAGER)],
    queryFn: async () => {
      if (hasRole(UserRole.MANAGER)) {
        if (!departmentId) return []
        const response = await employeeApi.getAll(0, 100, departmentId)
        return response.content || response
      }

      const response = await employeeApi.getAll(0, 100)
      return response.content || response
    },
    enabled: !hasRole(UserRole.MANAGER) || !!departmentId
  })

  // Create warning mutation
  const createWarningMutation = useMutation({
    mutationFn: (data: WarningFormData) =>
      warningApi.create(parseInt(data.employeeId), {
        severity: data.severity,
        reason: data.reason,
        comments: data.comments,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warnings'] })
      setShowCreateModal(false)
      resetCreateForm()
    }
  })

  // Resolve warning mutation
  const resolveWarningMutation = useMutation({
    mutationFn: (id: number) => warningApi.resolve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warnings'] })
      setShowResolveConfirm(false)
      setSelectedWarning(null)
    }
  })

  // Escalate warning mutation
  const escalateWarningMutation = useMutation({
    mutationFn: (id: number) => warningApi.escalate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warnings'] })
      setShowEscalateConfirm(false)
      setSelectedWarning(null)
    }
  })

  // Schedule reunion mutation
  const scheduleReunionMutation = useMutation({
    mutationFn: (data: { id: number; reunionScheduledAt: string }) =>
      warningApi.scheduleReunion(data.id, data.reunionScheduledAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warnings'] })
      setShowScheduleReunionModal(false)
      setReunionDateTime('')
      setSelectedWarning(null)
    }
  })

  // Submit reunion report mutation
  const submitReportMutation = useMutation({
    mutationFn: (data: { id: number; reunionReport: string }) =>
      warningApi.submitReport(data.id, data.reunionReport),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warnings'] })
      setShowSubmitReportModal(false)
      setReunionReport('')
      setSelectedWarning(null)
    }
  })

  const { register: registerCreate, handleSubmit: handleCreateSubmit, formState: { errors: createErrors }, reset: resetCreateForm } = useForm<WarningFormData>({
    resolver: zodResolver(warningSchema),
    defaultValues: {
      employeeId: '',
      severity: 'LOW',
      reason: '',
      comments: ''
    }
  })

  const onCreateWarning = (data: WarningFormData) => {
    createWarningMutation.mutate(data)
  }

  const filteredWarnings = (warningsData || []).filter((w: EmployeeWarning) => {
    const matchesSearch = (w.employeeName || getFullName(w.employee?.firstName, w.employee?.lastName)).toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !filterStatus || w.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const statusSteps = ['PENDING_HR_REVIEW', 'ESCALATED', 'REUNION_SCHEDULED', 'RESOLVED', 'CLOSED']
  const stageLabels: Record<string, string> = {
    PENDING_HR_REVIEW: 'Pending Review',
    ESCALATED: 'Escalated',
    REUNION_SCHEDULED: 'Reunion Scheduled',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
  }

  const employeeWarnings = selectedWarning
    ? (warningsData || []).filter((w: EmployeeWarning) => w.employeeId === selectedWarning.employeeId)
    : []

  const activeWarnings = filteredWarnings.filter((w: EmployeeWarning) => 
    w.status === 'PENDING_HR_REVIEW' || w.status === 'ESCALATED' || w.status === 'REUNION_SCHEDULED'
  )
  const resolvedWarnings = filteredWarnings.filter((w: EmployeeWarning) => 
    w.status === 'RESOLVED' || w.status === 'CLOSED'
  )

  const columns = [
    {
      key: 'employeeName' as const,
      label: 'Employee',
      render: (value: string, item: EmployeeWarning) =>
        value || (item.employee ? `${item.employee.firstName} ${item.employee.lastName}` : '-')
    },
    {
      key: 'severity' as const,
      label: 'Severity',
      render: (value: string) => <Badge status={severityColors[value] as any}>{value}</Badge>
    },
    {
      key: 'reason' as const,
      label: 'Reason',
      render: (value: string) => (
        <span className="truncate text-sm">{value}</span>
      )
    },
    {
      key: 'issuedDate' as const,
      label: 'Issued Date',
      render: (value: string) => formatDate(value)
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: string, item: EmployeeWarning) => (
        <div className="flex items-center gap-2">
          <Badge status={statusColors[value] as any}>{value}</Badge>
          
          {/* HR-only action buttons */}
          {hasRole(UserRole.HR) && (
            <div className="flex gap-1">
              {(value === 'PENDING_HR_REVIEW' || value === 'ESCALATED') && (
                <>
                  <button
                    onClick={() => {
                      setSelectedWarning(item)
                      setShowDetailModal(true)
                    }}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    title="View details"
                  >
                    <Eye size={16} className="text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedWarning(item)
                      setShowResolveConfirm(true)
                    }}
                    className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900/20 rounded transition-colors"
                    title="Resolve warning"
                  >
                    <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedWarning(item)
                      setShowEscalateConfirm(true)
                    }}
                    className="p-1.5 hover:bg-orange-100 dark:hover:bg-orange-900/20 rounded transition-colors"
                    title="Escalate warning"
                  >
                    <Zap size={16} className="text-orange-600 dark:text-orange-400" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedWarning(item)
                      setShowScheduleReunionModal(true)
                    }}
                    className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition-colors"
                    title="Schedule reunion"
                  >
                    <Clock size={16} className="text-blue-600 dark:text-blue-400" />
                  </button>
                </>
              )}
              
              {value === 'REUNION_SCHEDULED' && (
                <>
                  <button
                    onClick={() => {
                      setSelectedWarning(item)
                      setShowDetailModal(true)
                    }}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    title="View details"
                  >
                    <Eye size={16} className="text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedWarning(item)
                      setShowSubmitReportModal(true)
                    }}
                    className="p-1.5 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded transition-colors"
                    title="Submit report"
                  >
                    <FileText size={16} className="text-purple-600 dark:text-purple-400" />
                  </button>
                </>
              )}
            </div>
          )}

          {/* Manager actions - can only view and issue warnings */}
          {hasRole(UserRole.MANAGER) && (value === 'PENDING_HR_REVIEW' || value === 'ESCALATED') && (
            <button
              onClick={() => {
                setSelectedWarning(item)
                setShowDetailModal(true)
              }}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors ml-1"
              title="View details"
            >
              <Eye size={16} className="text-gray-600 dark:text-gray-400" />
            </button>
          )}

          {/* Admin actions */}
          {hasRole(UserRole.ADMIN) && (value === 'PENDING_HR_REVIEW' || value === 'ESCALATED') && (
            <>
              <button
                onClick={() => {
                  setSelectedWarning(item)
                  setShowDetailModal(true)
                }}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="View details"
              >
                <Eye size={16} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => {
                  setSelectedWarning(item)
                  setShowResolveConfirm(true)
                }}
                className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900/20 rounded transition-colors"
                title="Resolve warning"
              >
                <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
              </button>
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Employee Warnings</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage employee warnings and disciplinary actions</p>
          </div>
          {hasRole(UserRole.MANAGER) && (
            <Button
              variant="primary"
              size="md"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2"
            >
              <Plus size={18} />
              Issue Warning
            </Button>
          )}
        </div>

        {/* Workflow Guide - Only show for HR */}
        {hasRole(UserRole.HR) && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">📋 Warning Workflow</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-sm">
              <div className="bg-white dark:bg-gray-800 p-3 rounded border-2 border-blue-300 dark:border-blue-600">
                <p className="font-medium text-blue-900 dark:text-blue-100">1. Issue</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Manager creates warning</p>
              </div>
              <div className="flex items-center justify-center">→</div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded border-2 border-yellow-300 dark:border-yellow-600">
                <p className="font-medium text-yellow-900 dark:text-yellow-100">2. Review</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">HR decides next step</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">✓ Resolve | ⚡ Escalate | 🕐 Schedule</p>
              </div>
              <div className="flex items-center justify-center">→</div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded border-2 border-green-300 dark:border-green-600">
                <p className="font-medium text-green-900 dark:text-green-100">3. Close</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Submit report & mark closed</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Warnings</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{filteredWarnings.length}</p>
                </div>
                <AlertTriangle className="text-red-600 dark:text-red-400" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Review</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {filteredWarnings.filter((w: EmployeeWarning) => w.status === 'PENDING_HR_REVIEW' || w.status === 'ESCALATED').length}
                  </p>
                </div>
                <AlertTriangle className="text-orange-600 dark:text-orange-400" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scheduled Reunions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {filteredWarnings.filter((w: EmployeeWarning) => w.status === 'REUNION_SCHEDULED').length}
                  </p>
                </div>
                <Clock className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved/Closed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{resolvedWarnings.length}</p>
                </div>
                <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 w-full md:w-auto">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Severity</option>
              <option value="LOW">Verbal</option>
              <option value="MEDIUM">Written</option>
              <option value="HIGH">Final</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
              <option value="PENDING_HR_REVIEW">Pending HR Review</option>
              <option value="ESCALATED">Escalated</option>
              <option value="REUNION_SCHEDULED">Reunion Scheduled</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        {/* Pipeline Preview */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 mb-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Warning pipeline</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Select a warning and click the eye icon to open the detailed workflow stage view.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{selectedWarning ? `Selected: ${selectedWarning.employeeName || `${selectedWarning.employee?.firstName} ${selectedWarning.employee?.lastName}`}` : 'No warning selected'}</span>
              <Badge status={selectedWarning ? 'primary' : 'secondary'}>{selectedWarning ? 'Selected' : 'Waiting'}</Badge>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {statusSteps.map((step) => {
              const count = selectedWarning ? employeeWarnings.filter((warn) => warn.status === step).length : 0
              const isActive = selectedWarning?.status === step
              return (
                <div
                  key={step}
                  className={`rounded-xl border p-4 ${isActive ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/50' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'}`}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-600 dark:text-gray-400">{stageLabels[step]}</p>
                  <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">{count}</p>
                  {isActive && <p className="mt-2 text-xs font-medium text-blue-700 dark:text-blue-300">Current stage</p>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Warnings Table */}
        <DataTable
          columns={columns}
          data={filteredWarnings}
          isLoading={isLoading}
          page={page}
          pageSize={20}
          onPageChange={setPage}
          emptyMessage="No warnings issued"
        />
      </div>

      {/* Create Warning Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          resetCreateForm()
        }}
        title="Issue Employee Warning"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleCreateSubmit(onCreateWarning)} isLoading={createWarningMutation.isPending} disabled={employees.length === 0}>
                Issue Warning
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

          {hasRole(UserRole.MANAGER) && employees.length === 0 && (
            <p className="text-sm text-gray-500">No employees found for your department.</p>
          )}

          <Select
            label="Severity"
            {...registerCreate('severity')}
            error={createErrors.severity?.message}
            options={[
              { value: 'LOW', label: '⚠️ Verbal Warning' },
              { value: 'MEDIUM', label: '⚠️⚠️ Written Warning' },
              { value: 'HIGH', label: '⚠️⚠️⚠️ Final Warning' },
            ]}
          />

          <Textarea
            label="Reason"
            placeholder="Describe the reason for this warning..."
            {...registerCreate('reason')}
            error={createErrors.reason?.message}
            rows={4}
          />

          <Textarea
            label="Comments (Optional)"
            placeholder="Additional comments or notes..."
            {...registerCreate('comments')}
            rows={3}
          />
        </form>
      </Modal>

      {/* Warning Details Modal */}
      <Modal
        isOpen={showDetailModal && selectedWarning !== null}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedWarning(null)
        }}
        title={`Warning Details - ${selectedWarning?.employee?.firstName} ${selectedWarning?.employee?.lastName}`}
        size="md"
      >
        {selectedWarning && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-white">Severity</h4>
                <Badge status={severityColors[selectedWarning.severity] as any}>{selectedWarning.severity}</Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Issued on {formatDate(selectedWarning.issuedDate || '')}</p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Employee Warning Pipeline</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Stage view for all warnings on this employee</p>
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{employeeWarnings.length} total warning{employeeWarnings.length === 1 ? '' : 's'}</span>
              </div>
              <div className="space-y-2">
                {statusSteps.map((step) => {
                  const count = employeeWarnings.filter((warn) => warn.status === step).length
                  const isActive = selectedWarning.status === step
                  return (
                    <div
                      key={step}
                      className={`flex items-center justify-between gap-3 p-3 rounded-lg ${isActive ? 'border border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/50' : 'border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${isActive ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{stageLabels[step]}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{count} warning{count === 1 ? '' : 's'} in this stage</p>
                        </div>
                      </div>
                      {isActive && <Badge status="primary">Current</Badge>}
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Reason</h4>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedWarning.reason}</p>
            </div>

            {selectedWarning.comments && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Comments</h4>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedWarning.comments}</p>
              </div>
            )}

            {selectedWarning.status === 'RESOLVED' && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <p className="text-sm text-green-700 dark:text-green-300">
                  Resolved
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Resolve Confirmation Modal */}
      <ConfirmModal
        isOpen={showResolveConfirm}
        onClose={() => {
          setShowResolveConfirm(false)
          setSelectedWarning(null)
        }}
        onConfirm={() => {
          if (selectedWarning) {
            resolveWarningMutation.mutate(selectedWarning.id)
          }
        }}
        title="Resolve Warning"
        message={`Mark this warning for ${selectedWarning?.employee?.firstName} ${selectedWarning?.employee?.lastName} as resolved?`}
        confirmText="Resolve"
        isLoading={resolveWarningMutation.isPending}
      />

      {/* Escalate Confirmation Modal */}
      <ConfirmModal
        isOpen={showEscalateConfirm}
        onClose={() => {
          setShowEscalateConfirm(false)
          setSelectedWarning(null)
        }}
        onConfirm={() => {
          if (selectedWarning) {
            escalateWarningMutation.mutate(selectedWarning.id)
          }
        }}
        title="Escalate Warning"
        message={`Escalate this ${selectedWarning?.severity} warning for ${selectedWarning?.employee?.firstName} ${selectedWarning?.employee?.lastName}?`}
        confirmText="Escalate"
        isLoading={escalateWarningMutation.isPending}
      />

      {/* Schedule Reunion Modal */}
      <Modal
        isOpen={showScheduleReunionModal && selectedWarning !== null}
        onClose={() => {
          setShowScheduleReunionModal(false)
          setReunionDateTime('')
          setSelectedWarning(null)
        }}
        title="Schedule Reunion"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowScheduleReunionModal(false)}>Cancel</Button>
            <Button 
              variant="primary" 
              onClick={() => {
                if (selectedWarning && reunionDateTime) {
                  scheduleReunionMutation.mutate({
                    id: selectedWarning.id,
                    reunionScheduledAt: reunionDateTime
                  })
                }
              }}
              isLoading={scheduleReunionMutation.isPending}
              disabled={!reunionDateTime}
            >
              Schedule
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Schedule a reunion with {selectedWarning?.employee?.firstName} {selectedWarning?.employee?.lastName}
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Reunion Date & Time
            </label>
            <input
              type="datetime-local"
              value={reunionDateTime}
              onChange={(e) => setReunionDateTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </Modal>

      {/* Submit Reunion Report Modal */}
      <Modal
        isOpen={showSubmitReportModal && selectedWarning !== null}
        onClose={() => {
          setShowSubmitReportModal(false)
          setReunionReport('')
          setSelectedWarning(null)
        }}
        title="Submit Reunion Report"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowSubmitReportModal(false)}>Cancel</Button>
            <Button 
              variant="primary" 
              onClick={() => {
                if (selectedWarning && reunionReport) {
                  submitReportMutation.mutate({
                    id: selectedWarning.id,
                    reunionReport: reunionReport
                  })
                }
              }}
              isLoading={submitReportMutation.isPending}
              disabled={!reunionReport}
            >
              Submit
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Reunion Report
            </label>
            <Textarea
              value={reunionReport}
              onChange={(e) => setReunionReport(e.target.value)}
              placeholder="Describe the outcomes and results of the reunion..."
              rows={6}
            />
          </div>
        </div>
      </Modal>
    </MainLayout>
  )
}

