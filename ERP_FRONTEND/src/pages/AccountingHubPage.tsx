import { useNavigate } from 'react-router-dom'
import { MainLayout } from '@components/layout'
import { Card, CardContent, CardHeader, Button } from '@components/ui'
import {
  Calculator,
  FileSpreadsheet,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Landmark,
  Workflow,
  Settings2,
  FileBarChart2,
  BadgeCheck,
  Globe2,
} from 'lucide-react'

const quickActions = [
  { title: 'Payroll', description: 'Review salary runs, status, and approvals', path: '/payroll', icon: Calculator },
  { title: 'Payroll Studio', description: 'Design policy rules, formulas, and templates', path: '/payroll-studio', icon: Sparkles },
  { title: 'Reports', description: 'Open financial, payroll, and audit reports', path: '/reports', icon: FileSpreadsheet },
  { title: 'Audit Trail', description: 'Track every rule change and approval', path: '/audit-logs', icon: ShieldCheck },
]

const focusAreas = [
  {
    title: 'Payroll design',
    description: 'Create configurable rules for tax, insurance, bonuses, allowances, loans, advances, overtime, and leave.',
    icon: Calculator,
    bullets: ['Variables', 'Formulas', 'Dependencies', 'Conditional logic', 'Versioning'],
  },
  {
    title: 'Accounting setup',
    description: 'Configure chart of accounts, journal types, cost centers, fiscal years, periods, and tax rules.',
    icon: Landmark,
    bullets: ['Chart of accounts', 'Journal types', 'Cost centers', 'Periods & fiscal years', 'Tax rules'],
  },
  {
    title: 'Governance & control',
    description: 'Preview calculations, validate formulas, simulate changes, and preserve full auditability.',
    icon: ShieldCheck,
    bullets: ['Simulation', 'Validation', 'Preview', 'Approval flow', 'Audit log'],
  },
]

export default function AccountingHubPage() {
  const navigate = useNavigate()

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8 text-white shadow-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium backdrop-blur">
                <Sparkles size={16} /> Enterprise Finance Center
              </div>
              <h1 className="mt-4 text-3xl font-bold">A professional accounting and payroll command center for accountants</h1>
              <p className="mt-3 text-sm text-slate-300">
                This workspace is designed so accountants can own payroll policies, accounting configuration, and reporting without asking developers to change code every time regulations or company rules change.
              </p>
            </div>
            <Button variant="secondary" onClick={() => navigate('/payroll-studio')} className="bg-white text-slate-900 hover:bg-slate-100">
              Open Payroll Studio <ArrowRight size={16} />
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500">Payroll engine</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">Configurable</p>
              <p className="mt-1 text-sm text-gray-500">Define variables, formulas, dependencies, and rules</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500">Accounting setup</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">Enterprise</p>
              <p className="mt-1 text-sm text-gray-500">Create accounts, periods, journals, tax, and centers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500">Governance</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">Audit-ready</p>
              <p className="mt-1 text-sm text-gray-500">Track every change with full traceability</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          {focusAreas.map((area) => {
            const Icon = area.icon
            return (
              <Card key={area.title} className="h-full">
                <CardHeader>
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                    <Icon size={18} />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">{area.title}</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{area.description}</p>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    {area.bullets.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Core accountant workflows</h3>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.title}
                    onClick={() => navigate(action.path)}
                    className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-5 text-left transition hover:border-primary-400 hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-primary-100 p-2 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                          <Icon size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{action.title}</p>
                          <p className="text-sm text-gray-500">{action.description}</p>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-gray-400" />
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Professional module scope</h3>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {[
                'Payroll variables and formulas',
                'Templates and versioning',
                'Conditional rules and dependencies',
                'Chart of accounts',
                'Journal entries and ledgers',
                'Trial balance, P&L, and cash flow',
                'Receivables, payables, and assets',
                'VAT/tax and country templates',
                'Excel/PDF reporting and audit history',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4 text-sm text-gray-600 dark:text-gray-300">
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Recommended flow</h3>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-200">
              <ol className="list-decimal space-y-2 pl-5">
                <li>Review current payroll and accounting configuration.</li>
                <li>Open Payroll Studio to design or update policy rules.</li>
                <li>Validate and preview the impact before saving.</li>
                <li>Generate reports and keep the change history for audit review.</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
