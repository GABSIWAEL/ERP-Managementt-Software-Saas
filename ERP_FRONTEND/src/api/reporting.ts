import axiosInstance from './client'
import { ApiResponse } from '@types'

export const reportingApi = {
  // Payroll Summaries
  getPayrollSummaryAll: async (month: number, year: number): Promise<any> => {
    const response = await axiosInstance.get<any>(
      `/api/reports/payroll/summary`,
      { params: { month, year } }
    )
    return response.data.data || response.data
  },

  getPayrollSummaryEmployee: async (employeeId: number, month: number, year: number): Promise<any> => {
    const response = await axiosInstance.get<any>(
      `/api/reports/payroll/summary/employee/${employeeId}`,
      { params: { month, year } }
    )
    return response.data.data || response.data
  },

  getPayrollSummaryDepartment: async (departmentId: number, month: number, year: number): Promise<any> => {
    const response = await axiosInstance.get<any>(
      `/api/reports/payroll/summary/department/${departmentId}`,
      { params: { month, year } }
    )
    return response.data.data || response.data
  },

  // Attendance Summaries
  getAttendanceSummaryAll: async (startDate: string, endDate: string): Promise<any> => {
    const response = await axiosInstance.get<any>(
      `/api/reports/attendance/summary`,
      { params: { startDate, endDate } }
    )
    return response.data.data || response.data
  },

  getAttendanceSummaryEmployee: async (employeeId: number, startDate: string, endDate: string): Promise<any> => {
    const response = await axiosInstance.get<any>(
      `/api/reports/attendance/summary/employee/${employeeId}`,
      { params: { startDate, endDate } }
    )
    return response.data.data || response.data
  },

  getAttendanceSummaryDepartment: async (departmentId: number, startDate: string, endDate: string): Promise<any> => {
    const response = await axiosInstance.get<any>(
      `/api/reports/attendance/summary/department/${departmentId}`,
      { params: { startDate, endDate } }
    )
    return response.data.data || response.data
  },

  // Leave Summaries
  getLeaveSummaryAll: async (year: number): Promise<any> => {
    const response = await axiosInstance.get<any>(
      `/api/reports/leave/summary`,
      { params: { year } }
    )
    return response.data.data || response.data
  },

  getLeaveSummaryEmployee: async (employeeId: number, year: number): Promise<any> => {
    const response = await axiosInstance.get<any>(
      `/api/reports/leave/summary/employee/${employeeId}`,
      { params: { year } }
    )
    return response.data.data || response.data
  },

  getLeaveSummaryDepartment: async (departmentId: number, year: number): Promise<any> => {
    const response = await axiosInstance.get<any>(
      `/api/reports/leave/summary/department/${departmentId}`,
      { params: { year } }
    )
    return response.data.data || response.data
  },

  // Department Summaries
  getAllDepartmentSummaries: async (page = 0, size = 20): Promise<any> => {
    const response = await axiosInstance.get<any>(
      `/api/reports/department/summaries`,
      { params: { page, size } }
    )
    return response.data.data || response.data
  },

  getDepartmentSummaryById: async (departmentId: number): Promise<any> => {
    const response = await axiosInstance.get<any>(
      `/api/reports/department/summary/${departmentId}`
    )
    return response.data.data || response.data
  },

  // Performance Summaries
  getPerformanceSummaryAll: async (year: number): Promise<any> => {
    const response = await axiosInstance.get<any>(
      `/api/reports/performance/summary`,
      { params: { year } }
    )
    return response.data.data || response.data
  },

  getPerformanceSummaryEmployee: async (employeeId: number, year: number): Promise<any> => {
    const response = await axiosInstance.get<any>(
      `/api/reports/performance/summary/employee/${employeeId}`,
      { params: { year } }
    )
    return response.data.data || response.data
  },

  getPerformanceSummaryDepartment: async (departmentId: number, year: number): Promise<any> => {
    const response = await axiosInstance.get<any>(
      `/api/reports/performance/summary/department/${departmentId}`,
      { params: { year } }
    )
    return response.data.data || response.data
  },
}

