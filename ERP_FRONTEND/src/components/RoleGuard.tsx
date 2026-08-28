import { ReactNode } from 'react'
import { useAuthStore } from '@store/authStore'
import { UserRole } from '@types'
import { hasFeaturePermission } from '@utils/rolePermissions'

interface RoleGuardProps {
  children: ReactNode
  requiredRoles?: UserRole[]
  requiredFeature?: string
  fallback?: ReactNode
}

/**
 * Component to conditionally render content based on user role
 * Can check against specific roles OR a feature permission
 */
export function RoleGuard({ 
  children, 
  requiredRoles = [], 
  requiredFeature,
  fallback = null 
}: RoleGuardProps) {
  const { user } = useAuthStore()

  if (!user || !user.role) {
    return <>{fallback}</>
  }

  // Check feature-based permission
  if (requiredFeature) {
    const hasPermission = hasFeaturePermission(requiredFeature, user.role)
    return hasPermission ? <>{children}</> : <>{fallback}</>
  }

  // Check role-based permission
  if (requiredRoles.length > 0) {
    const hasRole = requiredRoles.includes(user.role)
    return hasRole ? <>{children}</> : <>{fallback}</>
  }

  // If no requirements specified, show by default
  return <>{children}</>
}

interface ConditionalFeatureProps {
  feature: string
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Simplified component for feature-based access
 */
export function ConditionalFeature({ 
  feature, 
  children, 
  fallback = null 
}: ConditionalFeatureProps) {
  return (
    <RoleGuard requiredFeature={feature} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

interface ConditionalRoleProps {
  roles: UserRole[]
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Simplified component for role-based access
 */
export function ConditionalRole({ 
  roles, 
  children, 
  fallback = null 
}: ConditionalRoleProps) {
  return (
    <RoleGuard requiredRoles={roles} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

