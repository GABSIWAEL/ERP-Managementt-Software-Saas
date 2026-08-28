import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { MainLayout } from '@components/layout'
import { Card, CardContent, CardHeader, Button, Badge, Input } from '@components/ui'
import { accountingApi } from '@api/index'
import { Calculator, Sparkles, History, ShieldCheck, TrendingUp, Save, DollarSign, Workflow, BadgeCheck, Globe2, Settings2 } from 'lucide-react'

interface PayrollConfig {
  id?: number
  taxPercentage: number
  insurancePercentage: number
  overtimeRate: number
  bonusPercentage: number
  leavePayoutPercentage: number
  remoteAllowance: number
  createdAt?: string
  updatedAt?: string
}

const defaultConfig: PayrollConfig = {
  taxPercentage: 15,
  insurancePercentage: 7.5,
  overtimeRate: 2.5,
  bonusPercentage: 5,
  leavePayoutPercentage: 100,
  remoteAllowance: 120,
}

const ruleDefinitions = [
  { key: 'taxPercentage' as const, label: 'Income tax', description: 'Percentage applied to gross salary', unit: '%' },
  { key: 'insurancePercentage' as const, label: 'Insurance', description: 'Employer/employee insurance contribution', unit: '%' },
  { key: 'overtimeRate' as const, label: 'Overtime', description: 'Rate per overtime hour', unit: 'DT/h' },
  { key: 'bonusPercentage' as const, label: 'Bonus', description: 'Performance bonus percentage', unit: '%' },
  { key: 'leavePayoutPercentage' as const, label: 'Leave payout', description: 'Leave compensation percentage', unit: '%' },
  { key: 'remoteAllowance' as const, label: 'Remote allowance', description: 'Monthly remote work allowance', unit: 'DT' },
]

export default function PayrollStudioPage() {
  const [config, setConfig] = useState<PayrollConfig>(defaultConfig)
  const [sampleSalary, setSampleSalary] = useState(2500)
  const [sampleAllowance, setSampleAllowance] = useState(180)
  const [sampleOvertimeHours, setSampleOvertimeHours] = useState(8)
  const [saveMessage, setSaveMessage] = useState('')

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['payroll-studio-config'],
    queryFn: accountingApi.getParameters,
  })

  useEffect(() => {
    if (data) {
      setConfig({
        ...defaultConfig,
        ...data,
        taxPercentage: Number((data as PayrollConfig).taxPercentage ?? defaultConfig.taxPercentage),
        insurancePercentage: Number((data as PayrollConfig).insurancePercentage ?? defaultConfig.insurancePercentage),
        overtimeRate: Number((data as PayrollConfig).overtimeRate ?? defaultConfig.overtimeRate),
        bonusPercentage: Number((data as PayrollConfig).bonusPercentage ?? defaultConfig.bonusPercentage),
        leavePayoutPercentage: Number((data as PayrollConfig).leavePayoutPercentage ?? defaultConfig.leavePayoutPercentage),
        remoteAllowance: Number((data as PayrollConfig).remoteAllowance ?? defaultConfig.remoteAllowance),
      })
    }
  }, [data])

  const saveMutation = useMutation({
    mutationFn: async (nextConfig: PayrollConfig) => accountingApi.updateParameters(nextConfig),
    onSuccess: async (savedConfig) => {
      setConfig({ ...savedConfig })
      setSaveMessage('Payroll configuration saved to the backend.')
      await refetch()
    },
    onError: () => {
      setSaveMessage('The backend rejected the save. Please verify the server is running.')
    },
  })

  const preview = useMemo(() => {
    const gross = sampleSalary + sampleAllowance
    const tax = gross * (config.taxPercentage / 100)
    const insurance = gross * (config.insurancePercentage / 100)
    const overtime = sampleOvertimeHours * config.overtimeRate
    const bonus = gross * (config.bonusPercentage / 100)
    const leavePayout = gross * (config.leavePayoutPercentage / 100)
    const net = gross + config.remoteAllowance + bonus + leavePayout - tax - insurance - overtime

    return {
      gross,
      deductions: tax + insurance + overtime,
      bonus,
      leavePayout,
      net,
    }
  }, [config, sampleAllowance, sampleOvertimeHours, sampleSalary])

  const handleFieldChange = (key: keyof PayrollConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: Number(value) }))
  }

  const handleSave = () => {
    setSaveMessage('')
    saveMutation.mutate(config)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8 text-white shadow-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium backdrop-blur">
                <Sparkles size={16} /> Enterprise Payroll Studio
              </div>
              <h1 className="mt-4 text-3xl font-bold">A configurable payroll policy workspace for accountants</h1>
              <p className="mt-3 text-sm text-slate-300">
                This studio is built so accountants can manage payroll variables, rule values, templates, and preview scenarios without needing developers to modify the code whenever company policy or legislation changes.
              </p>
            </div>
            <Button variant="secondary" onClick={handleSave} className="bg-white text-slate-900 hover:bg-slate-100">
              <Save size={16} className="mr-2" /> {saveMutation.isPending ? 'Saving…' : 'Save configuration'}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Rule builder</p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">Live</p>
                </div>
                <Settings2 className="text-sky-600 dark:text-sky-400" size={22} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Templates</p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">Reusable</p>
                </div>
                <Workflow className="text-violet-600 dark:text-violet-400" size={22} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Validation</p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">Preview</p>
                </div>
                <BadgeCheck className="text-emerald-600 dark:text-emerald-400" size={22} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Country ready</p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">Multi</p>
                </div>
                <Globe2 className="text-amber-600 dark:text-amber-400" size={22} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Backend connection</p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">Live</p>
                </div>
                <Calculator className="text-blue-600 dark:text-blue-400" size={22} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Payroll values</p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{ruleDefinitions.length}</p>
                </div>
                <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={22} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Version tracking</p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">Enabled</p>
                </div>
                <History className="text-violet-600 dark:text-violet-400" size={22} />
              </div>
            </CardContent>
          </Card>
        </div>

        {saveMessage && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300">
            {saveMessage}
          </div>
        )}

        <Card>
          <CardContent className="pt-6">
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-200">
              <p className="font-semibold">How accountants will use this studio</p>
              <p className="mt-2">Adjust policy values, test scenarios, and save the configuration. The preview on the right will reflect the change immediately so finance teams can validate decisions before publishing them.</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Payroll rule configuration</h3>
                  <Badge variant="info">{isLoading ? 'Loading…' : 'Synced'}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {ruleDefinitions.map((rule) => (
                  <div key={rule.key} className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{rule.label}</h4>
                        <p className="mt-1 text-sm text-gray-500">{rule.description}</p>
                      </div>
                      <Badge variant="info">{rule.unit}</Badge>
                    </div>
                    <div className="mt-4">
                      <Input
                        label="Value"
                        type="number"
                        step="0.01"
                        value={config[rule.key]}
                        onChange={(e) => handleFieldChange(rule.key, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Simulation preview</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <Input label="Sample gross salary" type="number" value={sampleSalary} onChange={(e) => setSampleSalary(Number(e.target.value))} />
                  <Input label="Sample allowance" type="number" value={sampleAllowance} onChange={(e) => setSampleAllowance(Number(e.target.value))} />
                  <Input label="Overtime hours" type="number" value={sampleOvertimeHours} onChange={(e) => setSampleOvertimeHours(Number(e.target.value))} />
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Gross</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{preview.gross.toFixed(2)} DT</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-gray-500">Deductions</span>
                    <span className="font-semibold text-orange-600">{preview.deductions.toFixed(2)} DT</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-gray-500">Bonus</span>
                    <span className="font-semibold text-emerald-600">{preview.bonus.toFixed(2)} DT</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-gray-500">Estimated net</span>
                    <span className="font-semibold text-emerald-600">{preview.net.toFixed(2)} DT</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} />
                    This preview is recalculated from the values currently stored in the ERP accounting endpoint.
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Backend integration</h3>
              </CardHeader>
              <CardContent>
                <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <DollarSign size={16} className="text-primary-600" />
                    Save uses the ERP endpoint <span className="font-mono text-xs">/api/accounting-parameters</span>
                  </div>
                  <div className="mt-3 text-sm text-gray-500">
                    Any saved changes will immediately update the values available to the finance workspace.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
