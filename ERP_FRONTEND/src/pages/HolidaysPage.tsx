import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, Button, Badge, Input, Select, Modal, DataTable } from '@components/ui'
import { MainLayout } from '@components/layout'
import { holidayApi } from '@api/index'
import { Holiday } from '@types'
import { formatDate } from '@utils/helpers'
import { Plus, Calendar, Repeat, Trash2 } from 'lucide-react'

const holidaySchema = z.object({
  name: z.string().min(1, 'Holiday name is required'),
  date: z.string().min(1, 'Holiday date is required'),
  type: z.enum(['NATIONAL', 'COMPANY', 'OPTIONAL']),
  recurring: z.boolean().default(false),
})

type HolidayFormData = z.infer<typeof holidaySchema>

const holidayTypeColors: Record<string, string> = {
  'NATIONAL': 'danger',
  'COMPANY': 'warning',
  'OPTIONAL': 'info',
}

export default function HolidaysPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Fetch holidays
  const { data: holidaysData = { content: [] }, isLoading } = useQuery({
    queryKey: ['holidays', page, filterType],
    queryFn: async () => {
      const response = await holidayApi.getAll(page, 20, filterType || undefined)
      // Wrap array response in content property
      return {
        content: Array.isArray(response) ? response : response.content || []
      }
    }
  })

  // Create holiday mutation
  const createHolidayMutation = useMutation({
    mutationFn: (data: HolidayFormData) => holidayApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] })
      setShowCreateModal(false)
      resetCreateForm()
    }
  })

  // Delete holiday mutation
  const deleteHolidayMutation = useMutation({
    mutationFn: (id: number) => holidayApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] })
    }
  })

  const { register: registerCreate, handleSubmit: handleCreateSubmit, formState: { errors: createErrors }, reset: resetCreateForm, watch } = useForm<HolidayFormData>({
    resolver: zodResolver(holidaySchema),
    defaultValues: {
      recurring: false
    }
  })

  const onCreateHoliday = (data: HolidayFormData) => {
    createHolidayMutation.mutate(data)
  }

  const filteredHolidays = holidaysData.content?.filter((holiday: Holiday) =>
    holiday.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const upcomingHolidays = filteredHolidays.filter((h: Holiday) => new Date(h.date) >= new Date())
  const pastHolidays = filteredHolidays.filter((h: Holiday) => new Date(h.date) < new Date())

  const columns = [
    {
      key: 'name' as const,
      label: 'Holiday Name',
      render: (value: string) => (
        <span className="font-medium text-gray-900 dark:text-white">{value}</span>
      )
    },
    {
      key: 'date' as const,
      label: 'Date',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-600 dark:text-gray-400" />
          {formatDate(value)}
        </div>
      )
    },
    {
      key: 'type' as const,
      label: 'Type',
      render: (value: string) => <Badge status={holidayTypeColors[value] as any}>{value}</Badge>
    },
    {
      key: 'recurring' as const,
      label: 'Recurring',
      render: (value: boolean) => (
        <div className="flex items-center gap-1">
          {value ? (
            <>
              <Repeat size={16} className="text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-700 dark:text-green-300">Yes</span>
            </>
          ) : (
            <span className="text-sm text-gray-600 dark:text-gray-400">No</span>
          )}
        </div>
      )
    },
    {
      key: 'id' as const,
      label: 'Actions',
      render: (value: number, item: Holiday) => (
        <button
          onClick={() => deleteHolidayMutation.mutate(item.id)}
          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
          title="Delete holiday"
        >
          <Trash2 size={16} className="text-red-600 dark:text-red-400" />
        </button>
      )
    },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Holiday Calendar</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage company holidays and non-working days</p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            Add Holiday
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Holidays</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{filteredHolidays.length}</p>
                </div>
                <Calendar className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{upcomingHolidays.length}</p>
                </div>
                <Calendar className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recurring</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {filteredHolidays.filter((h: Holiday) => h.recurring).length}
                  </p>
                </div>
                <Repeat className="text-orange-600 dark:text-orange-400" size={24} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Input
            placeholder="Search holidays..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Types</option>
            <option value="NATIONAL">National</option>
            <option value="COMPANY">Company</option>
            <option value="OPTIONAL">Optional</option>
          </select>
        </div>

        {/* Upcoming Holidays Timeline */}
        {upcomingHolidays.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Upcoming Holidays</h3>
            <div className="space-y-2 mb-6">
              {upcomingHolidays.slice(0, 5).map((holiday: Holiday) => (
                <div key={holiday.id} className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-green-600 dark:text-green-400" size={20} />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{holiday.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(holiday.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge status={holidayTypeColors[holiday.type] as any}>{holiday.type}</Badge>
                    {holiday.recurring && (
                      <Badge variant="info" className="flex items-center gap-1">
                        <Repeat size={12} /> Recurring
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Holidays Table */}
        <DataTable
          columns={columns}
          data={filteredHolidays}
          isLoading={isLoading}
          page={page}
          pageSize={20}
          onPageChange={setPage}
          emptyMessage="No holidays found"
        />
      </div>

      {/* Create Holiday Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          resetCreateForm()
        }}
        title="Add New Holiday"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateSubmit(onCreateHoliday)} isLoading={createHolidayMutation.isPending}>
              Add Holiday
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input
            label="Holiday Name"
            placeholder="e.g., Christmas Day"
            {...registerCreate('name')}
            error={createErrors.name?.message}
          />

          <Input
            label="Date"
            type="date"
            {...registerCreate('date')}
            error={createErrors.date?.message}
          />

          <Select
            label="Holiday Type"
            {...registerCreate('type')}
            error={createErrors.type?.message}
            options={[
              { value: 'NATIONAL', label: 'National Holiday' },
              { value: 'COMPANY', label: 'Company Holiday' },
              { value: 'OPTIONAL', label: 'Optional Holiday' },
            ]}
          />

          <div className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <input
              type="checkbox"
              {...registerCreate('recurring')}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
            />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Mark as recurring holiday (repeats annually)</label>
          </div>
        </form>
      </Modal>
    </MainLayout>
  )
}

