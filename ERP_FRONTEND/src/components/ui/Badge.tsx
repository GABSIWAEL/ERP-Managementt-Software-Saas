import { ReactNode } from 'react'
import { cn, getStatusColor } from '@utils/helpers'

interface BadgeProps {
  children: ReactNode
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'status'
  status?: string
  className?: string
}

export const Badge = ({ children, variant = 'primary', status, className }: BadgeProps) => {
  const variants = {
    primary: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    danger: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    info: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300',
    status: status ? getStatusColor(status) : 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300',
  }

  const variantClass = variants[variant]

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variantClass,
      className
    )}>
      {children}
    </span>
  )
}
