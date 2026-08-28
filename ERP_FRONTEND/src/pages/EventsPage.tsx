import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, Button, Badge, Input, Select, Modal, DataTable, Textarea } from '@components/ui'
import { MainLayout } from '@components/layout'
import { eventApi } from '@api/index'
import { CompanyEvent } from '@types'
import { formatDate, formatDateTime } from '@utils/helpers'
import { Plus, Calendar, Users, MapPin, Clock, Trash2 } from 'lucide-react'

const eventSchema = z.object({
  title: z.string().min(1, 'Event title is required'),
  description: z.string().optional(),
  eventDate: z.string().min(1, 'Event date is required'),
  eventTime: z.string().optional(),
  eventType: z.enum(['MEETING', 'CELEBRATION', 'TRAINING', 'CONFERENCE', 'SOCIAL', 'WORKSHOP', 'ANNOUNCEMENT']),
  location: z.string().optional(),
})

type EventFormData = z.infer<typeof eventSchema>

const eventTypeColors: Record<string, string> = {
  'MEETING': 'info',
  'CELEBRATION': 'success',
  'TRAINING': 'warning',
  'CONFERENCE': 'info',
  'SOCIAL': 'success',
  'WORKSHOP': 'warning',
  'ANNOUNCEMENT': 'primary',
}

export default function EventsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CompanyEvent | null>(null)

  // Fetch events
  const { data: eventsData = { content: [] }, isLoading } = useQuery({
    queryKey: ['events', page, filterType],
    queryFn: async () => {
      const response = await eventApi.getAll(page, 20, filterType || undefined)
      return response
    }
  })

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: (data: EventFormData) => eventApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      setShowCreateModal(false)
      resetCreateForm()
    }
  })

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: (id: number) => eventApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    }
  })

  const { register: registerCreate, handleSubmit: handleCreateSubmit, formState: { errors: createErrors }, reset: resetCreateForm } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  })

  const onCreateEvent = (data: EventFormData) => {
    createEventMutation.mutate(data)
  }

  const filteredEvents = eventsData.content?.filter((event: CompanyEvent) =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const upcomingEvents = filteredEvents.filter((e: CompanyEvent) => new Date(e.eventDate) >= new Date())
  const pastEvents = filteredEvents.filter((e: CompanyEvent) => new Date(e.eventDate) < new Date())

  const columns = [
    {
      key: 'title' as const,
      label: 'Event Title',
      render: (value: string) => (
        <span className="font-medium text-gray-900 dark:text-white">{value}</span>
      )
    },
    {
      key: 'eventDate' as const,
      label: 'Date & Time',
      render: (value: string, item: CompanyEvent) => (
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-600 dark:text-gray-400" />
          <div>
            <div>{formatDate(value)}</div>
            {item.eventTime && <div className="text-xs text-gray-600 dark:text-gray-400">{item.eventTime}</div>}
          </div>
        </div>
      )
    },
    {
      key: 'eventType' as const,
      label: 'Type',
      render: (value: string) => <Badge status={eventTypeColors[value] as any}>{value}</Badge>
    },
    {
      key: 'location' as const,
      label: 'Location',
      render: (value: string) => value ? (
        <div className="flex items-center gap-1">
          <MapPin size={16} className="text-gray-600 dark:text-gray-400" />
          <span>{value}</span>
        </div>
      ) : '-'
    },
    {
      key: 'attendeeCount' as const,
      label: 'Attendees',
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <Users size={16} className="text-gray-600 dark:text-gray-400" />
          <span>{value || 0} registered</span>
        </div>
      )
    },
    {
      key: 'id' as const,
      label: 'Actions',
      render: (value: number, item: CompanyEvent) => (
        <button
          onClick={() => deleteEventMutation.mutate(item.id)}
          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
          title="Delete event"
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Company Events</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Organize and manage company events and activities</p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            New Event
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Events</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{filteredEvents.length}</p>
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
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{upcomingEvents.length}</p>
                </div>
                <Clock className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Past Events</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{pastEvents.length}</p>
                </div>
                <Calendar className="text-gray-600 dark:text-gray-400" size={24} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Input
            placeholder="Search events..."
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
            <option value="MEETING">Meeting</option>
            <option value="CELEBRATION">Celebration</option>
            <option value="TRAINING">Training</option>
            <option value="CONFERENCE">Conference</option>
            <option value="SOCIAL">Social</option>
            <option value="WORKSHOP">Workshop</option>
            <option value="ANNOUNCEMENT">Announcement</option>
          </select>
        </div>

        {/* Upcoming Events Timeline */}
        {upcomingEvents.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Upcoming Events</h3>
            <div className="space-y-3 mb-6">
              {upcomingEvents.slice(0, 3).map((event: CompanyEvent) => (
                <div key={event.id} className="flex gap-4 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex-shrink-0">
                    <Calendar className="text-blue-600 dark:text-blue-400" size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{event.title}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                      <span>{formatDate(event.eventDate)}</span>
                      {event.eventTime && <span>{event.eventTime}</span>}
                      {event.location && <span className="flex items-center gap-1"><MapPin size={14} /> {event.location}</span>}
                    </div>
                  </div>
                  <Badge status={eventTypeColors[event.eventType] as any}>{event.eventType}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Events Table */}
        <DataTable
          columns={columns}
          data={filteredEvents}
          isLoading={isLoading}
          page={page}
          pageSize={20}
          onPageChange={setPage}
          emptyMessage="No events found"
        />
      </div>

      {/* Create Event Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          resetCreateForm()
        }}
        title="Create New Event"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateSubmit(onCreateEvent)} isLoading={createEventMutation.isPending}>
              Create Event
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input
            label="Event Title"
            placeholder="e.g., Annual Team Outing"
            {...registerCreate('title')}
            error={createErrors.title?.message}
          />

          <Select
            label="Event Type"
            {...registerCreate('eventType')}
            error={createErrors.eventType?.message}
            options={[
              { value: 'MEETING', label: 'Meeting' },
              { value: 'CELEBRATION', label: 'Celebration' },
              { value: 'TRAINING', label: 'Training' },
              { value: 'CONFERENCE', label: 'Conference' },
              { value: 'SOCIAL', label: 'Social' },
              { value: 'WORKSHOP', label: 'Workshop' },
              { value: 'ANNOUNCEMENT', label: 'Announcement' },
            ]}
          />

          <Input
            label="Event Date"
            type="date"
            {...registerCreate('eventDate')}
            error={createErrors.eventDate?.message}
          />

          <Input
            label="Event Time (Optional)"
            type="time"
            {...registerCreate('eventTime')}
            error={createErrors.eventTime?.message}
          />

          <Input
            label="Location (Optional)"
            placeholder="e.g., Conference Room A"
            {...registerCreate('location')}
            error={createErrors.location?.message}
          />

          <Textarea
            label="Description (Optional)"
            placeholder="Provide event details..."
            {...registerCreate('description')}
            rows={4}
          />
        </form>
      </Modal>
    </MainLayout>
  )
}

