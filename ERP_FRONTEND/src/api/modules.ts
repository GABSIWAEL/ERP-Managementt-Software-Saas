import axiosInstance from './client'
import {
  Attendance,
  LeaveRequest,
  LeaveRequestDTO,
  RemoteWorkRequest,
  RemoteWorkRequestDTO,
  Payroll,
  PerformanceEvaluation,
  Warning,
  Asset,
  AssetRequest,
  AssetRequestDTO,
  Holiday,
  HolidayDTO,
  Event,
  EventDTO,
  Candidate,
  CandidateDTO,
  AuditLog,
  ApiResponse,
} from '@types'

// Attendance
export const attendanceApi = {
  getAll: async (page = 0, size = 20): Promise<any> => {
    const response = await axiosInstance.get<any>('/api/attendance', {
      params: { page, size }
    })
    const payload = response.data.data || response.data
    if (Array.isArray(payload)) {
      return { content: payload, totalElements: payload.length, totalPages: 1 }
    }
    if (payload && Array.isArray(payload.content)) {
      return payload
    }
    return { content: [], totalElements: 0, totalPages: 0 }
  },

  getById: async (id: number): Promise<Attendance> => {
    const response = await axiosInstance.get<ApiResponse<Attendance>>(
      `/api/attendance/${id}`
    )
    return response.data.data || response.data as any
  },

  getByEmployee: async (employeeId: number, page = 0, size = 20): Promise<any> => {
    const response = await axiosInstance.get<any>(
      `/api/attendance/employee/${employeeId}`,
      { params: { page, size } }
    )
    return response.data.data || response.data
  },

  getByDateRange: async (startDate: string, endDate: string, page = 0, size = 20): Promise<any> => {
    const response = await axiosInstance.get<any>('/api/attendance/date-range', {
      params: { startDate, endDate, page, size }
    })
    return response.data.data || response.data
  },

  getByStatus: async (status: string, page = 0, size = 20): Promise<any> => {
    const response = await axiosInstance.get<any>('/api/attendance/status', {
      params: { status, page, size }
    })
    return response.data.data || response.data
  },

  checkIn: async (employeeId: number, workMode?: string): Promise<Attendance> => {
    const response = await axiosInstance.post<ApiResponse<Attendance>>(
      `/api/attendance/check-in/${employeeId}`,
      null,
      { params: { workMode } }
    )
    return response.data.data || response.data as any
  },

  checkOut: async (employeeId: number): Promise<Attendance> => {
    const response = await axiosInstance.post<ApiResponse<Attendance>>(
      `/api/attendance/check-out/${employeeId}`
    )
    return response.data.data || response.data as any
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/attendance/${id}`)
  },

  getReport: async (params: { startDate: string; endDate: string }): Promise<any> => {
    const response = await axiosInstance.get<any>('/api/reports/attendance/summary', {
      params
    })
    return response.data.data || response.data
  },
}

// Leave Requests
export const leaveApi = {
  getAll: async (page = 0, size = 20, status?: string): Promise<any> => {
    const response = await axiosInstance.get<any>('/api/leaves', {
      params: { page, size, status }
    })
    // Extract leaves array from ApiResponse and wrap in consistent format
    const leaves = response.data.data || response.data
    return Array.isArray(leaves) ? { content: leaves } : leaves
  },

  getById: async (id: number): Promise<LeaveRequest> => {
    const response = await axiosInstance.get<ApiResponse<LeaveRequest>>(
      `/api/leaves/${id}`
    )
    return response.data.data || response.data as any
  },

  getByEmployee: async (employeeId: number, page = 0, size = 20): Promise<any> => {
    const response = await axiosInstance.get<any>(
      `/api/leaves/employee/${employeeId}`,
      { params: { page, size } }
    )
    // Extract leaves array from ApiResponse and wrap in consistent format
    const leaves = response.data.data || response.data
    return Array.isArray(leaves) ? { content: leaves } : leaves
  },

  getByStatus: async (status: string, page = 0, size = 20): Promise<any> => {
    const response = await axiosInstance.get<any>('/api/leaves/status', {
      params: { status, page, size }
    })
    // Extract leaves array from ApiResponse and wrap in consistent format
    const leaves = response.data.data || response.data
    return Array.isArray(leaves) ? { content: leaves } : leaves
  },

  getByDateRange: async (startDate: string, endDate: string, page = 0, size = 20): Promise<any> => {
    const response = await axiosInstance.get<any>('/api/leaves/date-range', {
      params: { startDate, endDate, page, size }
    })
    // Extract leaves array from ApiResponse and wrap in consistent format
    const leaves = response.data.data || response.data
    return Array.isArray(leaves) ? { content: leaves } : leaves
  },

  create: async (data: LeaveRequestDTO): Promise<LeaveRequest> => {
    const response = await axiosInstance.post<ApiResponse<LeaveRequest>>(
      '/api/leaves',
      data
    )
    return response.data.data || response.data as any
  },

  approve: async (id: number): Promise<LeaveRequest> => {
    const response = await axiosInstance.post<ApiResponse<LeaveRequest>>(
      `/api/leaves/${id}/approve`
    )
    return response.data.data || response.data as any
  },

  reject: async (id: number): Promise<LeaveRequest> => {
    const response = await axiosInstance.post<ApiResponse<LeaveRequest>>(
      `/api/leaves/${id}/reject`
    )
    return response.data.data || response.data as any
  },

  cancel: async (id: number): Promise<LeaveRequest> => {
    const response = await axiosInstance.post<ApiResponse<LeaveRequest>>(
      `/api/leaves/${id}/cancel`
    )
    return response.data.data || response.data as any
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/leaves/${id}`)
  },

  getReport: async (params: { startDate: string; endDate: string }): Promise<any> => {
    // Extract year from startDate
    const year = new Date(params.startDate).getFullYear()
    const response = await axiosInstance.get<any>('/api/reports/leave/summary', {
      params: { year }
    })
    return response.data.data || response.data
  },
}

// Remote Work
export const remoteWorkApi = {
  getAll: async (page = 0, size = 20, status?: string): Promise<any> => {
    const response = await axiosInstance.get<any>('/api/remote-work', {
      params: { page, size, status }
    })
    return response.data.data || response.data
  },

  getById: async (id: number): Promise<RemoteWorkRequest> => {
    const response = await axiosInstance.get<ApiResponse<RemoteWorkRequest>>(
      `/api/remote-work/${id}`
    )
    return response.data.data || response.data as any
  },

  getByEmployee: async (employeeId: number, page = 0, size = 20): Promise<any> => {
    const response = await axiosInstance.get<any>(
      `/api/remote-work/employee/${employeeId}`,
      { params: { page, size } }
    )
    return response.data.data || response.data
  },

  getByStatus: async (status: string, page = 0, size = 20): Promise<any> => {
    const response = await axiosInstance.get<any>('/api/remote-work/status', {
      params: { status, page, size }
    })
    return response.data.data || response.data
  },

  getByDateRange: async (startDate: string, endDate: string, page = 0, size = 20): Promise<any> => {
    const response = await axiosInstance.get<any>('/api/remote-work/date-range', {
      params: { startDate, endDate, page, size }
    })
    return response.data.data || response.data
  },

  getPending: async (page = 0, size = 20): Promise<any> => {
    const response = await axiosInstance.get<any>('/api/remote-work/pending', {
      params: { page, size }
    })
    return response.data.data || response.data
  },

  create: async (data: RemoteWorkRequestDTO): Promise<RemoteWorkRequest> => {
    const response = await axiosInstance.post<ApiResponse<RemoteWorkRequest>>(
      '/api/remote-work',
      data
    )
    return response.data.data || response.data as any
  },

  approve: async (id: number): Promise<RemoteWorkRequest> => {
    const response = await axiosInstance.post<ApiResponse<RemoteWorkRequest>>(
      `/api/remote-work/${id}/approve`
    )
    return response.data.data || response.data as any
  },

  reject: async (id: number): Promise<RemoteWorkRequest> => {
    const response = await axiosInstance.post<ApiResponse<RemoteWorkRequest>>(
      `/api/remote-work/${id}/reject`
    )
    return response.data.data || response.data as any
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/remote-work/${id}`)
  },
}

// Payroll
export const payrollApi = {
  getAll: async (page = 0, size = 20): Promise<any> => {
    const response = await axiosInstance.get<any>('/api/payroll', {
      params: { page, size }
    })
    return response.data.data || response.data
  },

  getByEmployee: async (employeeId: number): Promise<Payroll[]> => {
    const response = await axiosInstance.get<any>(
      `/api/payroll/employee/${employeeId}`
    )
    return response.data.data || response.data
  },

  getByMonth: async (month: number, year: number): Promise<Payroll[]> => {
    const response = await axiosInstance.get<any>(
      `/api/payroll/month/${month}/${year}`
    )
    return response.data.data || response.data
  },

  generate: async (employeeId: number): Promise<Payroll> => {
    const response = await axiosInstance.post<ApiResponse<Payroll>>(
      `/api/payroll/generate/${employeeId}`
    )
    return response.data.data || response.data as any
  },

  lock: async (id: number): Promise<Payroll> => {
    const response = await axiosInstance.post<ApiResponse<Payroll>>(
      `/api/payroll/${id}/lock`
    )
    return response.data.data || response.data as any
  },

  unlock: async (id: number): Promise<Payroll> => {
    const response = await axiosInstance.post<ApiResponse<Payroll>>(
      `/api/payroll/${id}/unlock`
    )
    return response.data.data || response.data as any
  },

  update: async (id: number, data: any): Promise<Payroll> => {
    const response = await axiosInstance.put<ApiResponse<Payroll>>(
      `/api/payroll/${id}`,
      data
    )
    return response.data.data || response.data as any
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/payroll/${id}`)
  },

  getReport: async (params: { startDate: string; endDate: string }): Promise<any> => {
    // Extract month and year from startDate
    const date = new Date(params.startDate)
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    const response = await axiosInstance.get<any>('/api/reports/payroll/summary', {
      params: { month, year }
    })
    return response.data.data || response.data
  },
}

// Performance
export const performanceApi = {
  getAll: async (page = 0, size = 20): Promise<any> => {
    const response = await axiosInstance.get<any>('/api/performance', {
      params: { page, size }
    })
    return response.data.data || response.data
  },

  getById: async (id: number): Promise<PerformanceEvaluation> => {
    const response = await axiosInstance.get<ApiResponse<PerformanceEvaluation>>(
      `/api/performance/${id}`
    )
    return response.data.data || response.data as any
  },

  getByEmployee: async (employeeId: number, page = 0, size = 20): Promise<any> => {
    const response = await axiosInstance.get<any>(
      `/api/performance/employee/${employeeId}`,
      { params: { page, size } }
    )
    return response.data.data || response.data
  },

  getByEvaluator: async (evaluatorId: number, page = 0, size = 20): Promise<any> => {
    const response = await axiosInstance.get<any>(
      `/api/performance/evaluator/${evaluatorId}`,
      { params: { page, size } }
    )
    return response.data.data || response.data
  },

  create: async (data: any): Promise<PerformanceEvaluation> => {
    const response = await axiosInstance.post<ApiResponse<PerformanceEvaluation>>(
      '/api/performance',
      data
    )
    return response.data.data || response.data as any
  },

  update: async (id: number, data: any): Promise<PerformanceEvaluation> => {
    const response = await axiosInstance.put<ApiResponse<PerformanceEvaluation>>(
      `/api/performance/${id}`,
      data
    )
    return response.data.data || response.data as any
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/performance/${id}`)
  },

  getReport: async (): Promise<any> => {
    const year = new Date().getFullYear()
    const response = await axiosInstance.get<any>('/api/reports/performance/summary', {
      params: { year }
    })
    return response.data.data || response.data
  },
}

// Warnings
export const warningApi = {
  getAll: async (page = 0, size = 20, severity?: string): Promise<any> => {
    if (severity) {
      const response = await axiosInstance.get<any>(`/api/warnings/severity/${severity}`)
      return response.data.data || response.data
    }

    const response = await axiosInstance.get<any>('/api/warnings')
    return response.data.data || response.data
  },

  getByEmployee: async (employeeId: number): Promise<Warning[]> => {
    const response = await axiosInstance.get<any>(
      `/api/warnings/employee/${employeeId}`
    )
    return response.data.data || response.data
  },

  create: async (employeeId: number, data: any): Promise<Warning> => {
    const response = await axiosInstance.post<ApiResponse<Warning>>(
      '/api/warnings',
      { ...data, employeeId }
    )
    return response.data.data || response.data as any
  },

  resolve: async (id: number): Promise<Warning> => {
    const response = await axiosInstance.post<ApiResponse<Warning>>(
      `/api/warnings/${id}/resolve`
    )
    return response.data.data || response.data as any
  },

  escalate: async (id: number): Promise<Warning> => {
    const response = await axiosInstance.patch<ApiResponse<Warning>>(
      `/api/warnings/${id}/escalate`
    )
    return response.data.data || response.data as any
  },

  scheduleReunion: async (id: number, reunionScheduledAt: string): Promise<Warning> => {
    const response = await axiosInstance.patch<ApiResponse<Warning>>(
      `/api/warnings/${id}/schedule-reunion`,
      { reunionScheduledAt }
    )
    return response.data.data || response.data as any
  },

  submitReport: async (id: number, reunionReport: string): Promise<Warning> => {
    const response = await axiosInstance.patch<ApiResponse<Warning>>(
      `/api/warnings/${id}/submit-report`,
      { reunionReport }
    )
    return response.data.data || response.data as any
  },
}

// Assets
export const assetApi = {
  getAll: async (page = 0, size = 20, status?: string): Promise<any> => {
    const response = await axiosInstance.get<any>('/api/assets', {
      params: { page, size, status }
    })
    return response.data.data || response.data
  },

  getById: async (id: number): Promise<Asset> => {
    const response = await axiosInstance.get<ApiResponse<Asset>>(
      `/api/assets/${id}`
    )
    return response.data.data || response.data as any
  },

  getByStatus: async (status: string, page = 0, size = 20): Promise<any> => {
    const response = await axiosInstance.get<any>('/api/assets/status', {
      params: { status, page, size }
    })
    return response.data.data || response.data
  },

  getByEmployee: async (employeeId: number, page = 0, size = 20): Promise<any> => {
    const response = await axiosInstance.get<any>(
      `/api/assets/employee/${employeeId}`,
      { params: { page, size } }
    )
    return response.data.data || response.data
  },

  create: async (data: any): Promise<Asset> => {
    const response = await axiosInstance.post<ApiResponse<Asset>>(
      '/api/assets',
      data
    )
    return response.data.data || response.data as any
  },

  update: async (id: number, data: any): Promise<Asset> => {
    const response = await axiosInstance.put<ApiResponse<Asset>>(
      `/api/assets/${id}`,
      data
    )
    return response.data.data || response.data as any
  },

  assign: async (assetId: number, employeeId: number): Promise<Asset> => {
    const response = await axiosInstance.post<ApiResponse<Asset>>(
      `/api/assets/${assetId}/assign/${employeeId}`
    )
    return response.data.data || response.data as any
  },

  return: async (assetId: number): Promise<Asset> => {
    const response = await axiosInstance.post<ApiResponse<Asset>>(
      `/api/assets/${assetId}/return`
    )
    return response.data.data || response.data as any
  },

  markAsDamaged: async (assetId: number, reason: string): Promise<Asset> => {
    const response = await axiosInstance.post<ApiResponse<Asset>>(
      `/api/assets/${assetId}/mark-damaged`,
      {},
      { params: { reason } }
    )
    return response.data.data || response.data as any
  },

  markAsSold: async (assetId: number, reason: string): Promise<Asset> => {
    const response = await axiosInstance.post<ApiResponse<Asset>>(
      `/api/assets/${assetId}/mark-sold`,
      {},
      { params: { reason } }
    )
    return response.data.data || response.data as any
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/assets/${id}`)
  },
}

// Asset Requests
export const assetRequestApi = {
  getAll: async (): Promise<AssetRequest[]> => {
    const response = await axiosInstance.get<ApiResponse<AssetRequest[]>>('/api/asset-requests')
    return ((response.data as any).data || response.data || []) as AssetRequest[]
  },

  getById: async (id: number): Promise<AssetRequest> => {
    const response = await axiosInstance.get<ApiResponse<AssetRequest>>(`/api/asset-requests/${id}`)
    return response.data.data || response.data as any
  },

  create: async (data: AssetRequestDTO): Promise<AssetRequest> => {
    const response = await axiosInstance.post<ApiResponse<AssetRequest>>('/api/asset-requests', data)
    return response.data.data || response.data as any
  },

  approve: async (id: number, comment?: string): Promise<AssetRequest> => {
    const response = await axiosInstance.put<ApiResponse<AssetRequest>>(`/api/asset-requests/${id}/approve`, null, { params: { comment } })
    return response.data.data || response.data as any
  },

  reject: async (id: number, reason: string): Promise<AssetRequest> => {
    const response = await axiosInstance.put<ApiResponse<AssetRequest>>(`/api/asset-requests/${id}/reject`, null, { params: { reason } })
    return response.data.data || response.data as any
  },
}

// Holidays
export const holidayApi = {
  getAll: async (page = 0, size = 20, type?: string): Promise<any> => {
    const response = await axiosInstance.get<any>('/api/holidays', {
      params: { page, size, ...(type && { type }) }
    })
    return response.data.data || response.data
  },

  getById: async (id: number): Promise<Holiday> => {
    const response = await axiosInstance.get<ApiResponse<Holiday>>(
      `/api/holidays/${id}`
    )
    return response.data.data || response.data as any
  },

  getRecurring: async (page = 0, size = 20): Promise<any> => {
    const response = await axiosInstance.get<any>('/api/holidays/recurring', {
      params: { page, size }
    })
    return response.data.data || response.data
  },

  getInRange: async (startDate: string, endDate: string, page = 0, size = 20): Promise<any> => {
    const response = await axiosInstance.get<any>('/api/holidays/range', {
      params: { startDate, endDate, page, size }
    })
    return response.data.data || response.data
  },

  create: async (data: HolidayDTO): Promise<Holiday> => {
    const response = await axiosInstance.post<ApiResponse<Holiday>>(
      '/api/holidays',
      data
    )
    return response.data.data || response.data as any
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/holidays/${id}`)
  },

  checkIsHoliday: async (date: string): Promise<boolean> => {
    const response = await axiosInstance.get<any>(
      `/api/holidays/check/${date}`
    )
    return response.data.data || false
  },
}

// Events
export const eventApi = {
  getAll: async (page = 0, size = 20): Promise<any> => {
    const response = await axiosInstance.get<any>('/api/events', {
      params: { page, size }
    })
    return response.data.data || response.data
  },

  getById: async (id: number): Promise<Event> => {
    const response = await axiosInstance.get<ApiResponse<Event>>(
      `/api/events/${id}`
    )
    return response.data.data || response.data as any
  },

  getByType: async (eventType: string, page = 0, size = 20): Promise<any> => {
    const response = await axiosInstance.get<any>('/api/events/type', {
      params: { eventType, page, size }
    })
    return response.data.data || response.data
  },

  getByDateRange: async (startDate: string, endDate: string, page = 0, size = 20): Promise<any> => {
    const response = await axiosInstance.get<any>('/api/events/date-range', {
      params: { startDate, endDate, page, size }
    })
    return response.data.data || response.data
  },

  getUpcoming: async (days: number = 30, page = 0, size = 20): Promise<any> => {
    const response = await axiosInstance.get<any>('/api/events/upcoming', {
      params: { days, page, size }
    })
    return response.data.data || response.data
  },

  create: async (data: EventDTO): Promise<Event> => {
    const response = await axiosInstance.post<ApiResponse<Event>>(
      '/api/events',
      data
    )
    return response.data.data || response.data as any
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/events/${id}`)
  },
}

// Candidates
export const candidateApi = {
  getAll: async (page = 0, size = 20, status?: string): Promise<any> => {
    const response = await axiosInstance.get<any>('/api/candidates', {
      params: { page, size, status }
    })
    return response.data.data || response.data
  },

  getById: async (id: number): Promise<Candidate> => {
    const response = await axiosInstance.get<ApiResponse<Candidate>>(
      `/api/candidates/${id}`
    )
    return response.data.data || response.data as any
  },

  getByStatus: async (status: string, page = 0, size = 20): Promise<any> => {
    const response = await axiosInstance.get<any>('/api/candidates/status', {
      params: { status, page, size }
    })
    return response.data.data || response.data
  },

  getByPosition: async (positionTitle: string, page = 0, size = 20): Promise<any> => {
    const response = await axiosInstance.get<any>('/api/candidates/position', {
      params: { positionTitle, page, size }
    })
    return response.data.data || response.data
  },

  getByJobOffer: async (jobOfferId: number): Promise<any> => {
    const response = await axiosInstance.get<any>(
      `/api/candidates/by-offer/${jobOfferId}`
    )
    return response.data.data || response.data || []
  },

  create: async (data: CandidateDTO): Promise<Candidate> => {
    const response = await axiosInstance.post<ApiResponse<Candidate>>(
      '/api/candidates',
      data
    )
    return response.data.data || response.data as any
  },

  updateStatus: async (candidateId: number, status: string): Promise<Candidate> => {
    const response = await axiosInstance.put<ApiResponse<Candidate>>(
      `/api/candidates/${candidateId}/status/${status}`
    )
    return response.data.data || response.data as any
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/candidates/${id}`)
  },
}

// Audit Logs
export const auditApi = {
  getAll: async (page = 0, size = 20): Promise<any> => {
    const response = await axiosInstance.get<any>('/api/audit-logs', {
      params: { page, size }
    })
    return response.data.data || response.data
  },

  getById: async (id: number): Promise<AuditLog> => {
    const response = await axiosInstance.get<ApiResponse<AuditLog>>(
      `/api/audit-logs/${id}`
    )
    return response.data.data || response.data as any
  },

  getByAction: async (action: string, page = 0, size = 20): Promise<any> => {
    const response = await axiosInstance.get<any>('/api/audit-logs/action', {
      params: { action, page, size }
    })
    return response.data.data || response.data
  },

  getByUser: async (username: string, page = 0, size = 20): Promise<any> => {
    const response = await axiosInstance.get<any>(
      `/api/audit-logs/user/${username}`,
      { params: { page, size } }
    )
    return response.data.data || response.data
  },

  getByEntity: async (entityName: string, page = 0, size = 20): Promise<any> => {
    const response = await axiosInstance.get<any>(
      `/api/audit-logs/entity/${entityName}`,
      { params: { page, size } }
    )
    return response.data.data || response.data
  },

  getByDateRange: async (startDate: string, endDate: string, page = 0, size = 20): Promise<any> => {
    const response = await axiosInstance.get<any>('/api/audit-logs/date-range', {
      params: { startDate, endDate, page, size }
    })
    return response.data.data || response.data
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/audit-logs/${id}`)
  },
}

