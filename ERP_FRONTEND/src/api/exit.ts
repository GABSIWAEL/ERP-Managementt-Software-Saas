import axiosInstance from './client'
import { ApiResponse } from '@types'

export interface ResignationRequest {
  id: number
  employeeId: number
  employeeName: string
  resignationDate: string
  lastWorkingDate: string
  reason: string
  status: string // PENDING, APPROVED, REJECTED
  createdAt: string
  updatedAt: string
}

export interface ExitChecklistItem {
  id: number
  resignationId: number
  itemName: string
  completed: boolean
  completedBy: string
  completedAt: string
}

export const exitApi = {
  // Resignation Management
  getAll: async (page = 0, size = 20, status?: string): Promise<any> => {
    const response = await axiosInstance.get<any>('/api/resignations', {
      params: { page, size, status }
    })
    return response.data.data || response.data
  },

  getById: async (id: number): Promise<ResignationRequest> => {
    const response = await axiosInstance.get<ApiResponse<ResignationRequest>>(
      `/api/resignations/${id}`
    )
    return response.data.data || response.data as any
  },

  getByEmployee: async (employeeId: number): Promise<ResignationRequest[]> => {
    const response = await axiosInstance.get<any>(
      `/api/resignations/employee/${employeeId}`
    )
    return response.data.data || response.data
  },

  getByStatus: async (status: string, page = 0, size = 20): Promise<any> => {
    const response = await axiosInstance.get<any>('/api/resignations/status', {
      params: { status, page, size }
    })
    return response.data.data || response.data
  },

  getPending: async (page = 0, size = 20): Promise<any> => {
    const response = await axiosInstance.get<any>('/api/resignations/pending', {
      params: { page, size }
    })
    return response.data.data || response.data
  },

  submitResignation: async (data: Omit<ResignationRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<ResignationRequest> => {
    const response = await axiosInstance.post<ApiResponse<ResignationRequest>>(
      '/api/resignations',
      data
    )
    return response.data.data || response.data as any
  },

  approveResignation: async (id: number): Promise<ResignationRequest> => {
    const response = await axiosInstance.post<ApiResponse<ResignationRequest>>(
      `/api/resignations/${id}/approve`
    )
    return response.data.data || response.data as any
  },

  rejectResignation: async (id: number): Promise<ResignationRequest> => {
    const response = await axiosInstance.post<ApiResponse<ResignationRequest>>(
      `/api/resignations/${id}/reject`
    )
    return response.data.data || response.data as any
  },

  deleteResignation: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/resignations/${id}`)
  },

  // Exit Checklist
  getChecklist: async (resignationId: number): Promise<ExitChecklistItem[]> => {
    const response = await axiosInstance.get<any>(
      `/api/resignations/${resignationId}/exit-checklist`
    )
    return response.data.data || response.data
  },

  markChecklistItem: async (checklistId: number, completed: boolean): Promise<ExitChecklistItem> => {
    const response = await axiosInstance.put<ApiResponse<ExitChecklistItem>>(
      `/api/resignations/exit-checklist/${checklistId}`,
      { completed }
    )
    return response.data.data || response.data as any
  },
}

