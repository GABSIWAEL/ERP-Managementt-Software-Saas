import axiosInstance from './client'
import { ApiResponse } from '@types'

export interface AccountingParameter {
  id: number
  parameterName: string
  parameterValue: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface AccountingConfiguration {
  id?: number
  taxPercentage: number
  insurancePercentage: number
  overtimeRate: number
  bonusPercentage: number
  leavePayoutPercentage: number
  remoteAllowance: number
  createdAt?: string
  updatedAt?: string
}

export interface ParameterVersion {
  id: number
  parameterId: number
  oldValue: string
  newValue: string
  changedBy: string
  changedAt: string
}

export const accountingApi = {
  getParameters: async (): Promise<AccountingConfiguration> => {
    const response = await axiosInstance.get<ApiResponse<AccountingConfiguration>>('/api/accounting-parameters')
    return (response.data.data || response.data) as AccountingConfiguration
  },

  updateParameters: async (data: AccountingConfiguration): Promise<AccountingConfiguration> => {
    const response = await axiosInstance.put<ApiResponse<AccountingConfiguration>>('/api/accounting-parameters', data)
    return (response.data.data || response.data) as AccountingConfiguration
  },

  getById: async (id: number): Promise<AccountingParameter> => {
    const response = await axiosInstance.get<ApiResponse<AccountingParameter>>(
      `/api/accounting-parameters/${id}`
    )
    return response.data.data || response.data as any
  },

  createParameter: async (data: Omit<AccountingParameter, 'id' | 'createdAt' | 'updatedAt'>): Promise<AccountingParameter> => {
    const response = await axiosInstance.post<ApiResponse<AccountingParameter>>(
      '/api/accounting-parameters',
      data
    )
    return response.data.data || response.data as any
  },

  updateParameter: async (id: number, data: Partial<AccountingParameter>): Promise<AccountingParameter> => {
    const response = await axiosInstance.put<ApiResponse<AccountingParameter>>(
      `/api/accounting-parameters/${id}`,
      data
    )
    return response.data.data || response.data as any
  },

  deleteParameter: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/accounting-parameters/${id}`)
  },

  getCurrentVersion: async (parameterId: number): Promise<ParameterVersion> => {
    const response = await axiosInstance.get<ApiResponse<ParameterVersion>>(
      `/api/accounting-parameters/${parameterId}/current-version`
    )
    return response.data.data || response.data as any
  },

  getVersionByDate: async (parameterId: number, date: string): Promise<ParameterVersion> => {
    const response = await axiosInstance.get<ApiResponse<ParameterVersion>>(
      `/api/accounting-parameters/${parameterId}/version-by-date`,
      { params: { date } }
    )
    return response.data.data || response.data as any
  },

  getParameterHistory: async (parameterId: number, page = 0, size = 20): Promise<any> => {
    const response = await axiosInstance.get<any>(
      `/api/accounting-parameters/${parameterId}/version-history`,
      { params: { page, size } }
    )
    return response.data.data || response.data
  },

  getVersionsByDateRange: async (parameterId: number, startDate: string, endDate: string, page = 0, size = 20): Promise<any> => {
    const response = await axiosInstance.get<any>(
      `/api/accounting-parameters/${parameterId}/versions-date-range`,
      { params: { startDate, endDate, page, size } }
    )
    return response.data.data || response.data
  },

  getAllActiveVersions: async (page = 0, size = 20): Promise<any> => {
    const response = await axiosInstance.get<any>(
      '/api/accounting-parameters/versions/active',
      { params: { page, size } }
    )
    return response.data.data || response.data
  },
}

