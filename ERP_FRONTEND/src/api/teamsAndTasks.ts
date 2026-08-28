import axiosInstance from './client'

export const teamApi = {
  create: async (data: any) => {
    const response = await axiosInstance.post('/api/teams', data)
    return response.data.data || response.data
  },

  update: async (id: number, data: any) => {
    const response = await axiosInstance.put(`/api/teams/${id}`, data)
    return response.data.data || response.data
  },

  getById: async (id: number) => {
    const response = await axiosInstance.get(`/api/teams/${id}`)
    return response.data.data || response.data
  },

  getAll: async (page = 0, size = 10) => {
    const response = await axiosInstance.get('/api/teams', {
      params: { page, size }
    })
    return response.data.data || response.data
  },

  getByDepartment: async (departmentId: number, page = 0, size = 10) => {
    const response = await axiosInstance.get(`/api/teams/department/${departmentId}`, {
      params: { page, size }
    })
    return response.data.data || response.data
  },

  getByManager: async (managerId: number, page = 0, size = 10) => {
    const response = await axiosInstance.get(`/api/teams/manager/${managerId}`, {
      params: { page, size }
    })
    return response.data.data || response.data
  },

  getByEmployee: async (employeeId: number) => {
    const response = await axiosInstance.get(`/api/teams/employee/${employeeId}`)
    return response.data.data || response.data
  },

  addMember: async (teamId: number, employeeId: number) => {
    const response = await axiosInstance.post(`/api/teams/${teamId}/members/${employeeId}`)
    return response.data.data || response.data
  },

  removeMember: async (teamId: number, employeeId: number) => {
    const response = await axiosInstance.delete(`/api/teams/${teamId}/members/${employeeId}`)
    return response.data.data || response.data
  },

  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/api/teams/${id}`)
    return response.data.data || response.data
  },
}

export const taskApi = {
  create: async (data: any) => {
    const response = await axiosInstance.post('/api/tasks', data)
    return response.data.data || response.data
  },

  update: async (id: number, data: any) => {
    const response = await axiosInstance.put(`/api/tasks/${id}`, data)
    return response.data.data || response.data
  },

  getById: async (id: number) => {
    const response = await axiosInstance.get(`/api/tasks/${id}`)
    return response.data.data || response.data
  },

  getAll: async (page = 0, size = 10) => {
    const response = await axiosInstance.get('/api/tasks', {
      params: { page, size }
    })
    return response.data.data || response.data
  },

  getByAssignee: async (assigneeId: number, page = 0, size = 10) => {
    const response = await axiosInstance.get(`/api/tasks/assignee/${assigneeId}`, {
      params: { page, size }
    })
    return response.data.data || response.data
  },

  getByTeam: async (teamId: number, page = 0, size = 10) => {
    const response = await axiosInstance.get(`/api/tasks/team/${teamId}`, {
      params: { page, size }
    })
    return response.data.data || response.data
  },

  getByManager: async (managerId: number, page = 0, size = 10) => {
    const response = await axiosInstance.get(`/api/tasks/manager/${managerId}`, {
      params: { page, size }
    })
    return response.data.data || response.data
  },

  getByAssigneeAndStatus: async (assigneeId: number, status: string) => {
    const response = await axiosInstance.get(`/api/tasks/assignee/${assigneeId}/status/${status}`)
    return response.data.data || response.data
  },

  updateStatus: async (id: number, status: string) => {
    const response = await axiosInstance.patch(`/api/tasks/${id}/status`, { status })
    return response.data.data || response.data
  },

  updateProgress: async (id: number, completionPercentage: number) => {
    const response = await axiosInstance.patch(`/api/tasks/${id}/progress`, { completionPercentage })
    return response.data.data || response.data
  },

  addComment: async (id: number, comment: string) => {
    const response = await axiosInstance.post(`/api/tasks/${id}/comments`, { comment })
    return response.data.data || response.data
  },

  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/api/tasks/${id}`)
    return response.data.data || response.data
  },
}
