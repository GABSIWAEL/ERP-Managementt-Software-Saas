import { Link, useLocation } from 'react-router-dom'
import {
  LayoutGrid,
  Users,
  Building2,
  Briefcase,
  Clock,
  Leaf,
  WifiOff,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Package,
  Calendar,
  Settings,
  LogOut,
  FileText,
  BarChart3,
  Archive,
  Sliders,
  Home,
  CheckSquare,
  PlusSquare,
  ChevronLeft,
  Calculator,
} from 'lucide-react'
import { useAuthStore } from '@store/authStore'
import { useLogout } from '@hooks/useAuth'
import { cn } from '@utils/helpers'
import { UserRole } from '@types'

interface SidebarItem {
  name: string
  href: string
  icon: React.ReactNode
  roles?: UserRole[]
}

const menu: SidebarItem[] = [
  // Visible to all roles
  { name: 'Dashboard', href: '/dashboard', icon: <LayoutGrid size={20} />, roles: [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.ACCOUNTANT, UserRole.EMPLOYEE] },
  
  // Employees - Admin, HR, Manager
  { name: 'Employees', href: '/employees', icon: <Users size={20} />, roles: [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER] },
  
  // Departments - Admin, HR only (NOT Manager)
  { name: 'Departments', href: '/departments', icon: <Building2 size={20} />, roles: [UserRole.ADMIN, UserRole.HR] },
  
  // Recruitment - Admin, HR
  { name: 'Recruitment', href: '/recruitment', icon: <Briefcase size={20} />, roles: [UserRole.ADMIN, UserRole.HR] },
  
  // Recruitment Pipeline - Admin, HR
  { name: 'Recruitment Pipeline', href: '/recruitment-pipeline', icon: <Briefcase size={20} />, roles: [UserRole.ADMIN, UserRole.HR] },
  
  // Attendance - Admin, HR, Manager, Employee
  { name: 'Attendance', href: '/attendance', icon: <Clock size={20} />, roles: [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.EMPLOYEE] },
  
  // My Department - Employee and Manager
  { name: 'My Department', href: '/my-department', icon: <Home size={20} />, roles: [UserRole.EMPLOYEE, UserRole.MANAGER] },
  
  // My Assets - Employee, HR, Manager, Accountant
  { name: 'My Assets', href: '/my-assets', icon: <Package size={20} />, roles: [UserRole.EMPLOYEE, UserRole.HR, UserRole.MANAGER, UserRole.ACCOUNTANT] },
  
  // Assets - Admin, HR, Manager, Accountant
  { name: 'Assets', href: '/assets', icon: <Package size={20} />, roles: [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.ACCOUNTANT] },
  
  // Asset Requests - Admin, Manager, Accountant, Employee
  { name: 'Asset Requests', href: '/asset-requests', icon: <Package size={20} />, roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.ACCOUNTANT, UserRole.EMPLOYEE] },
  
  // Members - Manager, Admin, Employee
  { name: 'Members', href: '/members', icon: <Users size={20} />, roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE] },
  
  // Team Hub - Manager and Admin
  { name: 'Team Hub', href: '/teams', icon: <Users size={20} />, roles: [UserRole.MANAGER, UserRole.ADMIN] },
  
  // Workboard - Manager, Admin, and Employee
  { name: 'Workboard', href: '/tasks', icon: <CheckSquare size={20} />, roles: [UserRole.MANAGER, UserRole.ADMIN, UserRole.EMPLOYEE] },
  
  // Leaves - Admin, HR, Manager, Employee
  { name: 'Leaves', href: '/leaves', icon: <Leaf size={20} />, roles: [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.EMPLOYEE] },
  
  // Remote Work - Admin, HR
  { name: 'Remote Work', href: '/remote-work', icon: <WifiOff size={20} />, roles: [UserRole.ADMIN, UserRole.HR] },
  
  // Payroll - Admin, HR, Accountant
  { name: 'Payroll', href: '/payroll', icon: <DollarSign size={20} />, roles: [UserRole.ADMIN, UserRole.HR, UserRole.ACCOUNTANT] },
  
  // Payroll Studio - Admin, Accountant
  { name: 'Payroll Studio', href: '/payroll-studio', icon: <Calculator size={20} />, roles: [UserRole.ADMIN, UserRole.ACCOUNTANT] },
  
  // Performance - Admin, HR, Manager
  { name: 'Performance', href: '/performance', icon: <TrendingUp size={20} />, roles: [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER] },
  
  // Warnings - Admin, HR, Manager
  { name: 'Warnings', href: '/warnings', icon: <AlertTriangle size={20} />, roles: [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER] },
  
  // My Warnings - Employee
  { name: 'My Warnings', href: '/my-warnings', icon: <AlertTriangle size={20} />, roles: [UserRole.EMPLOYEE] },
  
  // Reports - Admin, HR, Manager, Accountant, Employee
  { name: 'Reports', href: '/reports', icon: <BarChart3 size={20} />, roles: [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.ACCOUNTANT, UserRole.EMPLOYEE] },
  
  // Exit Management - Admin, HR
  { name: 'Exit Management', href: '/exit', icon: <Archive size={20} />, roles: [UserRole.ADMIN, UserRole.HR] },
  
  // Audit Logs - Admin only
  { name: 'Audit Logs', href: '/audit-logs', icon: <FileText size={20} />, roles: [UserRole.ADMIN] },
  
  // Finance Center - Admin, Accountant
  { name: 'Finance Center', href: '/accounting', icon: <Sliders size={20} />, roles: [UserRole.ADMIN, UserRole.ACCOUNTANT] },
  
  // Settings - Admin only
  { name: 'Settings', href: '/settings', icon: <Settings size={20} />, roles: [UserRole.ADMIN] },
]

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation()
  const { user, hasRole } = useAuthStore()
  const { logout } = useLogout()

  const visibleMenu = menu.filter(item => !item.roles || hasRole(item.roles))

  return (
    <aside className={cn(
      "bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out",
      isOpen ? "w-64" : "w-20"
    )}>
      {/* Logo */}
      <div className="px-3 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <Link to="/dashboard" className={cn("flex items-center gap-2", !isOpen && "justify-center w-full")}>
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
            ERP
          </div>
          {isOpen && <span className="font-bold text-lg text-gray-900 dark:text-white">TechNova</span>}
        </Link>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors ml-auto"
          title={isOpen ? "Collapse" : "Expand"}
        >
          <ChevronLeft size={18} className={cn("text-gray-600 dark:text-gray-400 transition-transform", !isOpen && "rotate-180")} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="space-y-1">
          {visibleMenu.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
            return (
              <li key={item.name} title={!isOpen ? item.name : undefined}>
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
                    !isOpen && 'justify-center'
                  )}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {isOpen && <span>{item.name}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Info */}
      <div className="border-t border-gray-200 dark:border-gray-800 px-2 py-4 space-y-2">
        {isOpen && (
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">LOGGED IN AS</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1 truncate">{user?.username}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</p>
          </div>
        )}
        <button
          onClick={logout}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors",
            !isOpen && "justify-center"
          )}
          title="Logout"
        >
          <LogOut size={16} />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}

