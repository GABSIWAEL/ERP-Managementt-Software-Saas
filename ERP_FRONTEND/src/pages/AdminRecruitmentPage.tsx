import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, Button, Badge, Input, Select, Modal, Textarea } from '@components/ui'
import { MainLayout } from '@components/layout'
import { jobOfferApi, jobApplicationApi, candidateApi, departmentApi } from '@api/index'
import { jobApplicationApi as jobApplicationApiForInterviewers } from '@api/recruitment'
import { JobOffer, JobApplication, Candidate } from '@types'
import { formatDate } from '@utils/helpers'
import {
  Plus,
  Briefcase,
  FileText,
  Trash2,
  Check,
  X,
  Eye,
  Edit2,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

// Interviewer interface
interface Interviewer {
  id: number
  name: string
  email: string
}

// Job Offer Schema
const jobOfferSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  requirements: z.string().min(1, 'Requirements are required'),
  department: z.string().min(1, 'Department is required'),
  jobLocation: z.string().min(1, 'Location is required'),
  jobType: z.string().min(1, 'Job type is required'),
  salaryMin: z.string().optional(),
  salaryMax: z.string().optional(),
  numberOfPositions: z.string().optional(),
  deadline: z.string().optional(),
  benefits: z.string().optional(),
})

type JobOfferFormData = z.infer<typeof jobOfferSchema>

export default function AdminRecruitmentPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'offers' | 'applications' | 'candidates'>('offers')
  const [page, setPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [showOfferModal, setShowOfferModal] = useState(false)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<JobOffer | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null)
  const [editingOffer, setEditingOffer] = useState<JobOffer | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [showReviewModal, setShowReviewModal] = useState(false)
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

  // Queries
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await departmentApi.getAll()
      return response.data || response
    },
  })

  const { data: offersData = [], isLoading: offersLoading } = useQuery({
    queryKey: ['jobOffers', page],
    queryFn: async () => {
      const response = await jobOfferApi.getAll(page, 10)
      return response.data.content || []
    },
    enabled: activeTab === 'offers'
  })

  const { data: applicationsData = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ['jobApplications', page],
    queryFn: async () => {
      const response = await jobApplicationApi.getAll(page, 10)
      return response.data.content || []
    },
    enabled: true // Always load to support scheduling in candidates tab
  })

  const { data: candidatesData = [], isLoading: candidatesLoading } = useQuery({
    queryKey: ['candidates', page],
    queryFn: async () => {
      const response = await candidateApi.getAll(page, 10)
      // candidateApi returns unwrapped data, not axios response
      return response?.content || response || []
    },
    enabled: activeTab === 'candidates'
  })

  const { data: interviewersData = [], isLoading: interviewersLoading } = useQuery({
    queryKey: ['interviewers', scheduleType],
    queryFn: async () => {
      const role = scheduleType === 'interview' ? 'HR' : 'EMPLOYEE'
      const response = await jobApplicationApiForInterviewers.getInterviewers(role as 'HR' | 'EMPLOYEE')
      return response.data.data || []
    },
    enabled: showScheduleModal
  })

  // Mutations
  const createOfferMutation = useMutation({
    mutationFn: (data: JobOfferFormData) =>
      jobOfferApi.create({
        title: data.title,
        description: data.description,
        requirements: data.requirements,
        department: data.department,
        jobLocation: data.jobLocation,
        jobType: data.jobType,
        salaryMin: data.salaryMin ? parseFloat(data.salaryMin) : undefined,
        salaryMax: data.salaryMax ? parseFloat(data.salaryMax) : undefined,
        numberOfPositions: data.numberOfPositions ? parseInt(data.numberOfPositions) : undefined,
        deadline: data.deadline ? `${data.deadline}T23:59:59` : undefined,
        benefits: data.benefits,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobOffers'] })
      setShowOfferModal(false)
      resetOfferForm()
    },
  })

  const updateOfferMutation = useMutation({
    mutationFn: (data: JobOfferFormData) => {
      if (!editingOffer?.id) throw new Error('No offer selected')
      return jobOfferApi.update(editingOffer.id, {
        title: data.title,
        description: data.description,
        requirements: data.requirements,
        department: data.department,
        jobLocation: data.jobLocation,
        jobType: data.jobType,
        salaryMin: data.salaryMin ? parseFloat(data.salaryMin) : undefined,
        salaryMax: data.salaryMax ? parseFloat(data.salaryMax) : undefined,
        numberOfPositions: data.numberOfPositions ? parseInt(data.numberOfPositions) : undefined,
        deadline: data.deadline ? `${data.deadline}T23:59:59` : undefined,
        benefits: data.benefits,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobOffers'] })
      setShowOfferModal(false)
      setEditingOffer(null)
      resetOfferForm()
    },
  })

  const deleteOfferMutation = useMutation({
    mutationFn: (id: number) => jobOfferApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobOffers'] })
    },
  })

  const closeOfferMutation = useMutation({
    mutationFn: (id: number) => jobOfferApi.close(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobOffers'] })
    },
  })

  const updateApplicationStatusMutation = useMutation({
    mutationFn: (data: { id: number; status: string; notes?: string }) =>
      jobApplicationApi.updateStatus(data.id, data.status, data.notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobApplications'] })
      setShowReviewModal(false)
      setReviewNotes('')
    },
  })

  // Create candidate from application
  const createCandidateFromApplicationMutation = useMutation({
    mutationFn: async (app: JobApplication) => {
      // Create candidate from application data - match backend CandidateDTO structure
      const candidateData = {
        candidateName: app.applicantName || 'Candidate',
        email: app.email,
        position: app.jobOfferTitle || 'Open Position',
        status: 'APPLIED', // Initial status in pipeline
        notes: app.coverLetter || undefined,
        jobOfferId: app.jobOfferId, // Link candidate to the job offer
      }
      return candidateApi.create(candidateData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
    },
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
      // Combine date and time into single datetime string
      const scheduledDateTime = `${data.scheduledDate}T${data.scheduledTime}`
      
      if (data.scheduleType === 'interview') {
        return jobApplicationApi.scheduleInterview({
          jobApplicationId: data.jobApplicationId,
          scheduledDateTime,
          interviewerName: data.interviewerName,
          interviewerEmail: data.interviewerEmail,
          type: 'TECHNICAL_INTERVIEW',
          title: `Interview for Application #${data.jobApplicationId}`,
          meetingLink: data.meetingLink || undefined,
        })
      } else {
        return jobApplicationApi.scheduleTest({
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
      queryClient.invalidateQueries({ queryKey: ['jobApplications'] })
    },
  })

  // Update candidate status in pipeline
  const updateCandidateStatusMutation = useMutation({
    mutationFn: (data: { candidateId: number; status: string }) =>
      candidateApi.updateStatus(data.candidateId, data.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
    },
  })

  const {
    register: registerOffer,
    handleSubmit: handleSubmitOffer,
    formState: { errors: jobOfferErrors },
    reset: resetOfferForm,
    watch,
  } = useForm<JobOfferFormData>({
    resolver: zodResolver(jobOfferSchema),
    defaultValues: {
      title: '',
      description: '',
      requirements: '',
      department: '',
      jobLocation: '',
      jobType: '',
      salaryMin: '',
      salaryMax: '',
      numberOfPositions: '',
      deadline: '',
      benefits: '',
    },
  })

  // Reset form when editing offer changes
  useEffect(() => {
    if (editingOffer) {
      resetOfferForm({
        title: editingOffer.title,
        description: editingOffer.description,
        requirements: editingOffer.requirements,
        department: editingOffer.department,
        jobLocation: editingOffer.jobLocation,
        jobType: editingOffer.jobType,
        salaryMin: editingOffer.salaryMin?.toString() || '',
        salaryMax: editingOffer.salaryMax?.toString() || '',
        numberOfPositions: editingOffer.numberOfPositions?.toString() || '',
        deadline: editingOffer.deadline?.split('T')[0] || '',
        benefits: editingOffer.benefits || '',
      })
    } else {
      resetOfferForm()
    }
  }, [editingOffer, resetOfferForm])

  const onSubmitOffer = (data: JobOfferFormData) => {
    if (editingOffer) {
      updateOfferMutation.mutate(data)
    } else {
      createOfferMutation.mutate(data)
    }
  }

  const handleEditOffer = (offer: JobOffer) => {
    setEditingOffer(offer)
    setShowOfferModal(true)
  }

  const handleReviewApplication = (app: JobApplication) => {
    setSelectedApplication(app)
    setShowReviewModal(true)
  }

  const handleUpdateStatus = (status: string) => {
    if (!selectedApplication) return
    
    // Update application status
    updateApplicationStatusMutation.mutate({
      id: selectedApplication.id!,
      status,
      notes: reviewNotes,
    })
    
    // If accepting, also create a candidate in the pipeline
    if (status === 'ACCEPTED') {
      setTimeout(() => {
        createCandidateFromApplicationMutation.mutate(selectedApplication)
      }, 500)
    }
  }

  const filteredOffers = Array.isArray(offersData) ? offersData.filter((offer: any) =>
    offer.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) : []

  const filteredApplications = Array.isArray(applicationsData) ? applicationsData.filter((app: any) =>
    app.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : []

  const filteredCandidates = Array.isArray(candidatesData) ? candidatesData.filter((candidate: any) =>
    candidate.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : []

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Recruitment Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage job offers and applications</p>
          </div>
          {(activeTab === 'offers' || activeTab === 'applications' || activeTab === 'candidates') && (
            <Button
              variant="primary"
              onClick={() => {
                if (activeTab === 'offers') {
                  setEditingOffer(null)
                  setShowOfferModal(true)
                }
              }}
              disabled={activeTab !== 'offers'}
              className="flex items-center gap-2"
            >
              <Plus size={18} />
              {activeTab === 'offers' ? 'New Job Offer' : 'Add Item'}
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('offers')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'offers'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Briefcase className="inline mr-2" size={18} />J
            ob Offers
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'applications'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <FileText className="inline mr-2" size={18} />
            Applications
          </button>
          <button
            onClick={() => setActiveTab('candidates')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'candidates'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Users className="inline mr-2" size={18} />
            Candidates
          </button>
        </div>

        {/* Search */}
        <Input
          placeholder={`Search ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />

        {/* Job Offers Tab */}
        {activeTab === 'offers' && (
          <div className="space-y-4">
            {offersLoading ? (
              <Card>
                <CardContent className="text-center py-8">Loading...</CardContent>
              </Card>
            ) : filteredOffers.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8 text-gray-600">No job offers found</CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredOffers.map((offer: any) => (
                  <Card key={offer.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{offer.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{offer.department}</p>
                        </div>
                        <Badge variant={offer.status === 'OPEN' ? 'success' : 'warning'}>{offer.status}</Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Location</p>
                          <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                            <MapPin size={14} />
                            {offer.jobLocation}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Type</p>
                          <p className="font-medium text-gray-900 dark:text-white">{offer.jobType}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Salary Range</p>
                          <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                            <DollarSign size={14} />
                            {offer.salaryMin?.toLocaleString()} - {offer.salaryMax?.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Posted</p>
                          <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(new Date(offer.postedDate))}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedOffer(offer)
                            setShowApplicationModal(true)
                          }}
                        >
                          <Users size={14} className="mr-1" />
                          Manage Applications
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEditOffer(offer)}
                        >
                          <Edit2 size={14} className="mr-1" />
                          Edit
                        </Button>
                        {offer.status === 'OPEN' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => closeOfferMutation.mutate(offer.id)}
                          >
                            Close
                          </Button>
                        )}
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => deleteOfferMutation.mutate(offer.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            {applicationsLoading ? (
              <Card>
                <CardContent className="text-center py-8">Loading...</CardContent>
              </Card>
            ) : filteredApplications.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8 text-gray-600">No applications found</CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredApplications.map((app: any) => (
                  <Card key={app.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 dark:text-white">{app.applicantName}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{app.email}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{app.jobOfferTitle}</p>
                        </div>
                        <Badge variant={app.status === 'PENDING' ? 'warning' : app.status === 'ACCEPTED' ? 'success' : 'danger'}>
                          {app.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleReviewApplication(app)}
                        >
                          <Eye size={14} className="mr-1" />
                          Review
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => jobApplicationApi.delete(app.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Candidates Tab */}
        {activeTab === 'candidates' && (
          <div className="space-y-4">
            {candidatesLoading ? (
              <Card>
                <CardContent className="text-center py-8">Loading...</CardContent>
              </Card>
            ) : filteredCandidates.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8 text-gray-600">No candidates found</CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredCandidates.map((candidate: any) => (
                  <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 dark:text-white">
                            {candidate.candidateName}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{candidate.email}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{candidate.position}</p>
                        </div>
                        <select
                          value={candidate.status}
                          onChange={(e) => {
                            const newStatus = e.target.value
                            // If changing to Interview or Testing, open schedule modal
                            if (newStatus === 'INTERVIEW' || newStatus === 'TESTING') {
                              setSelectedCandidate(candidate)
                              setScheduleType(newStatus === 'INTERVIEW' ? 'interview' : 'test')
                              setPendingStatusChange(newStatus)
                              setShowScheduleModal(true)
                            } else {
                              // Otherwise just update status directly
                              updateCandidateStatusMutation.mutate({
                                candidateId: candidate.id,
                                status: newStatus,
                              })
                            }
                          }}
                          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          <option value="APPLIED">Applied</option>
                          <option value="INTERVIEW">Interview</option>
                          <option value="TESTING">Testing</option>
                          <option value="ACCEPTED">Accepted</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Job Offer Modal */}
      {showOfferModal && (
        <Modal
          isOpen={showOfferModal}
          onClose={() => {
            setShowOfferModal(false)
            setEditingOffer(null)
            resetOfferForm()
          }}
          title={editingOffer ? 'Edit Job Offer' : 'Create Job Offer'}
          size="lg"
        >
          <form onSubmit={handleSubmitOffer(onSubmitOffer)} className="space-y-4">
            <Input
              label="Job Title"
              placeholder="e.g. Senior Developer"
              {...registerOffer('title')}
              error={jobOfferErrors.title?.message}
            />

<Textarea
              label="Description"
              placeholder="Detailed description of the job..."
              rows={4}
              {...registerOffer('description')}
              error={jobOfferErrors.description?.message}
            />

            <Textarea
              label="Requirements"
              placeholder="Required skills and qualifications..."
              rows={4}
              {...registerOffer('requirements')}
              error={jobOfferErrors.requirements?.message}
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Department"
                {...registerOffer('department')}
                error={jobOfferErrors.department?.message}
              >
                <option value="">Select a department</option>
                {departments.map((dept: any) => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </Select>
              <Select
                label="Job Type"
                {...registerOffer('jobType')}
                error={jobOfferErrors.jobType?.message}
              >
                <option value="">Select Type</option>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="TEMPORARY">Temporary</option>
              </Select>
            </div>

            <Input
              label="Location"
              placeholder="e.g. New York, USA"
              {...registerOffer('jobLocation')}
              error={jobOfferErrors.jobLocation?.message}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                label="Min Salary"
                placeholder="50000"
                {...registerOffer('salaryMin')}
              />
              <Input
                type="number"
                label="Max Salary"
                placeholder="100000"
                {...registerOffer('salaryMax')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                label="Positions"
                placeholder="Number of positions"
                {...registerOffer('numberOfPositions')}
              />
              <Input
                type="date"
                label="Deadline"
                {...registerOffer('deadline')}
              />
            </div>

            <Textarea
              label="Benefits"
              placeholder="List of benefits..."
              rows={2}
              {...registerOffer('benefits')}
            />

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setShowOfferModal(false)
                  setEditingOffer(null)
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-indigo-600"
                disabled={createOfferMutation.isPending || updateOfferMutation.isPending}
              >
                {editingOffer ? 'Update Offer' : 'Create Offer'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Application Review Modal */}
      {showReviewModal && selectedApplication && (
        <Modal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          title={`Review Application: ${selectedApplication.applicantName}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedApplication.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Position</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedApplication.jobOfferTitle}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedApplication.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Experience</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedApplication.yearsOfExperience || '-'} years
                </p>
              </div>
            </div>

            {selectedApplication.coverLetter && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Cover Letter</p>
                <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-4 rounded">
                  {selectedApplication.coverLetter}
                </p>
              </div>
            )}

            {selectedApplication.resumeUrl && (
              <a
                href={selectedApplication.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline flex items-center gap-2"
              >
                <FileText size={16} />
                View Resume
              </a>
            )}

            {selectedApplication.linkedinUrl && (
              <a
                href={selectedApplication.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                LinkedIn Profile
              </a>
            )}

            <div className="flex gap-2">
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  if (selectedApplication) {
                    // Mark as reviewed and create candidate
                    handleUpdateStatus('REVIEWED')
                    createCandidateFromApplicationMutation.mutate(selectedApplication)
                    setTimeout(() => setShowReviewModal(false), 500)
                  }
                }}
              >
                <Check size={16} className="mr-2" />
                Convert to Candidate
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => {
                  handleUpdateStatus('REJECTED')
                  setShowReviewModal(false)
                }}
              >
                <X size={16} className="mr-2" />
                Refuse
              </Button>
            </div>
          </div>
        </Modal>
      )}

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
                    const interviewer = interviewersData?.data?.find((i: any) => i.id === id)
                    if (interviewer) {
                      setSelectedInterviewerId(id)
                      setInterviewerName(interviewer.name)
                      setInterviewerEmail(interviewer.email)
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Choose an HR interviewer...</option>
                  {Array.isArray(interviewersData?.data) && interviewersData.data.map((interviewer: any) => (
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
                  // First try to find in loaded applications data
                  let application = applicationsData.find((app: any) => app.email === selectedCandidate.email)
                  
                  // If not found in current page, fetch from the job offer
                  if (!application && selectedCandidate.jobOfferId) {
                    try {
                      const response = await jobApplicationApi.getByJobOffer(selectedCandidate.jobOfferId, 0, 100)
                      const allApps = response.data?.content || response.data || []
                      application = allApps.find((app: any) => app.email === selectedCandidate.email)
                    } catch (error) {
                      console.error('Failed to fetch applications for job offer:', error)
                    }
                  }
                  
                  if (!application) {
                    alert('Could not find associated application. Please try refreshing the page.')
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
                        // Update candidate status after successful scheduling
                        updateCandidateStatusMutation.mutate({
                          candidateId: selectedCandidate.id,
                          status: pendingStatusChange || '',
                        })
                        // Close modal
                        setShowScheduleModal(false)
                        // Reset state
                        setSelectedCandidate(null)
                        setPendingStatusChange(null)
                        setScheduledDate('')
                        setScheduledTime('')
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

