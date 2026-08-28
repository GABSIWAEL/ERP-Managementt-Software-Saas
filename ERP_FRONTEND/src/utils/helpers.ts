import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (date: string | Date): string => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const formatDateTime = (date: string | Date): string => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatTime = (date: string | Date): string => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatCurrency = (amount: number | undefined): string => {
  if (amount === undefined || amount === null) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export const formatNumber = (num: number | undefined): string => {
  if (num === undefined || num === null) return '0'
  return new Intl.NumberFormat('en-US').format(num)
}

// Format date as YYYY-MM-DD for HTML date input elements
export const formatDateForInput = (date: string | Date | null | undefined): string => {
  if (!date) return ''
  try {
    const d = date instanceof Date ? date : new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch {
    return ''
  }
}

export const getInitials = (firstName?: string, lastName?: string): string => {
  const first = firstName?.[0]?.toUpperCase() || ''
  const last = lastName?.[0]?.toUpperCase() || ''
  return `${first}${last}`
}

export const getFullName = (firstName?: string, lastName?: string): string => {
  return `${firstName || ''} ${lastName || ''}`.trim()
}

export const calculateDaysBetween = (startDate: string | Date, endDate: string | Date): number => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  return diffDays
}

export const isToday = (date: string | Date): boolean => {
  const d = new Date(date)
  const today = new Date()
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  )
}

export const isFutureDate = (date: string | Date): boolean => {
  return new Date(date) > new Date()
}

export const isPastDate = (date: string | Date): boolean => {
  return new Date(date) < new Date()
}

export const getStatusColor = (status: string): string => {
  const statusLower = status?.toLowerCase() || ''
  
  if (statusLower.includes('approved') || statusLower.includes('active') || statusLower.includes('success')) {
    return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
  }
  
  if (statusLower.includes('rejected') || statusLower.includes('failed') || statusLower.includes('terminated')) {
    return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
  }
  
  if (statusLower.includes('pending') || statusLower.includes('waiting')) {
    return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400'
  }
  
  return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400'
}

export const truncateText = (text: string | undefined, length: number): string => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}
