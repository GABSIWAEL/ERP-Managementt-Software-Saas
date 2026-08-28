import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, Button, Badge, Input, Modal, DataTable, ConfirmModal } from '@components/ui'
import { MainLayout } from '@components/layout'
import { payrollApi } from '@api/index'
import { Payroll } from '@types'
import { formatDate, formatCurrency } from '@utils/helpers'
import { Plus, Lock, Unlock, DollarSign, TrendingUp, Eye, Trash2 } from 'lucide-react'

export default function PayrollPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [searchTerm, setSearchTerm] = useState('')
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Payroll | null>(null)

  // Fetch payrolls
  const { data: payrollsData = [], isLoading, refetch } = useQuery({
    queryKey: ['payroll', selectedMonth],
    queryFn: async () => {
      const [year, month] = selectedMonth.split('-')
      const response = await payrollApi.getByMonth(parseInt(month), parseInt(year))
      return response
    }
  })

  // Generate payroll mutation
  const generatePayrollMutation = useMutation({
    mutationFn: async () => {
      const [year, month] = selectedMonth.split('-')
      return payrollApi.generate({ month: parseInt(month), year: parseInt(year) })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] })
      setShowGenerateModal(false)
    }
  })

  // Lock payroll mutation
  const lockPayrollMutation = useMutation({
    mutationFn: (id: number) => payrollApi.lock(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] })
    }
  })

  // Unlock payroll mutation
  const unlockPayrollMutation = useMutation({
    mutationFn: (id: number) => payrollApi.unlock(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] })
    }
  })

  // Delete payroll mutation
  const deletePayrollMutation = useMutation({
    mutationFn: (id: number) => payrollApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] })
      setDeleteConfirm(null)
    }
  })

  const filteredPayrolls = payrollsData?.filter((p: Payroll) =>
    p.employee?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.employee?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.employee?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const totalBaseSalary = filteredPayrolls.reduce((sum: number, p: Payroll) => sum + (p.baseSalary || 0), 0)
  const totalDeductions = filteredPayrolls.reduce((sum: number, p: Payroll) => sum + (p.deductions || 0), 0)
  const totalNetSalary = filteredPayrolls.reduce((sum: number, p: Payroll) => sum + (p.netSalary || 0), 0)

  const columns = [
    {
      key: 'employee' as const,
      label: 'Employee',
      render: (value: any) => value ? `${value.firstName} ${value.lastName}` : '-'
    },
    {
      key: 'baseSalary' as const,
      label: 'Base Salary',
      render: (value: number) => formatCurrency(value)
    },
    {
      key: 'allowances' as const,
      label: 'Allowances',
      render: (value: number) => formatCurrency(value)
    },
    {
      key: 'deductions' as const,
      label: 'Deductions',
      render: (value: number) => formatCurrency(value)
    },
    {
      key: 'netSalary' as const,
      label: 'Net Salary',
      render: (value: number) => (
        <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(value)}</span>
      )
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: string, item: Payroll) => (
        <div className="flex items-center gap-2">
          <Badge status={value as any}>{value}</Badge>
          {value === 'DRAFT' && (
            <>
              <button
                onClick={() => lockPayrollMutation.mutate(item.id)}
                className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition-colors"
                title="Lock payroll"
              >
                <Lock size={16} className="text-blue-600 dark:text-blue-400" />
              </button>
              <button
                onClick={() => {
                  setSelectedPayroll(item)
                  setShowDetailModal(true)
                }}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="View details"
              >
                <Eye size={16} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => setDeleteConfirm(item)}
                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                title="Delete payroll"
              >
                <Trash2 size={16} className="text-red-600 dark:text-red-400" />
              </button>
            </>
          )}
          {value === 'LOCKED' && (
            <>
              <button
                onClick={() => unlockPayrollMutation.mutate(item.id)}
                className="p-1.5 hover:bg-orange-100 dark:hover:bg-orange-900/20 rounded transition-colors"
                title="Unlock payroll"
              >
                <Unlock size={16} className="text-orange-600 dark:text-orange-400" />
              </button>
              <button
                onClick={() => {
                  setSelectedPayroll(item)
                  setShowDetailModal(true)
                }}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="View details"
              >
                <Eye size={16} className="text-gray-600 dark:text-gray-400" />
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payroll Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Generate, process, and manage employee payroll</p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            Generate Payroll
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{filteredPayrolls.length}</p>
                </div>
                <DollarSign className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Base Salary</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1 truncate">{formatCurrency(totalBaseSalary)}</p>
                </div>
                <TrendingUp className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Deductions</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1 truncate">{formatCurrency(totalDeductions)}</p>
                </div>
                <TrendingUp className="text-orange-600 dark:text-orange-400" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Net Salary</p>
                  <p className="text-xl font-bold text-green-700 dark:text-green-400 mt-1 truncate">{formatCurrency(totalNetSalary)}</p>
                </div>
                <DollarSign className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value)
              setPage(0)
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        {/* Payroll Table */}
        <DataTable
          columns={columns}
          data={filteredPayrolls}
          isLoading={isLoading}
          page={page}
          pageSize={20}
          onPageChange={setPage}
          emptyMessage="No payroll records found. Generate payroll for this month."
        />
      </div>

      {/* Generate Payroll Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Generate Payroll"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowGenerateModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => generatePayrollMutation.mutate()} isLoading={generatePayrollMutation.isPending}>
              Generate
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Month & Year</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              This will generate payroll records for all active employees based on their salary and configured deductions/allowances.
            </p>
          </div>
        </div>
      </Modal>

      {/* Payroll Details Modal */}
      <Modal
        isOpen={showDetailModal && selectedPayroll !== null}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedPayroll(null)
        }}
        title={`Payroll Details - ${selectedPayroll?.employee?.firstName} ${selectedPayroll?.employee?.lastName}`}
        size="md"
      >
        {selectedPayroll && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Base Salary</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(selectedPayroll.baseSalary)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Allowances</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(selectedPayroll.allowances)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Deductions</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(selectedPayroll.deductions || 0)}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                <p className="text-xs font-medium text-green-700 dark:text-green-300">Net Salary</p>
                <p className="text-lg font-bold text-green-700 dark:text-green-400 mt-1">{formatCurrency(selectedPayroll.netSalary)}</p>
              </div>
            </div>

            {/* Deduction breakdown */}
            {selectedPayroll.deductions && selectedPayroll.deductions.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Deduction Breakdown</h4>
                <div className="space-y-2">
                  {selectedPayroll.deductions.map((ded: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{ded.type || 'Deduction'}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(ded.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Generated date */}
            {selectedPayroll.generatedDate && (
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Generated: {formatDate(selectedPayroll.generatedDate)}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            deletePayrollMutation.mutate(deleteConfirm.id)
          }
        }}
        title="Delete Payroll"
        message={`Delete payroll for ${deleteConfirm?.employee?.firstName} ${deleteConfirm?.employee?.lastName}? This action cannot be undone.`}
        confirmText="Delete"
        isDangerous
        isLoading={deletePayrollMutation.isPending}
      />
    </MainLayout>
  )
}

