import { useState, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { Button, Select, Textarea } from '@components/ui'
import { holidayApi } from '@api/index'
import { Holiday } from '@types'
import { AlertCircle, CheckCircle, XCircle, Calendar } from 'lucide-react'

const leaveRequestSchema = z.object({
  leaveType: z.enum(['SICK', 'ANNUAL', 'CASUAL', 'MATERNITY', 'PATERNITY', 'UNPAID']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().optional(),
}).refine(
  (data) => new Date(data.startDate) <= new Date(data.endDate),
  { message: 'End date must be after start date', path: ['endDate'] }
)

type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>

interface LeaveRequestFormProps {
  leaveBalance: number
  leaveType: string
  onSubmit: (data: LeaveRequestFormData) => void
  isLoading?: boolean
}

export function LeaveRequestForm({
  leaveBalance,
  leaveType,
  onSubmit,
  isLoading = false
}: LeaveRequestFormProps) {
  const [selectedStartDate, setSelectedStartDate] = useState<string>('')
  const [selectedEndDate, setSelectedEndDate] = useState<string>('')

  // Fetch holidays
  const { data: holidaysData = { content: [] } } = useQuery({
    queryKey: ['holidays-all'],
    queryFn: async () => {
      try {
        const response = await holidayApi.getAll(0, 500)
        return {
          content: Array.isArray(response) ? response : response.content || []
        }
      } catch {
        return { content: [] }
      }
    }
  })

  const holidays = useMemo(() => {
    return (holidaysData.content || []).map((h: Holiday) => h.date)
  }, [holidaysData])

  // Calculate business days excluding weekends and holidays
  const calculateBusinessDays = (start: string, end: string): number => {
    if (!start || !end) return 0
    
    const startDate = new Date(start)
    const endDate = new Date(end)
    
    if (startDate > endDate) return 0
    
    let count = 0
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay()
      const dateStr = currentDate.toISOString().split('T')[0]
      
      // Skip weekends (Saturday=6, Sunday=0) and holidays
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidays.includes(dateStr)) {
        count++
      }
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return count
  }

  const isHolidayOrWeekend = (dateStr: string): boolean => {
    if (!dateStr) return false
    const date = new Date(dateStr)
    const dayOfWeek = date.getDay()
    return dayOfWeek === 0 || dayOfWeek === 6 || holidays.includes(dateStr)
  }

  const numberOfDays = calculateBusinessDays(selectedStartDate, selectedEndDate)
  const hasEnoughBalance = numberOfDays <= leaveBalance
  const isFormValid = selectedStartDate && selectedEndDate && hasEnoughBalance

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch
  } = useForm<LeaveRequestFormData>({
    resolver: zodResolver(leaveRequestSchema),
    mode: 'onChange',
    defaultValues: {
      reason: ''
    }
  })

  const watchedLeaveType = watch('leaveType', leaveType)

  const handleFormSubmit = (data: LeaveRequestFormData) => {
    if (!isFormValid) {
      alert('Please fix validation errors before submitting')
      return
    }
    onSubmit(data)
    reset()
    setSelectedStartDate('')
    setSelectedEndDate('')
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Leave Type */}
      <Select
        label="Leave Type"
        {...register('leaveType')}
        error={errors.leaveType?.message}
        options={[
          { value: 'SICK', label: 'Sick Leave' },
          { value: 'ANNUAL', label: 'Annual Leave' },
          { value: 'CASUAL', label: 'Casual Leave' },
          { value: 'MATERNITY', label: 'Maternity Leave' },
          { value: 'PATERNITY', label: 'Paternity Leave' },
          { value: 'UNPAID', label: 'Unpaid Leave' },
        ]}
      />

      {/* Leave Balance Information */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Calendar size={18} className="text-blue-600 dark:text-blue-400" />
          <span className="font-medium text-gray-900 dark:text-white">
            Available {watchedLeaveType} Leave Balance
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{leaveBalance}</span>
          <span className="text-gray-600 dark:text-gray-400">days available</span>
        </div>
      </div>

      {/* Date Selection */}
      <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="font-medium text-gray-900 dark:text-white">Select Date Range</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              {...register('startDate')}
              value={selectedStartDate}
              onChange={(e) => {
                const dateStr = e.target.value
                setSelectedStartDate(dateStr)
                register('startDate').onChange(e)
                
                // Auto-set end date if not set
                if (!selectedEndDate) {
                  setSelectedEndDate(dateStr)
                  register('endDate').onChange({
                    target: { value: dateStr }
                  } as any)
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {isHolidayOrWeekend(selectedStartDate) && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <XCircle size={14} /> This is a weekend or holiday
              </p>
            )}
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.startDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              {...register('endDate')}
              value={selectedEndDate}
              onChange={(e) => {
                setSelectedEndDate(e.target.value)
                register('endDate').onChange(e)
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {isHolidayOrWeekend(selectedEndDate) && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <XCircle size={14} /> This is a weekend or holiday
              </p>
            )}
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.endDate.message}</p>
            )}
          </div>
        </div>

        {/* Days Calculation and Validation */}
        {selectedStartDate && selectedEndDate && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700 dark:text-gray-300">Total Leave Days:</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{numberOfDays}</span>
            </div>

            {/* Validation Messages */}
            {hasEnoughBalance ? (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded text-green-700 dark:text-green-300">
                <CheckCircle size={18} />
                <span className="text-sm">
                  Sufficient balance: {leaveBalance - numberOfDays} days remaining
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300">
                <AlertCircle size={18} />
                <span className="text-sm">
                  Insufficient balance. Need {numberOfDays} days but only have {leaveBalance}
                </span>
              </div>
            )}

            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
              Calculation excludes weekends and company holidays
            </p>
          </div>
        )}
      </div>

      {/* Reason */}
      <Textarea
        label="Reason (Optional)"
        placeholder="Provide reason for leave..."
        {...register('reason')}
        rows={3}
      />

      {/* Legend */}
      <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-400 rounded" /> Weekend
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-400 rounded" /> Holiday
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded" /> Working Day
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        isLoading={isLoading}
        disabled={!isFormValid}
        className="w-full"
      >
        {!isFormValid ? 'Fix Validation Errors' : 'Submit Leave Request'}
      </Button>
    </form>
  )
}

