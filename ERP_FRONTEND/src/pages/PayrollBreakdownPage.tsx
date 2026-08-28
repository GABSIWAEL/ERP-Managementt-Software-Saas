import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, Badge, Button, Select } from '@components/ui'
import { MainLayout } from '@components/layout'
import { payrollApi } from '@api/index'
import { Payroll, Employee } from '@types'
import { formatDate, formatCurrency, getFullName } from '@utils/helpers'
import { DollarSign, Download, BarChart3, TrendingUp } from 'lucide-react'

export default function PayrollSalaryBreakdownPage() {
  const currentDate = new Date()
  const [month, setMonth] = useState(currentDate.getMonth() + 1)
  const [year, setYear] = useState(currentDate.getFullYear())

  // Fetch payroll for the selected month/year
  const { data: payrollsData = { content: [] }, isLoading } = useQuery({
    queryKey: ['payroll-breakdown', month, year],
    queryFn: async () => {
      try {
        // The API returns paginated response with content array
        const response = await payrollApi.getByMonth?.(month, year)
        if (Array.isArray(response)) {
          return { content: response }
        }
        return response || { content: [] }
      } catch (error) {
        console.error('Failed to fetch payroll:', error)
        return { content: [] }
      }
    },
  })

  const payrols = Array.isArray(payrollsData) ? payrollsData : (payrollsData.content || [])

  // Calculate totals
  const totals = payrols.reduce(
      (acc: any, p: any) => ({
      baseSalary: acc.baseSalary + (p.baseSalary || 0),
      allowances: acc.allowances + (p.allowances || 0),
      deductions: acc.deductions + (p.deductions || 0),
      netSalary: acc.netSalary + (p.netSalary || 0),
    }),
    { baseSalary: 0, allowances: 0, deductions: 0, netSalary: 0 }
  )

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2024, i).toLocaleString('default', { month: 'long' }),
  }))

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: currentDate.getFullYear() - i,
    label: (currentDate.getFullYear() - i).toString(),
  }))

  const handleExport = () => {
    // Generate CSV export
    const headers = ['Employee', 'Position', 'Base Salary', 'Allowances', 'Deductions', 'Net Salary']
    const rows = payrols.map((p: any) => [
      getFullName(p.employee?.firstName, p.employee?.lastName),
      p.employee?.position || 'N/A',
      formatCurrency(p.baseSalary || 0),
      formatCurrency(p.allowances || 0),
      formatCurrency(p.deductions || 0),
      formatCurrency(p.netSalary || 0),
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payroll-${month}-${year}.csv`
    a.click()
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payroll Salary Breakdown</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Detailed breakdown of employee salaries and benefits</p>
          </div>
          <Button
            variant="primary"
            onClick={handleExport}
            disabled={payrols.length === 0}
            className="flex items-center gap-2"
          >
            <Download size={18} />
            Export as CSV
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Month
                </label>
                <Select
                  value={month.toString()}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  options={months.map(m => ({ value: m.value.toString(), label: m.label }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Year
                </label>
                <Select
                  value={year.toString()}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  options={years.map(y => ({ value: y.value.toString(), label: y.label }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Base Salary</p>
                <DollarSign size={20} className="text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totals.baseSalary)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Across {payrols.length} employees
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Allowances</p>
                <TrendingUp size={20} className="text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totals.allowances)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Average: {formatCurrency(totals.allowances / payrols.length || 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Deductions</p>
                <BarChart3 size={20} className="text-red-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totals.deductions)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Average: {formatCurrency(totals.deductions / payrols.length || 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Net Payable</p>
                <DollarSign size={20} className="text-primary-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totals.netSalary)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Total payroll amount
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Table */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Employee-wise Breakdown
            </h2>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading payroll data...</div>
            ) : payrols.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No payroll records for {months.find(m => m.value === month)?.label} {year}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Employee
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Position
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Base Salary
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Allowances
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Deductions
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Net Salary
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrols.map((payroll: any) => (
                      <tr
                        key={payroll.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="py-4 px-4 text-gray-900 dark:text-white font-medium">
                          {getFullName(payroll.employee?.firstName, payroll.employee?.lastName)}
                        </td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                          {payroll.employee?.position || 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-right text-gray-900 dark:text-white font-medium">
                          {formatCurrency(payroll.baseSalary || 0)}
                        </td>
                        <td className="py-4 px-4 text-right text-gray-900 dark:text-white">
                          {formatCurrency(payroll.allowances || 0)}
                        </td>
                        <td className="py-4 px-4 text-right text-gray-900 dark:text-white">
                          {formatCurrency(payroll.deductions || 0)}
                        </td>
                        <td className="py-4 px-4 text-right text-gray-900 dark:text-white font-bold">
                          {formatCurrency(payroll.netSalary || 0)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Badge
                            variant={payroll.isLocked ? 'success' : 'warning'}
                          >
                            {payroll.isLocked ? 'Locked' : 'Unlocked'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 font-bold">
                      <td colSpan={2} className="py-4 px-4 text-gray-900 dark:text-white">
                        TOTAL
                      </td>
                      <td className="py-4 px-4 text-right text-gray-900 dark:text-white">
                        {formatCurrency(totals.baseSalary)}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-900 dark:text-white">
                        {formatCurrency(totals.allowances)}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-900 dark:text-white">
                        {formatCurrency(totals.deductions)}
                      </td>
                      <td className="py-4 px-4 text-right text-primary-600 dark:text-primary-400">
                        {formatCurrency(totals.netSalary)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

