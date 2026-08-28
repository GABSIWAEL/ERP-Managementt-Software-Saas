import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProtectedRoute } from '@components/ProtectedRoute'
import { useThemeStore } from '@store/themeStore'
import { useAuthStore } from '@store/authStore'
import { UserRole } from '@types'
import LoginPage from '@pages/LoginPage'
import DashboardPage from '@pages/DashboardPage'
import AdminDashboard from '@pages/dashboards/AdminDashboard'
import HRDashboard from '@pages/dashboards/HRDashboard'
import ManagerDashboard from '@pages/dashboards/ManagerDashboard'
import EmployeeDashboard from '@pages/dashboards/EmployeeDashboard'
import AccountantDashboard from '@pages/dashboards/AccountantDashboard'
import ChangePasswordPage from '@pages/ChangePasswordPage'
import UnauthorizedPage from '@pages/UnauthorizedPage'
import EmployeesPage from '@pages/EmployeesPage'
import EmployeeProfilePage from '@pages/EmployeeProfilePage'
import EmployeeDetailPage from '@pages/EmployeeDetailPage'
import EmployeeEditPage from '@pages/EmployeeEditPage'
import CreateEmployeePage from '@pages/CreateEmployeePage'
import DepartmentsPage from '@pages/DepartmentsPage'
import AttendancePage from '@pages/AttendancePage'
import DepartmentDashboard from '@pages/DepartmentDashboard'
import MembersPage from '@pages/MembersPage'
import LeavesPage from '@pages/LeavesPage'
import LeaveBalanceTrackerPage from '@pages/LeaveBalanceTrackerPage'
import RemoteWorkPage from '@pages/RemoteWorkPage'
import PayrollPage from '@pages/PayrollPage'
import PayrollStudioPage from '@pages/PayrollStudioPage'
import PayrollBreakdownPage from '@pages/PayrollBreakdownPage'
import PerformancePage from '@pages/PerformancePage'
import WarningsPage from '@pages/WarningsPage'
import EmployeeWarningsPage from '@pages/EmployeeWarningsPage'
import AssetsPage from '@pages/AssetsPage'
import AssetRequestsPage from '@pages/AssetRequestsPage'
import MyAssetsPage from '@pages/MyAssetsPage'
import EventsPage from '@pages/EventsPage'
import HolidaysPage from '@pages/HolidaysPage'
import AdminRecruitmentPage from '@pages/AdminRecruitmentPage'
import PublicRecruitmentPage from '@pages/PublicRecruitmentPage'
import RecruitmentPage from '@pages/RecruitmentPage'
import ReportsPage from '@pages/ReportsPage'
import AuditLogsPage from '@pages/AuditLogsPage'
import AccountingParametersPage from '@pages/AccountingParametersPage'
import AccountingHubPage from '@pages/AccountingHubPage'
import ExitPage from '@pages/ExitPage'
import TeamsPage from '@pages/TeamsPage'
import TeamDetailPage from '@pages/TeamDetailPage'
import TasksPage from '@pages/TasksPage'
import NotFoundPage from '@pages/NotFoundPage'
import { SettingsPage } from '@pages/PlaceholderPages'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
})

/**
 * Role-based dashboard router
 * Directs users to their role-specific dashboard
 */
function RoleBasedDashboard() {
  const { user } = useAuthStore()
  
  if (!user?.role) return <DashboardPage />
  
  switch (user.role) {
    case UserRole.ADMIN:
      return <AdminDashboard />
    case UserRole.HR:
      return <HRDashboard />
    case UserRole.MANAGER:
      return <ManagerDashboard />
    case UserRole.ACCOUNTANT:
      return <AccountantDashboard />
    case UserRole.EMPLOYEE:
      return <EmployeeDashboard />
    default:
      return <DashboardPage />
  }
}

function App() {
  const { isDark } = useThemeStore()
  const { initializeAuth, isLoading: authLoading } = useAuthStore()
  const [authInitialized, setAuthInitialized] = useState(false)

  // Initialize auth state from cookies on app load
  useEffect(() => {
    const initAuth = async () => {
      await initializeAuth()
      setAuthInitialized(true)
    }
    initAuth()
  }, [initializeAuth])

  // Show loading while auth is initializing
  if (!authInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-500 animate-pulse mb-4">
            <div className="text-white font-bold">ERP</div>
          </div>
          <p className="text-gray-700 dark:text-gray-300">Initializing...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={isDark ? 'dark' : ''}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<LoginPage />} />
            <Route
              path="/change-password"
              element={
                <ProtectedRoute allowPasswordChange={true}>
                  <ChangePasswordPage />
                </ProtectedRoute>
              }
            />

            {/* Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Employee Routes */}
            <Route
              path="/employees"
              element={
                <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.HR, UserRole.MANAGER]}>
                  <EmployeesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees/:id"
              element={
                <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.HR, UserRole.MANAGER]}>
                  <EmployeeDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees/:id/edit"
              element={
                <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.HR]}>
                  <EmployeeEditPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees/new"
              element={
                <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.HR]}>
                  <CreateEmployeePage />
                </ProtectedRoute>
              }
            />

            {/* Department Routes */}
            <Route
              path="/departments"
              element={
                <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.HR, UserRole.MANAGER]}>
                  <DepartmentsPage />
                </ProtectedRoute>
              }
            />

            {/* Other Module Routes */}
            <Route
              path="/attendance"
              element={
                <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.EMPLOYEE]}>
                  <AttendancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-department"
              element={
                <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE, UserRole.HR]}>
                  <DepartmentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/members"
              element={
                <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE, UserRole.HR]}>
                  <MembersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaves"
              element={
                <ProtectedRoute>
                  <LeavesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/remote-work"
              element={
                <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.EMPLOYEE]}>
                  <RemoteWorkPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll"
              element={
                <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.HR, UserRole.ACCOUNTANT]}>
                  <PayrollPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll-studio"
              element={
                <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.ACCOUNTANT]}>
                  <PayrollStudioPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/performance"
              element={
                <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.HR, UserRole.MANAGER]}>
                  <PerformancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/warnings"
              element={
                <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.HR, UserRole.MANAGER]}>
                  <WarningsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-warnings"
              element={
                <ProtectedRoute requiredRoles={[UserRole.EMPLOYEE]}>
                  <EmployeeWarningsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assets"
              element={
                <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.HR, UserRole.ACCOUNTANT, UserRole.MANAGER]}>
                  <AssetsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/asset-requests"
              element={
                <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.ACCOUNTANT, UserRole.EMPLOYEE]}>
                  <AssetRequestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-assets"
              element={
                <ProtectedRoute requiredRoles={[UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.ACCOUNTANT, UserRole.HR]}>
                  <MyAssetsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events"
              element={
                <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.HR, UserRole.EMPLOYEE]}>
                  <EventsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/holidays"
              element={
                <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.EMPLOYEE, UserRole.ACCOUNTANT]}>
                  <HolidaysPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruitment"
              element={
                <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.HR]}>
                  <AdminRecruitmentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruitment-pipeline"
              element={
                <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.HR]}>
                  <RecruitmentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs"
              element={<PublicRecruitmentPage />}
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit-logs"
              element={
                <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
                  <AuditLogsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/accounting"
              element={
                <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.ACCOUNTANT]}>
                  <AccountingHubPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/accounting-parameters"
              element={<Navigate to="/accounting" replace />}
            />
            <Route
              path="/exit"
              element={
                <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.HR]}>
                  <ExitPage />
                </ProtectedRoute>
              }
            />

            {/* Teams & Tasks Routes */}
            <Route
              path="/teams"
              element={
                <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE]}>
                  <TeamsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teams/:teamId"
              element={
                <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE]}>
                  <TeamDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE]}>
                  <TasksPage />
                </ProtectedRoute>
              }
            />

            {/* New Employee-Facing Pages */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <EmployeeProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leave-balance"
              element={
                <ProtectedRoute>
                  <LeaveBalanceTrackerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll-breakdown"
              element={
                <ProtectedRoute>
                  <PayrollBreakdownPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Default Routes */}
            {/* Root Route - Landing on Department Dashboard */}
            <Route path="/" element={<Navigate to="/my-department" replace />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </QueryClientProvider>
    </div>
  )
}

export default App

