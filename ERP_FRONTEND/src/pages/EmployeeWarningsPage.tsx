import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, Button, Badge, Modal, DataTable } from '@components/ui'
import { MainLayout } from '@components/layout'
import { warningApi, employeeApi } from '@api/index'
import { EmployeeWarning } from '@types'
import { useAuthStore } from '@store/authStore'
import { formatDate } from '@utils/helpers'
import { AlertTriangle, Eye, Calendar, FileText } from 'lucide-react'
import { useState } from 'react'

const severityColors: Record<string, string> = {
  'LOW': 'info',
  'MEDIUM': 'warning',
  'HIGH': 'danger',
}

const statusColors: Record<string, string> = {
  'PENDING_HR_REVIEW': 'warning',
  'RESOLVED': 'success',
  'ESCALATED': 'danger',
  'REUNION_SCHEDULED': 'info',
  'CLOSED': 'secondary',
}

export default function EmployeeWarningsPage() {
  const { user } = useAuthStore()
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedWarning, setSelectedWarning] = useState<EmployeeWarning | null>(null)

  // Fetch current employee profile
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

  // Fetch warnings for current employee
  const { data: warningsData = [], isLoading } = useQuery({
    queryKey: ['myWarnings', currentEmployeeData?.id],
    queryFn: async () => {
      if (!currentEmployeeData?.id) return []
      try {
        const response = await warningApi.getByEmployee(currentEmployeeData.id)
        return response
      } catch {
        return []
      }
    },
    enabled: !!currentEmployeeData?.id
  })

  // Group warnings by status
  const upcomingReunions = warningsData.filter(
    (w: EmployeeWarning) => w.status === 'REUNION_SCHEDULED'
  )
  
  const resolvedWarnings = warningsData.filter(
    (w: EmployeeWarning) => w.status === 'RESOLVED' || w.status === 'CLOSED'
  )

  const pendingWarnings = warningsData.filter(
    (w: EmployeeWarning) => w.status === 'PENDING_HR_REVIEW' || w.status === 'ESCALATED'
  )

  const columns = [
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
      key: 'dateIssued' as const,
      label: 'Issued Date',
      render: (value: string) => formatDate(value)
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: string) => (
        <Badge status={statusColors[value] as any}>{value}</Badge>
      )
    },
    {
      key: 'actions' as const,
      label: 'Actions',
      render: (value: any, item: EmployeeWarning) => (
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
      )
    }
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Warnings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View your disciplinary warnings and scheduled reunions</p>
        </div>

        {/* Reunion Alerts */}
        {upcomingReunions.length > 0 && (
          <div className="space-y-3">
            {upcomingReunions.map((warning: EmployeeWarning) => (
              <div
                key={warning.id}
                className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  <Calendar className="text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" size={20} />
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">Scheduled Reunion</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                      You have a scheduled reunion on {formatDate(warning.reunionScheduledAt || '')} at {
                        new Date(warning.reunionScheduledAt || '').toLocaleTimeString()
                      }
                    </p>
                    {warning.hrComment && (
                      <p className="text-sm text-blue-700 dark:text-blue-200 mt-2">
                        <strong>HR Comment:</strong> {warning.hrComment}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Warnings</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{warningsData.length}</p>
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
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{pendingWarnings.length}</p>
                </div>
                <AlertTriangle className="text-orange-600 dark:text-orange-400" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming Reunions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{upcomingReunions.length}</p>
                </div>
                <Calendar className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{resolvedWarnings.length}</p>
                </div>
                <FileText className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Warnings Table */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Warning Details</h2>
            {warningsData.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-gray-600 dark:text-gray-400">No warnings on your record</p>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={warningsData}
                isLoading={isLoading}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Warning Details Modal */}
      <Modal
        isOpen={showDetailModal && selectedWarning !== null}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedWarning(null)
        }}
        title="Warning Details"
        size="md"
      >
        {selectedWarning && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-white">Severity</h4>
                <Badge status={severityColors[selectedWarning.severity] as any}>
                  {selectedWarning.severity}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Issued on {formatDate(selectedWarning.dateIssued || '')}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Status</h4>
              <Badge status={statusColors[selectedWarning.status] as any}>
                {selectedWarning.status}
              </Badge>
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

            {selectedWarning.hrComment && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">HR Comment</h4>
                <p className="text-sm text-blue-700 dark:text-blue-200">{selectedWarning.hrComment}</p>
              </div>
            )}

            {selectedWarning.reunionScheduledAt && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Scheduled Reunion</h4>
                <p className="text-sm text-blue-700 dark:text-blue-200">
                  {formatDate(selectedWarning.reunionScheduledAt)} at {
                    new Date(selectedWarning.reunionScheduledAt).toLocaleTimeString()
                  }
                </p>
              </div>
            )}

            {selectedWarning.reunionReport && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Reunion Report</h4>
                <p className="text-sm text-green-700 dark:text-green-200 whitespace-pre-wrap">
                  {selectedWarning.reunionReport}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </MainLayout>
  )
}
