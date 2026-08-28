import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'
import { UserRole } from '@types'
import { canAccessPage } from '@utils/rolePermissions'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: UserRole[]
  allowPasswordChange?: boolean
}

export function ProtectedRoute({ children, requiredRoles = [], allowPasswordChange = false }: ProtectedRouteProps) {
  const { isAuthenticated, user, passwordChangeRequired } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  // If password change is required and this is not the change-password or logout route,
  // redirect to change-password page
  if (passwordChangeRequired && !allowPasswordChange && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />
  }

  // Check pathname-based access via utility
  if (!canAccessPage(location.pathname, user?.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  // Check explicit role requirements
  if (requiredRoles.length > 0 && user?.role && !requiredRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}

