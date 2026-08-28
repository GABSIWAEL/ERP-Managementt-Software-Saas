import { ReactNode } from 'react'
import { cn } from '@utils/helpers'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export const Card = ({ children, className, onClick }: CardProps) => (
  <div
    className={cn(
      'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm',
      'hover:shadow-md transition-shadow',
      onClick && 'cursor-pointer',
      className
    )}
    onClick={onClick}
  >
    {children}
  </div>
)

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export const CardHeader = ({ children, className }: CardHeaderProps) => (
  <div className={cn('px-6 py-4 border-b border-gray-200 dark:border-gray-700', className)}>
    {children}
  </div>
)

interface CardContentProps {
  children: ReactNode
  className?: string
}

export const CardContent = ({ children, className }: CardContentProps) => (
  <div className={cn('px-6 py-4', className)}>
    {children}
  </div>
)

interface CardFooterProps {
  children: ReactNode
  className?: string
}

export const CardFooter = ({ children, className }: CardFooterProps) => (
  <div className={cn('px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between', className)}>
    {children}
  </div>
)
