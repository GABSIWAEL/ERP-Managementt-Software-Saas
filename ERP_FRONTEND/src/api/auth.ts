import axiosInstance from './client'
import {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  ApiResponse,
  User,
  PasswordChangeRequest,
  PasswordChangeResponse,
} from '@types'

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post<ApiResponse<LoginResponse>>(
      '/api/auth/login',
      credentials
    )
    return response.data.data || response.data as any
  },

  register: async (data: RegisterRequest): Promise<User> => {
    const response = await axiosInstance.post<ApiResponse<User>>(
      '/api/auth/register',
      data
    )
    return response.data.data || response.data as any
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/api/auth/logout')
  },

  // Get current authenticated user
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await axiosInstance.get<ApiResponse<User>>(
        '/api/auth/me'
      )
      return response.data.data || response.data as any
    } catch (error: any) {
      // If 401 or 404, user is not authenticated
      if (error.response?.status === 401 || error.response?.status === 404) {
        throw new Error('Not authenticated')
      }
      throw error
    }
  },

  // Change password
  changePassword: async (data: PasswordChangeRequest): Promise<PasswordChangeResponse> => {
    const response = await axiosInstance.post<ApiResponse<PasswordChangeResponse>>(
      '/api/auth/change-password',
      data
    )
    return response.data.data || response.data as any
  },
}

