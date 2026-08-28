import { MainLayout } from '@components/layout'
import { Card, CardContent, CardHeader } from '@components/ui'

function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{description}</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">Coming soon...</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">This module is currently under development</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

export function AttendancePage() {
  return <PlaceholderPage title="Attendance" description="Track and manage employee attendance" />
}

export function LeavesPage() {
  return <PlaceholderPage title="Leave Requests" description="Manage and approve leave requests" />
}

export function RemoteWorkPage() {
  return <PlaceholderPage title="Remote Work" description="Track remote work requests and assignments" />
}

export function PayrollPage() {
  return <PlaceholderPage title="Payroll" description="Manage salary and payroll processing" />
}

export function PerformancePage() {
  return <PlaceholderPage title="Performance" description="Track employee performance evaluations" />
}

export function WarningsPage() {
  return <PlaceholderPage title="Warnings" description="Manage employee warnings and discipline" />
}

export function AssetsPage() {
  return <PlaceholderPage title="Assets" description="Track company assets and equipment" />
}

export function EventsPage() {
  return <PlaceholderPage title="Events" description="Manage company events and celebrations" />
}

export function HolidaysPage() {
  return <PlaceholderPage title="Holidays" description="Manage company holidays" />
}

export function RecruitmentPage() {
  return <PlaceholderPage title="Recruitment" description="Manage job candidates and hiring" />
}

export function ReportsPage() {
  return <PlaceholderPage title="Reports" description="View and export business reports" />
}

export function AuditLogsPage() {
  return <PlaceholderPage title="Audit Logs" description="View system activity and audit trail" />
}

export function SettingsPage() {
  return <PlaceholderPage title="Settings" description="Manage system settings and configuration" />
}
