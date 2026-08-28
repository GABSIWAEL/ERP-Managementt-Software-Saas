import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, Button, Badge, Input, Select, DataTable } from '@components/ui'
import { MainLayout } from '@components/layout'
import { auditApi } from '@api/index'
import { AuditLog } from '@types'
import { formatDateTime } from '@utils/helpers'
import { Filter, Download, RefreshCw } from 'lucide-react'

export default function AuditLogsPage() {
  const [page, setPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState<string>('')
  const [filterEntity, setFilterEntity] = useState<string>('')
  const [filterUser, setFilterUser] = useState<string>('')

  // Fetch audit logs
  const { data: logsData = { content: [] }, isLoading, refetch } = useQuery({
    queryKey: ['audit-logs', page, filterAction, filterEntity, filterUser],
    queryFn: async () => {
      let response
      if (filterAction) {
        response = await auditApi.getByAction(filterAction, page, 50)
      } else if (filterEntity) {
        response = await auditApi.getByEntity(filterEntity, page, 50)
      } else if (filterUser) {
        response = await auditApi.getByUser(filterUser, page, 50)
      } else {
        response = await auditApi.getAll(page, 50)
      }
      return response
    }
  })

  // Auto-refresh when page loads and every 30 seconds
  useEffect(() => {
    refetch()
    const interval = setInterval(() => {
      refetch()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [refetch])

  const logs = Array.isArray(logsData) ? logsData : (logsData.content || [])

  const filteredLogs = logs.filter((log: AuditLog) =>
    log.performedBy?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
    log.action?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
    log.entityName?.toLowerCase()?.includes(searchTerm.toLowerCase())
  )

  const actionColors: Record<string, string> = {
    'CREATE': 'success',
    'READ': 'info',
    'UPDATE': 'warning',
    'DELETE': 'danger',
    'LOGIN': 'info',
    'LOGOUT': 'info',
    'CREATED': 'success',
    'UPDATED': 'warning',
    'DELETED': 'danger',
  }

  // Helper to get color for any action type
  const getActionColorByContent = (action: string) => {
    const lower = action.toLowerCase()
    if (lower.includes('create') || lower.includes('created')) return 'success'
    if (lower.includes('update') || lower.includes('updated')) return 'warning'
    if (lower.includes('delete') || lower.includes('deleted')) return 'danger'
    if (lower.includes('read') || lower.includes('get')) return 'info'
    if (lower.includes('login')) return 'info'
    if (lower.includes('logout')) return 'info'
    return 'secondary'
  }

  const columns = [
    {
      key: 'timestamp' as const,
      label: 'Timestamp',
      render: (value: string) => formatDateTime(value)
    },
    {
      key: 'performedBy' as const,
      label: 'User',
      render: (value: string) => (
        <span className="font-medium text-gray-900 dark:text-white">{value || 'SYSTEM'}</span>
      )
    },
    {
      key: 'action' as const,
      label: 'Action',
      render: (value: string) => (
        <Badge status={getActionColorByContent(value) as any}>{value}</Badge>
      )
    },
    {
      key: 'entityName' as const,
      label: 'Entity',
      render: (value: string) => (
        <span className="text-gray-700 dark:text-gray-300">{value}</span>
      )
    },
    {
      key: 'id' as const,
      label: 'Entity ID',
      render: (value: number) => (
        <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{value || '-'}</span>
      )
    },
    {
      key: 'details' as const,
      label: 'Changes',
      render: (value: string) => {
        if (!value) return '-'
        return (
          <details className="cursor-pointer">
            <summary className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              View Changes
            </summary>
            <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded text-xs text-gray-700 dark:text-gray-300 font-mono whitespace-pre-wrap break-words max-w-sm">
              {value}
            </div>
          </details>
        )
      }
    },
    {
      key: 'ipAddress' as const,
      label: 'IP Address',
      render: (value: string) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">{value || '-'}</span>
      )
    },
  ]

  // Calculate stats based on action content matching
  const createCount = logs.filter((l: AuditLog) => l.action?.toLowerCase().includes('create')).length
  const updateCount = logs.filter((l: AuditLog) => l.action?.toLowerCase().includes('update')).length
  const deleteCount = logs.filter((l: AuditLog) => l.action?.toLowerCase().includes('delete')).length
  const totalCount = logs.length

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track system activities and user actions</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="md"
              className="flex items-center gap-2"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button
              variant="secondary"
              size="md"
              className="flex items-center gap-2"
            >
              <Download size={18} />
              Export Logs
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Logs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Create Actions</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{createCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Update Actions</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{updateCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Delete Actions</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{deleteCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Filter size={18} />
              Filters
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search by user, action, entity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="READ">Read</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
            </select>

            <Input
              placeholder="Filter by user"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
            />

            <div>
              <button
                onClick={() => {
                  setFilterAction('')
                  setFilterEntity('')
                  setFilterUser('')
                  setSearchTerm('')
                  setPage(0)
                }}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <DataTable
          columns={columns}
          data={filteredLogs}
          isLoading={isLoading}
          page={page}
          pageSize={50}
          onPageChange={setPage}
          emptyMessage="No audit logs found"
        />

        {/* Recent Activity Summary */}
        {logs && logs.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Activity Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries({
                  'CREATED': logs.filter((l: AuditLog) => l.action?.toLowerCase().includes('create')).length,
                  'UPDATED': logs.filter((l: AuditLog) => l.action?.toLowerCase().includes('update')).length,
                  'DELETED': logs.filter((l: AuditLog) => l.action?.toLowerCase().includes('delete')).length,
                  'LOGIN': logs.filter((l: AuditLog) => l.action?.toLowerCase().includes('login')).length,
                  'LOGOUT': logs.filter((l: AuditLog) => l.action?.toLowerCase().includes('logout')).length,
                  'READ': logs.filter((l: AuditLog) => l.action?.toLowerCase().includes('read')).length,
                }).map(([action, count]) => (
                  <div key={action} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{action}</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{count}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}

