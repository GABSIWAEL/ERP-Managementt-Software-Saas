import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, Button, Badge, Input, Select, Modal, DataTable } from '@components/ui'
import { MainLayout } from '@components/layout'
import { recruitmentApi, candidateApi, jobOfferApi } from '@api/index'
import { jobApplicationApi as jobApplicationApiForInterviewers } from '@api/recruitment'
import { Candidate, JobOffer } from '@types'
import { formatDate } from '@utils/helpers'
import { Plus, User, Mail, Phone, FileText, Trash2, CheckCircle, Calendar, Clock } from 'lucide-react'

const candidateSchema = z.object({
  candidateName: z.string().min(1, 'Candidate name is required'),
  email: z.string().email('Valid email is required'),
  position: z.string().min(1, 'Position is required'),
  notes: z.string().optional(),
})

type CandidateFormData = z.infer<typeof candidateSchema>

const statusColors: Record<string, string> = {
  'APPLIED': 'info',
  'INTERVIEW': 'warning',
  'TEST': 'success',
  'ACCEPTED': 'success',
  'REJECTED': 'danger',
}

export default function RecruitmentPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedJobOfferId, setSelectedJobOfferId] = useState<number | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  
  // Scheduling modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduleType, setScheduleType] = useState<'interview' | 'test'>('interview')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('10:00')
  const [selectedInterviewerId, setSelectedInterviewerId] = useState<number | null>(null)
  const [interviewerName, setInterviewerName] = useState('')
  const [interviewerEmail, setInterviewerEmail] = useState('')
  const [testDetails, setTestDetails] = useState('')
  const [meetingLink, setMeetingLink] = useState('')
  const [pendingStatusChange, setPendingStatusChange] = useState<string | null>(null)

  // Fetch job offers
  const { data: jobOffersData = [] } = useQuery({
    queryKey: ['jobOffers'],
    queryFn: async () => {
      const response = await jobOfferApi.getAll(0, 100)
      const offers = response?.content || response || []
      return offers.filter((o: any) => o.status === 'OPEN')
    }
  })

  // Fetch candidates
  const { data: candidatesData = [], isLoading } = useQuery({
    queryKey: ['candidates', page],
    queryFn: async () => {
      const response = await candidateApi.getAll(page, 20)
      return response?.content || response || []
    }
  })

  // Fetch interviewers
  const { data: interviewersData = [] } = useQuery({
    queryKey: ['interviewers', scheduleType],
    queryFn: async () => {
      const role = scheduleType === 'interview' ? 'HR' : 'EMPLOYEE'
      const response = await jobApplicationApiForInterviewers.getInterviewers(role as 'HR' | 'EMPLOYEE')
      return response.data.data || []
    },
    enabled: showScheduleModal
  })

  // Create candidate mutation
  const createCandidateMutation = useMutation({
    mutationFn: (data: CandidateFormData) => candidateApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      setShowCreateModal(false)
      resetCreateForm()
    }
  })

  // Update candidate status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      candidateApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
    }
  })

  // Delete candidate mutation
  const deleteCandidateMutation = useMutation({
    mutationFn: (id: number) => candidateApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
    }
  })

  // Schedule interview/test for candidate
  const scheduleCandidateMutation = useMutation({
    mutationFn: async (data: {
      jobApplicationId: number
      scheduleType: 'interview' | 'test'
      scheduledDate: string
      scheduledTime: string
      interviewerId: number
      interviewerName: string
      interviewerEmail: string
      testDetails?: string
      meetingLink?: string
    }) => {
      const scheduledDateTime = `${data.scheduledDate}T${data.scheduledTime}`
      
      if (data.scheduleType === 'interview') {
        return jobApplicationApiForInterviewers.scheduleInterview({
          jobApplicationId: data.jobApplicationId,
          scheduledDateTime,
          interviewerName: data.interviewerName,
          interviewerEmail: data.interviewerEmail,
          type: 'TECHNICAL_INTERVIEW',
          title: `Interview for Application #${data.jobApplicationId}`,
          meetingLink: data.meetingLink || undefined,
        })
      } else {
        return jobApplicationApiForInterviewers.scheduleTest({
          jobApplicationId: data.jobApplicationId,
          scheduledDateTime,
          type: 'ASSESSMENT_TEST',
          title: `Test for Application #${data.jobApplicationId}`,
          description: data.testDetails || '',
          meetingLink: data.meetingLink || undefined,
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
    },
  })

  const { register: registerCreate, handleSubmit: handleCreateSubmit, formState: { errors: createErrors }, reset: resetCreateForm } = useForm<CandidateFormData>({
    resolver: zodResolver(candidateSchema),
  })

  const onCreateCandidate = (data: CandidateFormData) => {
    createCandidateMutation.mutate(data)
  }

  const filteredCandidates = Array.isArray(candidatesData)
    ? candidatesData.filter((candidate: Candidate) => {
        const matchesSearch = (candidate.candidateName?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false) ||
          (candidate.email?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false)
        const matchesJobOffer = !selectedJobOfferId || candidate.jobOfferId === selectedJobOfferId
        return matchesSearch && matchesJobOffer
      })
    : []

  // Group candidates by status
  const statusGroups = {
    APPLIED: filteredCandidates.filter((c: Candidate) => c.status === 'APPLIED'),
    INTERVIEW: filteredCandidates.filter((c: Candidate) => c.status === 'INTERVIEW'),
    TEST: filteredCandidates.filter((c: Candidate) => c.status === 'TEST'),
    ACCEPTED: filteredCandidates.filter((c: Candidate) => c.status === 'ACCEPTED'),
    REJECTED: filteredCandidates.filter((c: Candidate) => c.status === 'REJECTED'),
  }

  const columns = [
    {
      key: 'candidateName' as const,
      label: 'Candidate',
      render: (value: string, item: Candidate) => (
        <div className="flex items-center gap-2">
          <User size={16} className="text-gray-600 dark:text-gray-400" />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{item.position}</p>
          </div>
        </div>
      )
    },
    {
      key: 'email' as const,
      label: 'Contact',
      render: (value: string, item: Candidate) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-sm">
            <Mail size={14} className="text-gray-600 dark:text-gray-400" />
            {value}
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Phone size={14} className="text-gray-600 dark:text-gray-400" />
            {item.phone}
          </div>
        </div>
      )
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: string, item: Candidate) => (
        <select
          value={value}
          onChange={(e) => {
            const newStatus = e.target.value
            if (newStatus === 'INTERVIEW' || newStatus === 'TEST') {
              setSelectedCandidate(item)
              setScheduleType(newStatus === 'INTERVIEW' ? 'interview' : 'test')
              setPendingStatusChange(newStatus)
              setShowScheduleModal(true)
            } else {
              updateStatusMutation.mutate({ id: item.id, status: newStatus })
            }
          }}
          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="APPLIED">Applied</option>
          <option value="INTERVIEW">Interview</option>
          <option value="TEST">Testing</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="REJECTED">Rejected</option>
        </select>
      )
    },
    {
      key: 'appliedDate' as const,
      label: 'Applied',
      render: (value: string) => formatDate(value)
    },
    {
      key: 'id' as const,
      label: 'Actions',
      render: (value: number, item: Candidate) => (
        <div className="flex gap-2">
          {item.resumeUrl && (
            <a
              href={item.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition-colors"
              title="View resume"
            >
              <FileText size={16} className="text-blue-600 dark:text-blue-400" />
            </a>
          )}
          <button
            onClick={() => deleteCandidateMutation.mutate(item.id)}
            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
            title="Delete candidate"
          >
            <Trash2 size={16} className="text-red-600 dark:text-red-400" />
          </button>
        </div>
      )
    },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Recruitment</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage recruitment pipeline and candidates</p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            Add Candidate
          </Button>
        </div>

        {/* Pipeline Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { status: 'APPLIED', label: 'Applied', color: 'blue', icon: User },
            { status: 'INTERVIEW', label: 'Interview', color: 'yellow', icon: User },
            { status: 'TEST', label: 'Testing', color: 'green', icon: CheckCircle },
            { status: 'ACCEPTED', label: 'Accepted', color: 'green', icon: CheckCircle },
            { status: 'REJECTED', label: 'Rejected', color: 'red', icon: User },
          ].map(({ status, label, color }) => (
            <Card key={status}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
                  <p className={`text-2xl font-bold mt-1 text-${color}-600 dark:text-${color}-400`}>
                    {statusGroups[status as keyof typeof statusGroups].length}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="flex gap-4">
          <Input
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select
            value={selectedJobOfferId?.toString() || ''}
            onChange={(e) => setSelectedJobOfferId(e.target.value ? parseInt(e.target.value) : null)}
            className="max-w-xs"
          >
            <option value="">All Job Offers</option>
            {jobOffersData.map((offer: JobOffer) => (
              <option key={offer.id} value={offer.id}>
                {offer.title} - {offer.department}
              </option>
            ))}
          </Select>
        </div>

        {/* Candidates Table */}
        <DataTable
          columns={columns}
          data={filteredCandidates}
          isLoading={isLoading}
          page={page}
          pageSize={20}
          onPageChange={setPage}
          emptyMessage="No candidates found"
        />

        {/* Pipeline View (Optional) */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recruitment Pipeline by Job Offer</h3>
          
          {selectedJobOfferId ? (
            // Single Job Offer View
            <div>
              <div className="mb-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <h4 className="font-semibold text-indigo-900 dark:text-indigo-100">
                  {jobOffersData.find((o: any) => o.id === selectedJobOfferId)?.title}
                </h4>
                <p className="text-sm text-indigo-700 dark:text-indigo-200 mt-1">
                  Department: {jobOffersData.find((o: any) => o.id === selectedJobOfferId)?.department}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                  { status: 'APPLIED', label: 'Applied', statusColor: 'info' },
                  { status: 'INTERVIEW', label: 'Interview', statusColor: 'warning' },
                  { status: 'TEST', label: 'Testing', statusColor: 'success' },
                  { status: 'ACCEPTED', label: 'Accepted', statusColor: 'success' },
                  { status: 'REJECTED', label: 'Rejected', statusColor: 'danger' },
                ].map(({ status, label, statusColor }) => (
                  <div key={status} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 min-h-[300px]">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{label}</h4>
                    <div className="space-y-2">
                      {filteredCandidates
                        .filter((c: Candidate) => c.status === status)
                        .map((candidate: Candidate) => (
                          <div key={candidate.id} className="bg-white dark:bg-gray-700 rounded-lg p-3 text-sm hover:shadow-md transition-shadow">
                            <p className="font-medium text-gray-900 dark:text-white truncate">{candidate.candidateName}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{candidate.email}</p>
                            <select
                              value={candidate.status}
                              onChange={(e) => {
                                const newStatus = e.target.value
                                if (newStatus === 'INTERVIEW' || newStatus === 'TEST') {
                                  setSelectedCandidate(candidate)
                                  setScheduleType(newStatus === 'INTERVIEW' ? 'interview' : 'test')
                                  setPendingStatusChange(newStatus)
                                  setShowScheduleModal(true)
                                } else {
                                  updateStatusMutation.mutate({ id: candidate.id, status: newStatus })
                                }
                              }}
                              className="w-full px-2 py-1 mt-2 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                              <option value="APPLIED">Applied</option>
                              <option value="INTERVIEW">Interview</option>
                              <option value="TEST">Testing</option>
                              <option value="ACCEPTED">Accepted</option>
                              <option value="REJECTED">Rejected</option>
                            </select>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // All Job Offers View
            <div className="space-y-6">
              {jobOffersData.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8 text-gray-600">
                    No open job offers found
                  </CardContent>
                </Card>
              ) : (
                jobOffersData.map((offer: JobOffer) => {
                  const offerCandidates = filteredCandidates.filter((c: Candidate) => c.jobOfferId === offer.id)
                  return (
                    <div key={offer.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{offer.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {offer.department} • {offer.jobLocation} • {offer.jobType}
                          </p>
                        </div>
                        <Badge>{offerCandidates.length} Candidates</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {[
                          { status: 'APPLIED', label: 'Applied', color: 'bg-blue-100 dark:bg-blue-900/20', textColor: 'text-blue-700 dark:text-blue-200' },
                          { status: 'INTERVIEW', label: 'Interview', color: 'bg-yellow-100 dark:bg-yellow-900/20', textColor: 'text-yellow-700 dark:text-yellow-200' },
                          { status: 'TEST', label: 'Testing', color: 'bg-purple-100 dark:bg-purple-900/20', textColor: 'text-purple-700 dark:text-purple-200' },
                          { status: 'ACCEPTED', label: 'Accepted', color: 'bg-green-100 dark:bg-green-900/20', textColor: 'text-green-700 dark:text-green-200' },
                          { status: 'REJECTED', label: 'Rejected', color: 'bg-red-100 dark:bg-red-900/20', textColor: 'text-red-700 dark:text-red-200' },
                        ].map(({ status, label, color, textColor }) => (
                          <div key={status} className={`${color} rounded-lg p-3 text-center`}>
                            <p className={`text-xs font-medium ${textColor}`}>{label}</p>
                            <p className={`text-2xl font-bold ${textColor} mt-1`}>
                              {offerCandidates.filter((c: Candidate) => c.status === status).length}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>

        {/* Status Pipeline Kanban */}
        {!selectedJobOfferId && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 mt-6">All Candidates Pipeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { status: 'APPLIED', label: 'Applied', statusColor: 'info' },
                { status: 'INTERVIEW', label: 'Interview', statusColor: 'warning' },
                { status: 'TEST', label: 'Testing', statusColor: 'success' },
                { status: 'ACCEPTED', label: 'Accepted', statusColor: 'success' },
                { status: 'REJECTED', label: 'Rejected', statusColor: 'danger' },
              ].map(({ status, label, statusColor }) => (
                <div key={status} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 min-h-[300px]">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{label}</h4>
                  <div className="space-y-2">
                    {statusGroups[status as keyof typeof statusGroups].map((candidate: Candidate) => (
                      <div key={candidate.id} className="bg-white dark:bg-gray-700 rounded-lg p-3 text-sm hover:shadow-md transition-shadow">
                        <p className="font-medium text-gray-900 dark:text-white truncate">{candidate.candidateName}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{candidate.position}</p>
                        <select
                          value={candidate.status}
                          onChange={(e) => {
                            const newStatus = e.target.value
                            if (newStatus === 'INTERVIEW' || newStatus === 'TEST') {
                              setSelectedCandidate(candidate)
                              setScheduleType(newStatus === 'INTERVIEW' ? 'interview' : 'test')
                              setPendingStatusChange(newStatus)
                              setShowScheduleModal(true)
                            } else {
                              updateStatusMutation.mutate({ id: candidate.id, status: newStatus })
                            }
                          }}
                          className="w-full px-2 py-1 mt-2 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          <option value="APPLIED">Applied</option>
                          <option value="INTERVIEW">Interview</option>
                          <option value="TEST">Testing</option>
                          <option value="ACCEPTED">Accepted</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Candidate Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          resetCreateForm()
        }}
        title="Add New Candidate"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateSubmit(onCreateCandidate)} isLoading={createCandidateMutation.isPending}>
              Add Candidate
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input
            label="Candidate Name"
            placeholder="John Doe"
            {...registerCreate('candidateName')}
            error={createErrors.candidateName?.message}
          />

          <Input
            label="Email"
            type="email"
            placeholder="john@example.com"
            {...registerCreate('email')}
            error={createErrors.email?.message}
          />

          <Input
            label="Position"
            placeholder="Software Engineer"
            {...registerCreate('position')}
            error={createErrors.position?.message}
          />

          <Input
            label="Resume URL (Optional)"
            placeholder="https://example.com/resume.pdf"
            {...registerCreate('resumeUrl')}
            error={createErrors.resumeUrl?.message}
          />
        </form>
      </Modal>

      {/* Schedule Interview/Test Modal */}
      {showScheduleModal && selectedCandidate && (
        <Modal
          isOpen={showScheduleModal}
          onClose={() => {
            setShowScheduleModal(false)
            setSelectedCandidate(null)
            setPendingStatusChange(null)
          }}
          title={`Schedule ${scheduleType === 'interview' ? 'Interview' : 'Test'} - ${selectedCandidate.candidateName}`}
          size="lg"
        >
          <div className="space-y-4">
            {/* Error message if interviewers failed to load */}
            {scheduleType !== 'test' && interviewersData?.error && (
              <div className="p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
                Failed to load interviewers. Please try again.
              </div>
            )}

            {/* Scheduled Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Interview Date
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* Scheduled Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Time
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* Interviewer selection (only for interviews, not tests) */}
            {scheduleType === 'interview' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Interviewer (HR)
                </label>
                <select
                  value={selectedInterviewerId ? selectedInterviewerId.toString() : ''}
                  onChange={(e) => {
                    const id = parseInt(e.target.value)
                    const interviewer = Array.isArray(interviewersData) ? interviewersData.find((i: any) => i.id === id) : interviewersData?.data?.find((i: any) => i.id === id)
                    if (interviewer) {
                      setSelectedInterviewerId(id)
                      setInterviewerName(interviewer.name)
                      setInterviewerEmail(interviewer.email)
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Choose an HR interviewer...</option>
                  {Array.isArray(interviewersData) && interviewersData.map((interviewer: any) => (
                    <option key={interviewer.id} value={interviewer.id}>
                      {interviewer.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Test Details (only for tests) */}
            {scheduleType === 'test' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Test Details
                </label>
                <textarea
                  value={testDetails}
                  onChange={(e) => setTestDetails(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="e.g., Technical assessment, Code submission, etc."
                  rows={3}
                />
              </div>
            )}

            {/* Meeting Link (optional for both) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Meeting Link (Optional)
              </label>
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="e.g., https://zoom.us/j/... or https://meet.google.com/..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button
                variant="primary"
                className="flex-1"
                onClick={async () => {
                  if (!scheduledDate || !scheduledTime) {
                    alert('Please fill in date and time')
                    return
                  }
                  if (scheduleType === 'interview' && !selectedInterviewerId) {
                    alert('Please select an interviewer')
                    return
                  }

                  // Get the job application ID from the candidate
                  let application = candidatesData.find((app: any) => app.email === selectedCandidate.email)
                  
                  // If not found in current data, try to find by job offer
                  if (!application && selectedCandidate.jobOfferId) {
                    try {
                      const response = await jobApplicationApiForInterviewers.getByJobOffer?.(selectedCandidate.jobOfferId, 0, 100)
                      const allApps = response?.data?.content || response?.data || []
                      application = allApps.find((app: any) => app.email === selectedCandidate.email)
                    } catch (error) {
                      console.error('Failed to fetch applications:', error)
                    }
                  }
                  
                  if (!application) {
                    alert('Could not find associated application. Please try refreshing.')
                    return
                  }

                  // Schedule the interview/test
                  scheduleCandidateMutation.mutate(
                    {
                      jobApplicationId: application.id,
                      scheduleType,
                      scheduledDate,
                      scheduledTime,
                      interviewerId: selectedInterviewerId || 0,
                      interviewerName: interviewerName || '',
                      interviewerEmail: interviewerEmail || '',
                      testDetails: scheduleType === 'test' ? testDetails : undefined,
                      meetingLink: meetingLink || undefined,
                    },
                    {
                      onSuccess: () => {
                        // Update candidate status
                        updateStatusMutation.mutate({
                          id: selectedCandidate.id,
                          status: pendingStatusChange || ''
                        })
                        // Close modal
                        setShowScheduleModal(false)
                        // Reset state
                        setSelectedCandidate(null)
                        setPendingStatusChange(null)
                        setScheduledDate('')
                        setScheduledTime('10:00')
                        setSelectedInterviewerId(null)
                        setInterviewerName('')
                        setInterviewerEmail('')
                        setTestDetails('')
                        setMeetingLink('')
                      },
                    }
                  )
                }}
                disabled={scheduleCandidateMutation.isPending}
              >
                {scheduleCandidateMutation.isPending ? 'Scheduling...' : 'Schedule'}
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setShowScheduleModal(false)
                  setSelectedCandidate(null)
                  setPendingStatusChange(null)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </MainLayout>
  )
}

