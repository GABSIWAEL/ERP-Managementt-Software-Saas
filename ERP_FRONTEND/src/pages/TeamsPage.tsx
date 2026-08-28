import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, Button, Input, Select, Textarea, Badge } from '@components/ui'
import { MainLayout } from '@components/layout'
import { teamApi, employeeApi } from '@api/index'
import { getFullName } from '@utils/helpers'
import { Plus, Edit2, Trash2, Users, X, ChevronRight, ArrowLeft } from 'lucide-react'
import { Team, Employee, UserRole } from '@types'
import { useAuthStore } from '@store/authStore'
import { useNavigate } from 'react-router-dom'
import TeamCard from '@components/teams/TeamCard'

export default function TeamsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [selectedTeamForMembers, setSelectedTeamForMembers] = useState<Team | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    departmentId: 0,
    managerId: 0
  })

  // Get current user's employee data
  const { data: currentEmployeeData } = useQuery({
    queryKey: ['currentEmployee'],
    queryFn: async () => {
      try {
        return await employeeApi.getProfile()
      } catch {
        return null
      }
    }
  })

  const isManager = user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN
  const userDepartmentId = currentEmployeeData?.departmentId

  // Fetch teams - for managers, only their department; for admin, all teams
  const { data: teamsData = { content: [] }, isLoading: teamsLoading } = useQuery({
    queryKey: ['teams', userDepartmentId],
    queryFn: async () => {
      if (isManager && userDepartmentId) {
        // Manager sees only their department's teams
        const response = await teamApi.getByDepartment(userDepartmentId, 0, 50)
        return response
      } else if (user?.role === UserRole.ADMIN) {
        // Admin sees all teams
        const response = await teamApi.getAll(0, 50)
        return response
      }
      return { content: [] }
    },
    enabled: !!(isManager && (user?.role === UserRole.ADMIN || userDepartmentId))
  })

  const teams = teamsData.content || teamsData

  // Fetch departments
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await fetch('/api/departments')
      return response.json()
    }
  })

  // Fetch employees for manager dropdown
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await fetch('/api/employees')
      return response.json()
    }
  })

  // Fetch employees for adding members
  const { data: departmentEmployees = [] } = useQuery({
    queryKey: ['departmentEmployees', formData.departmentId],
    queryFn: async () => {
      if (!formData.departmentId) return []
      const response = await employeeApi.getAll(0, 50, formData.departmentId)
      return response.content || response
    },
    enabled: !!formData.departmentId && showMembersModal
  })

  const createMutation = useMutation<any, any, any>({
    mutationFn: (data: any) => teamApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      setShowCreateModal(false)
      resetForm()
    }
  })

  const updateMutation = useMutation<any, any, any>({
    mutationFn: (data: any) => teamApi.update(editingTeam!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      setEditingTeam(null)
      resetForm()
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => teamApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    }
  })

  const addMemberMutation = useMutation({
    mutationFn: ({ teamId, employeeId }: { teamId: number; employeeId: number }) =>
      teamApi.addMember(teamId, employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      setShowMembersModal(false)
    }
  })

  const removeMemberMutation = useMutation({
    mutationFn: ({ teamId, employeeId }: { teamId: number; employeeId: number }) =>
      teamApi.removeMember(teamId, employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    }
  })

  const resetForm = () => {
    setFormData({ name: '', description: '', departmentId: 0, managerId: 0 })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.departmentId || !formData.managerId) {
      alert('Please fill all required fields')
      return
    }
    const submitData = {
      ...formData,
      departmentId: parseInt(formData.departmentId.toString()),
      managerId: parseInt(formData.managerId.toString())
    }

    if (editingTeam?.id) {
      updateMutation.mutate(submitData)
    } else {
      createMutation.mutate(submitData)
    }
  }

  const handleEdit = (team: Team) => {
    setEditingTeam(team)
    setFormData({
      name: team.name,
      description: team.description || '',
      departmentId: team.departmentId,
      managerId: team.managerId
    })
    setShowCreateModal(true)
  }

  const handleManageMembers = (team: Team) => {
    setSelectedTeamForMembers(team)
    // Set the team's department ID so departmentEmployees query fetches the right employees
    setFormData(prev => ({ ...prev, departmentId: team.departmentId }))
    setShowMembersModal(true)
  }

  const filteredTeams = teams.filter((team: Team) =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalMembers = teams.reduce((sum: number, team: Team) => sum + (team.memberCount || 0), 0)

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Team Hub</h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-2xl">A clean workspace for team planning, tracking, and member coordination.</p>
            </div>
            <Button onClick={() => {
              if (isManager && userDepartmentId) {
                setFormData({
                  name: '',
                  description: '',
                  departmentId: userDepartmentId,
                  managerId: 0
                })
              } else {
                resetForm()
              }
              setEditingTeam(null)
              setShowCreateModal(true)
            }} className="gap-2">
              <Plus size={16} />
              Create Team
            </Button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-5">
              <p className="text-sm text-gray-500">Active teams</p>
              <p className="mt-3 text-3xl font-semibold text-gray-900 dark:text-white">{teams.length}</p>
            </div>
            <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-5">
              <p className="text-sm text-gray-500">Team members</p>
              <p className="mt-3 text-3xl font-semibold text-gray-900 dark:text-white">{totalMembers}</p>
            </div>
            <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-5">
              <p className="text-sm text-gray-500">Department</p>
              <p className="mt-3 text-3xl font-semibold text-gray-900 dark:text-white">{userDepartmentId || 'All'}</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <Input
              placeholder="Search teams by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamsLoading ? (
            <div className="col-span-full text-center text-gray-500 dark:text-gray-400">
              Loading teams...
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 dark:text-gray-400">
              No teams found
            </div>
          ) : (
            filteredTeams.map((team: Team) => (
              <TeamCard
                key={team.id}
                team={team}
                onEdit={handleEdit}
                onDelete={(t) => {
                  if (confirm(`Delete team "${t.name}"?`)) {
                    deleteMutation.mutate(t.id)
                  }
                }}
                onManageMembers={handleManageMembers}
              />
            ))
          )}
        </div>

        {/* Create/Edit Team Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingTeam ? 'Edit Team' : 'Create Team'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingTeam(null)
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X size={20} />
                </button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Team Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter team name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Team description"
                      rows={3}
                    />
                  </div>

                  {!isManager ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Department *
                      </label>
                      <Select
                        value={formData.departmentId.toString()}
                        onChange={(e) => setFormData({ ...formData, departmentId: parseInt(e.target.value) })}
                        required
                      >
                        <option value="">Select department</option>
                        {departments.map((dept: any) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                  ) : (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                      <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                        ✓ Department automatically set to your department
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Manager *
                    </label>
                    <Select
                      value={formData.managerId.toString()}
                      onChange={(e) => setFormData({ ...formData, managerId: parseInt(e.target.value) })}
                      required
                    >
                      <option value="">Select manager</option>
                      {employees.map((emp: any) => (
                        <option key={emp.id} value={emp.id}>
                          {getFullName(emp.firstName, emp.lastName)}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="ghost" onClick={() => {
                      setShowCreateModal(false)
                      setEditingTeam(null)
                    }} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending} className="flex-1">
                      {editingTeam ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Manage Members Modal */}
        {showMembersModal && selectedTeamForMembers && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
            <Card className="w-full max-w-md max-h-96 overflow-y-auto">
              <CardHeader className="flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Manage Team Members
                </h2>
                <button
                  onClick={() => {
                    setShowMembersModal(false)
                    setSelectedTeamForMembers(null)
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X size={20} />
                </button>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Members */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Current Members</h3>
                  {selectedTeamForMembers.members && selectedTeamForMembers.members.length > 0 ? (
                    <div className="space-y-2">
                      {selectedTeamForMembers.members.map((member: Employee) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {getFullName(member.firstName, member.lastName)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{member.position}</p>
                          </div>
                          <button
                            onClick={() => {
                              removeMemberMutation.mutate({
                                teamId: selectedTeamForMembers.id,
                                employeeId: member.id
                              })
                            }}
                            className="text-red-600 dark:text-red-400 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No members yet</p>
                  )}
                </div>

                {/* Add Members */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Add Members</h3>
                  <Select
                    onChange={(e) => {
                      const empId = parseInt(e.target.value)
                      if (empId) {
                        addMemberMutation.mutate({
                          teamId: selectedTeamForMembers.id,
                          employeeId: empId
                        })
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="">Select employee to add...</option>
                    {departmentEmployees
                      .filter(
                        (emp: Employee) =>
                          !selectedTeamForMembers.members ||
                          !selectedTeamForMembers.members.some((m: Employee) => m.id === emp.id)
                      )
                      .map((emp: Employee) => (
                        <option key={emp.id} value={emp.id}>
                          {getFullName(emp.firstName, emp.lastName)}
                        </option>
                      ))}
                  </Select>
                </div>

                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowMembersModal(false)
                    setSelectedTeamForMembers(null)
                  }}
                  className="w-full"
                >
                  Done
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

