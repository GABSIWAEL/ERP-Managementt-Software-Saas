import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, Button, Badge, Input, Select, Modal, Textarea } from '@components/ui'
import { jobOfferApi, jobApplicationApi } from '@api/index'
import { JobOffer, JobApplication } from '@types'
import { formatDate } from '@utils/helpers'
import { Briefcase, MapPin, DollarSign, Calendar, Send, Info, AlertCircle, CheckCircle } from 'lucide-react'

const applicationSchema = z.object({
  applicantName: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  yearsOfExperience: z.string().optional(),
  coverLetter: z.string().optional(),
  resumeUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  website: z.string().optional(),
  portfolio: z.string().optional(),
})

type ApplicationFormData = z.infer<typeof applicationSchema>

export default function PublicRecruitmentPage() {
  const [selectedOffer, setSelectedOffer] = useState<JobOffer | null>(null)
  const [showJobDetails, setShowJobDetails] = useState(false)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [applicationSuccess, setApplicationSuccess] = useState(false)
  const [checkingDuplicate, setCheckingDuplicate] = useState(false)

  // Fetch job offers
  const { data: offersData = [], isLoading } = useQuery({
    queryKey: ['publicJobOffers'],
    queryFn: async () => {
      const response = await jobOfferApi.getPublic()
      return Array.isArray(response.data) ? response.data : response.data.content || []
    },
  })

  // Check if already applied
  const checkDuplicateMutation = useMutation({
    mutationFn: async (data: { jobOfferId: number; email: string }) => {
      return jobApplicationApi.checkDuplicate(data.jobOfferId, data.email)
    },
  })

  // Submit application mutation
  const submitApplicationMutation = useMutation({
    mutationFn: (data: JobApplication) => jobApplicationApi.submit(data),
    onSuccess: () => {
      setApplicationSuccess(true)
      resetForm()
      setTimeout(() => {
        setShowApplicationForm(false)
        setApplicationSuccess(false)
      }, 2000)
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to submit application')
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: resetForm,
    watch,
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
  })

  const email = watch('email')

  const onSubmitApplication = async (formData: ApplicationFormData) => {
    if (!selectedOffer) return

    setCheckingDuplicate(true)
    try {
      const alreadyApplied = (
        await checkDuplicateMutation.mutateAsync({
          jobOfferId: selectedOffer.id!,
          email: formData.email,
        })
      ).data

      if (alreadyApplied) {
        alert('You have already applied for this position')
        setCheckingDuplicate(false)
        return
      }

      const applicationData: JobApplication = {
        jobOfferId: selectedOffer.id!,
        applicantName: formData.applicantName,
        email: formData.email,
        phone: formData.phone,
        coverLetter: formData.coverLetter,
        resumeUrl: formData.resumeUrl,
        linkedinUrl: formData.linkedinUrl,
        website: formData.website,
        portfolio: formData.portfolio,
        yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : undefined,
      }

      submitApplicationMutation.mutate(applicationData)
    } finally {
      setCheckingDuplicate(false)
    }
  }

  const filteredOffers = Array.isArray(offersData)
    ? offersData.filter((offer: JobOffer) => {
        const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesDepartment = !departmentFilter || offer.department === departmentFilter
        return matchesSearch && matchesDepartment
      })
    : []

  const handleApplyClick = (offer: JobOffer) => {
    setSelectedOffer(offer)
    setShowApplicationForm(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Briefcase className="w-12 h-12 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Join Our Team</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Explore exciting career opportunities with us
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex gap-4 flex-col sm:flex-row">
          <div className="flex-1">
            <Input
              placeholder="Search job positions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="sm:w-48">
            <Select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              placeholder="All Departments"
            >
              <option value="">All Departments</option>
              {Array.from(
                new Set(offersData.map((offer: any) => offer.department))
              ).map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Job Offers Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading job offers...</p>
          </div>
        ) : filteredOffers.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Info size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {searchTerm || departmentFilter ? 'No offers matching your criteria' : 'No job offers available right now'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map((offer: JobOffer) => (
              <Card
                key={offer.id}
                className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col"
              >
                <CardContent className="pt-6 flex-1 flex flex-col">
                  {/* Header */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex-1 pr-2">
                        {offer.title}
                      </h3>
                      {offer.numberOfPositions && offer.filledPositions !== undefined && (
                        <Badge variant={offer.filledPositions < offer.numberOfPositions ? 'success' : 'danger'}>
                          {offer.numberOfPositions - offer.filledPositions}/{offer.numberOfPositions}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {offer.department}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-6 flex-1">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <MapPin size={16} className="text-indigo-600 flex-shrink-0" />
                      <span>{offer.jobLocation}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <Briefcase size={16} className="text-indigo-600 flex-shrink-0" />
                      <span>{offer.jobType || 'Full Time'}</span>
                    </div>
                    {offer.salaryMin && offer.salaryMax && (
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <DollarSign size={16} className="text-indigo-600 flex-shrink-0" />
                        <span>
                          ${offer.salaryMin?.toLocaleString()} - ${offer.salaryMax?.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {offer.postedDate && (
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Calendar size={16} className="text-indigo-600 flex-shrink-0" />
                        <span>Posted {formatDate(new Date(offer.postedDate))}</span>
                      </div>
                    )}
                  </div>

                  {/* Description Preview */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-2">
                    {offer.description}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setSelectedOffer(offer)
                        setShowJobDetails(true)
                      }}
                    >
                      View Details
                    </Button>
                    <Button
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => handleApplyClick(offer)}
                    >
                      <Send size={16} className="mr-2" />
                      Apply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      {showJobDetails && selectedOffer && (
        <Modal
          isOpen={showJobDetails}
          onClose={() => setShowJobDetails(false)}
          title={selectedOffer.title}
          size="lg"
        >
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Department</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedOffer.department}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Job Type</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedOffer.jobType}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedOffer.jobLocation}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Salary Range</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  ${selectedOffer.salaryMin?.toLocaleString()} - ${selectedOffer.salaryMax?.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h4>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {selectedOffer.description}
              </p>
            </div>

            {/* Requirements */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Requirements</h4>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {selectedOffer.requirements}
              </p>
            </div>

            {/* Benefits */}
            {selectedOffer.benefits && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Benefits</h4>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedOffer.benefits}
                </p>
              </div>
            )}

            {/* Deadline */}
            {selectedOffer.deadline && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Application deadline: {formatDate(new Date(selectedOffer.deadline))}
                </p>
              </div>
            )}

            {/* Apply Button */}
            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              onClick={() => {
                setShowJobDetails(false)
                handleApplyClick(selectedOffer)
              }}
            >
              <Send size={16} className="mr-2" />
              Apply Now
            </Button>
          </div>
        </Modal>
      )}

      {/* Application Form Modal */}
      {showApplicationForm && selectedOffer && (
        <Modal
          isOpen={showApplicationForm}
          onClose={() => !applicationSuccess && setShowApplicationForm(false)}
          title={`Apply for: ${selectedOffer.title}`}
          size="lg"
        >
          {applicationSuccess ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Application Submitted!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Thank you for applying. We'll review your application and get back to you soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmitApplication)} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Your full name"
                {...register('applicantName')}
                error={errors.applicantName?.message}
              />

              <Input
                type="email"
                label="Email"
                placeholder="your.email@example.com"
                {...register('email')}
                error={errors.email?.message}
              />

              <Input
                type="phone"
                label="Phone"
                placeholder="+1 (555) 000-0000"
                {...register('phone')}
              />

              <Input
                type="number"
                label="Years of Experience"
                placeholder="5"
                {...register('yearsOfExperience')}
              />

              <Textarea
                label="Cover Letter"
                placeholder="Tell us why you're interested in this position..."
                rows={4}
                {...register('coverLetter')}
              />

              <Input
                label="Resume URL"
                placeholder="https://example.com/resume.pdf"
                {...register('resumeUrl')}
              />

              <Input
                label="LinkedIn URL"
                placeholder="https://linkedin.com/in/yourprofile"
                {...register('linkedinUrl')}
              />

              <Input
                label="Portfolio Website"
                placeholder="https://yourportfolio.com"
                {...register('website')}
              />

              <Input
                label="Portfolio Link"
                placeholder="https://example.com/portfolio"
                {...register('portfolio')}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowApplicationForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  disabled={checkingDuplicate || submitApplicationMutation.isPending}
                >
                  {checkingDuplicate || submitApplicationMutation.isPending ? (
                    <>
                      <span className="inline-block animate-spin mr-2">⌛</span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={16} className="mr-2" />
                      Submit Application
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  )
}

