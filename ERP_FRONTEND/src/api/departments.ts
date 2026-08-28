import axiosInstance from './client'
import { Department, DepartmentDTO, ApiResponse, PaginatedResponse, Employee } from '@types'

export const departmentApi = {
  getAll: async (page = 0, size = 20): Promise<PaginatedResponse<Department>> => {
    const response = await axiosInstance.get<any>('/api/departments', {
      params: { page, size }
    })
    return response.data.data || response.data
  },

  getById: async (id: number): Promise<Department> => {
    const response = await axiosInstance.get<ApiResponse<Department>>(`/api/departments/${id}`)
    return response.data.data || response.data as any
  },

  create: async (data: DepartmentDTO): Promise<Department> => {
    const response = await axiosInstance.post<ApiResponse<Department>>(
      '/api/departments',
      data
    )
    return response.data.data || response.data as any
  },

  update: async (id: number, data: DepartmentDTO): Promise<Department> => {
    const response = await axiosInstance.put<ApiResponse<Department>>(
      `/api/departments/${id}`,
      data
    )
    return response.data.data || response.data as any
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/departments/${id}`)
  },

  assignManager: async (departmentId: number, employeeId: number): Promise<Department> => {
    const response = await axiosInstance.post<ApiResponse<Department>>(
      `/api/departments/${departmentId}/assign-manager/${employeeId}`
    )
    return response.data.data || response.data as any
  },
}

export const employeeApi = {
  getAll: async (page = 0, size = 20, departmentId?: number): Promise<any> => {
    const response = await axiosInstance.get<any>('/api/employees', {
      params: { page, size, departmentId }
    })
    return response.data.data || response.data
  },

  getById: async (id: number): Promise<Employee> => {
    const response = await axiosInstance.get<ApiResponse<Employee>>(`/api/employees/${id}`)
    return response.data.data || response.data as any
  },

  getProfile: async (): Promise<Employee> => {
    const response = await axiosInstance.get<ApiResponse<Employee>>('/api/employees/profile')
    return response.data.data || response.data as any
  },

  getByDepartment: async (departmentId: number): Promise<Employee[]> => {
    const response = await axiosInstance.get<any>(
      `/api/employees/department/${departmentId}`
    )
    return response.data.data || response.data
  },

  create: async (data: any): Promise<Employee> => {
    const response = await axiosInstance.post<ApiResponse<Employee>>(
      '/api/employees',
      data
    )
    return response.data.data || response.data as any
  },

  update: async (id: number, data: any): Promise<Employee> => {
    const response = await axiosInstance.put<ApiResponse<Employee>>(
      `/api/employees/${id}`,
      data
    )
    return response.data.data || response.data as any
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/employees/${id}`)
  },

  transferDepartment: async (employeeId: number, departmentId: number): Promise<Employee> => {
    const response = await axiosInstance.post<ApiResponse<Employee>>(
      `/api/employees/${employeeId}/transfer-department/${departmentId}`
    )
    return response.data.data || response.data as any
  },
}

