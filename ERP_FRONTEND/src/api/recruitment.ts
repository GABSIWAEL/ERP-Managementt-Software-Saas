import axiosInstance from './client'

export interface JobApplication {
  id?: number
  jobOfferId: number
  jobOfferTitle?: string
  applicantName: string
  email: string
  phone?: string
  coverLetter?: string
  resumeUrl?: string
  portfolio?: string
  status?: string
  applicationDate?: string
  reviewedDate?: string
  reviewNotes?: string
  linkedinUrl?: string
  website?: string
  yearsOfExperience?: number
  createdBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface ApplicationFilters {
  status?: string
  jobOfferId?: number
  email?: string
}

export const jobApplicationApi = {
  // Admin/HR endpoints
  getAll: (page: number = 0, size: number = 10) =>
    axiosInstance.get('/api/job-applications', {
      params: { page, size }
    }),

  getByJobOffer: (jobOfferId: number, page: number = 0, size: number = 10) =>
    axiosInstance.get(`/api/job-applications/job-offer/${jobOfferId}`, {
      params: { page, size }
    }),

  getByStatus: (status: string, page: number = 0, size: number = 10) =>
    axiosInstance.get(`/api/job-applications/status/${status}`, {
      params: { page, size }
    }),

  getById: (id: number) =>
    axiosInstance.get(`/api/job-applications/${id}`),

  update: (id: number, data: JobApplication) =>
    axiosInstance.put(`/api/job-applications/${id}`, data),

  updateStatus: (id: number, status: string, notes?: string) =>
    axiosInstance.put(
      `/api/job-applications/${id}/status/${status}`,
      {},
      { params: { notes } }
    ),

  delete: (id: number) =>
    axiosInstance.delete(`/api/job-applications/${id}`),

  search: (name: string, page: number = 0, size: number = 10) =>
    axiosInstance.get('/api/job-applications/search', {
      params: { name, page, size }
    }),

  // Public endpoints
  submit: (data: JobApplication) =>
    axiosInstance.post('/api/job-applications', data),

  getByEmail: (email: string, page: number = 0, size: number = 10) =>
    axiosInstance.get(`/api/job-applications/email/${email}`, {
      params: { page, size }
    }),

  checkDuplicate: (jobOfferId: number, email: string) =>
    axiosInstance.get('/api/job-applications/check-duplicate', {
      params: { jobOfferId, email }
    }),

  countPending: () =>
    axiosInstance.get('/job-applications/count/pending'),

  scheduleInterview: (data: {
    jobApplicationId: number
    scheduledDateTime: string
    interviewerName: string
    interviewerEmail: string
    type: 'TECHNICAL_INTERVIEW' | 'BEHAVIORAL_INTERVIEW' | 'FINAL_INTERVIEW'
    title: string
    location?: string
    meetingLink?: string
  }) =>
    axiosInstance.post(`/api/recruitment/schedules`, data),

  scheduleTest: (data: {
    jobApplicationId: number
    scheduledDateTime: string
    type: 'ASSESSMENT_TEST' | 'PRACTICAL_TEST'
    title: string
    location?: string
    meetingLink?: string
    description?: string
  }) =>
    axiosInstance.post(`/api/recruitment/schedules`, data),

  getInterviewers: (role: 'HR' | 'EMPLOYEE' = 'HR') =>
    axiosInstance.get('/api/candidates/interviewers', {
      params: { role }
    })
}
