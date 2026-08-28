import axiosInstance from './client'

export interface JobOffer {
  id?: number
  title: string
  description: string
  requirements: string
  department: string
  salaryMin?: number
  salaryMax?: number
  jobLocation: string
  jobType: string
  status?: string
  postedDate?: string
  deadline?: string
  numberOfPositions?: number
  filledPositions?: number
  isActive?: boolean
  benefits?: string
  createdBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface JobOfferFilters {
  status?: string
  department?: string
  title?: string
}

export const jobOfferApi = {
  // Admin/HR endpoints
  getAll: (page: number = 0, size: number = 10) =>
    axiosInstance.get('/api/job-offers', {
      params: { page, size }
    }),

  create: (data: JobOffer) =>
    axiosInstance.post('/api/job-offers', data),

  update: (id: number, data: JobOffer) =>
    axiosInstance.put(`/api/job-offers/${id}`, data),

  delete: (id: number) =>
    axiosInstance.delete(`/api/job-offers/${id}`),

  getById: (id: number) =>
    axiosInstance.get(`/api/job-offers/${id}`),

  close: (id: number) =>
    axiosInstance.put(`/api/job-offers/${id}/close`),

  archive: (id: number) =>
    axiosInstance.put(`/api/job-offers/${id}/archive`),

  // Public endpoints
  getPublic: () =>
    axiosInstance.get('/api/job-offers/public'),

  getActivePublic: (page: number = 0, size: number = 10) =>
    axiosInstance.get('/api/job-offers/public/active', {
      params: { page, size }
    }),

  getByStatus: (status: string, page: number = 0, size: number = 10) =>
    axiosInstance.get(`/api/job-offers/status/${status}`, {
      params: { page, size }
    }),

  getByDepartment: (department: string, page: number = 0, size: number = 10) =>
    axiosInstance.get(`/api/job-offers/department/${department}`, {
      params: { page, size }
    }),

  search: (title: string, page: number = 0, size: number = 10) =>
    axiosInstance.get('/api/job-offers/search', {
      params: { title, page, size }
    }),

  countOpen: () =>
    axiosInstance.get('/api/job-offers/count/open'),
}
