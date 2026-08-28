import { UserRole } from '@types'

/**
 * Define what each role can access
 */
export const RolePermissions: Record<UserRole, {
  canAccess: string[]
  features: string[]
}> = {
  [UserRole.ADMIN]: {
    canAccess: [
      'dashboard', 'employees', 'departments', 'recruitment', 'attendance',
      'leaves', 'remote-work', 'payroll', 'performance', 'warnings',
      'assets', 'events', 'holidays', 'reports', 'exit', 'audit-logs',
      'accounting-parameters', 'settings'
    ],
    features: ['edit-all', 'delete-all', 'approve-all', 'manage-users']
  },
  [UserRole.HR]: {
    canAccess: [
      'dashboard', 'employees', 'departments', 'recruitment', 'attendance',
      'leaves', 'remote-work', 'payroll', 'performance', 'warnings',
      'assets', 'events', 'holidays', 'reports', 'exit'
    ],
    features: ['edit-all', 'approve-all', 'view-payroll']
  },
  [UserRole.MANAGER]: {
    canAccess: [
      'dashboard', 'employees', 'departments', 'attendance',
      'leaves', 'warnings', 'performance', 'reports', 'assets'
    ],
    features: ['approve-leaves', 'view-team', 'evaluate-performance', 'request-assets', 'report-damaged-assets']
  },
  [UserRole.ACCOUNTANT]: {
    canAccess: [
      'dashboard', 'payroll', 'accounting-parameters', 'reports', 'assets'
    ],
    features: ['manage-payroll', 'manage-accounting', 'view-payroll-reports']
  },
  [UserRole.EMPLOYEE]: {
    canAccess: [
      'dashboard', 'attendance', 'leaves', 'reports'
    ],
    features: ['view-own-data', 'submit-leave', 'check-in-out']
  }
}

/**
 * Page-level access control
 */
export const PageRoleRequirements: Record<string, UserRole[]> = {
  '/employees': [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER],
  '/departments': [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER],
  '/recruitment': [UserRole.ADMIN, UserRole.HR],
  '/attendance': [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.EMPLOYEE],
  '/leaves': [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.EMPLOYEE],
  '/remote-work': [UserRole.ADMIN, UserRole.HR],
  '/payroll': [UserRole.ADMIN, UserRole.HR, UserRole.ACCOUNTANT],
  '/performance': [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER],
  '/warnings': [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER],
  '/assets': [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.ACCOUNTANT],
  '/asset-requests': [UserRole.ADMIN, UserRole.MANAGER, UserRole.ACCOUNTANT, UserRole.EMPLOYEE],
  '/my-assets': [UserRole.EMPLOYEE, UserRole.HR, UserRole.MANAGER, UserRole.ACCOUNTANT],
  '/events': [UserRole.ADMIN, UserRole.HR],
  '/holidays': [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.EMPLOYEE],
  '/reports': [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.ACCOUNTANT, UserRole.EMPLOYEE],
  '/exit': [UserRole.ADMIN, UserRole.HR],
  '/audit-logs': [UserRole.ADMIN],
  '/accounting-parameters': [UserRole.ADMIN, UserRole.ACCOUNTANT],
  '/settings': [UserRole.ADMIN],
  '/employee-profile': [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.ACCOUNTANT, UserRole.EMPLOYEE],
}

/**
 * Feature-level access control
 */
export const FeaturePermissions: Record<string, UserRole[]> = {
  // Employee features
  'create-employee': [UserRole.ADMIN, UserRole.HR],
  'edit-employee': [UserRole.ADMIN, UserRole.HR],
  'delete-employee': [UserRole.ADMIN],
  'transfer-employee': [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER],
  'view-employee-list': [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER],

  // Attendance features
  'create-attendance': [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER],
  'edit-attendance': [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER],
  'delete-attendance': [UserRole.ADMIN],
  'check-in': [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.EMPLOYEE],
  'check-out': [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.EMPLOYEE],
  'view-all-attendance': [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER],
  'view-own-attendance': [UserRole.EMPLOYEE],

  // Leave features
  'create-leave': [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.EMPLOYEE],
  'approve-leave': [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER],
  'reject-leave': [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER],
  'cancel-leave': [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.EMPLOYEE],
  'view-all-leaves': [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER],
  'view-own-leaves': [UserRole.EMPLOYEE],

  // Payroll features
  'create-payroll': [UserRole.ADMIN, UserRole.HR, UserRole.ACCOUNTANT],
  'edit-payroll': [UserRole.ADMIN, UserRole.ACCOUNTANT],
  'delete-payroll': [UserRole.ADMIN],
  'lock-payroll': [UserRole.ADMIN, UserRole.ACCOUNTANT],
  'unlock-payroll': [UserRole.ADMIN, UserRole.ACCOUNTANT],
  'view-payroll': [UserRole.ADMIN, UserRole.HR, UserRole.ACCOUNTANT],
  'view-own-payroll': [UserRole.EMPLOYEE],

  // Performance features
  'create-performance': [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER],
  'edit-performance': [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER],
  'delete-performance': [UserRole.ADMIN],
  'evaluate-employee': [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER],

  // Warning features
  'create-warning': [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER],
  'edit-warning': [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER],
  'delete-warning': [UserRole.ADMIN],
  'resolve-warning': [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER],

  // Accounting features
  'manage-accounting-params': [UserRole.ADMIN, UserRole.ACCOUNTANT],
  'view-accounting-params': [UserRole.ADMIN, UserRole.ACCOUNTANT],

  // Audit features
  'view-audit-logs': [UserRole.ADMIN],
  'delete-audit-logs': [UserRole.ADMIN],

  // Reports features
  'view-all-reports': [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.ACCOUNTANT],
  'view-own-reports': [UserRole.EMPLOYEE],
}

/**
 * Check if a user has access to a page
 */
export const canAccessPage = (pathname: string, userRole?: UserRole): boolean => {
  if (!userRole) return false
  const requiredRoles = PageRoleRequirements[pathname] || []
  return requiredRoles.length === 0 || requiredRoles.includes(userRole)
}

/**
 * Check if a user has a specific feature permission
 */
export const hasFeaturePermission = (feature: string, userRole?: UserRole): boolean => {
  if (!userRole) return false
  const requiredRoles = FeaturePermissions[feature] || []
  return requiredRoles.length === 0 || requiredRoles.includes(userRole)
}

/**
 * Get all accessible pages for a role
 */
export const getAccessiblePages = (userRole: UserRole): string[] => {
  return RolePermissions[userRole]?.canAccess || []
}

/**
 * Get user role display name
 */
export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'Administrator',
    [UserRole.HR]: 'HR Manager',
    [UserRole.MANAGER]: 'Team Manager',
    [UserRole.ACCOUNTANT]: 'Accountant',
    [UserRole.EMPLOYEE]: 'Employee',
  }
  return roleNames[role] || role
}

/**
 * Get role color for UI
 */
export const getRoleColor = (role: UserRole): string => {
  const colors: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30',
    [UserRole.HR]: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30',
    [UserRole.MANAGER]: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30',
    [UserRole.ACCOUNTANT]: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30',
    [UserRole.EMPLOYEE]: 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/30',
  }
  return colors[role] || colors[UserRole.EMPLOYEE]
}

