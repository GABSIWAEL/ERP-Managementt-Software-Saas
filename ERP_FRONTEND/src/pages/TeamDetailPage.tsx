import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, Button, Badge } from '@components/ui'
import { MainLayout } from '@components/layout'
import { teamApi, taskApi, employeeApi } from '@api/index'
import CreateTaskModal from '../components/tasks/CreateTaskModal'
import { Users, CheckCircle, Clock, ArrowRight } from 'lucide-react'

export default function TeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [showCreateTask, setShowCreateTask] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)

  const { data: team, isLoading: teamLoading } = useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      if (!teamId) return null
      return await teamApi.getById(parseInt(teamId))
    },
    enabled: !!teamId
  })

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['teamTasks', teamId],
    queryFn: async () => {
      if (!teamId) return []
      const resp = await taskApi.getByTeam(parseInt(teamId))
      return resp.content || resp
    },
    enabled: !!teamId
  })

  const { data: employees = [] } = useQuery({
    queryKey: ['teamEmployees', team?.departmentId],
    queryFn: async () => {
      if (!team?.departmentId) return []
      const resp = await employeeApi.getAll(0, 50, team.departmentId)
      return resp.content || resp
    },
    enabled: !!team?.departmentId
  })

  if (teamLoading) return <MainLayout><div className="p-8">Loading team...</div></MainLayout>
  if (!team) return <MainLayout><div className="p-8">Team not found <Button onClick={() => navigate('/teams')}>Back</Button></div></MainLayout>

  const statusCounts = {
    TODO: 0,
    IN_PROGRESS: 0,
    IN_REVIEW: 0,
    DONE: 0,
    BLOCKED: 0,
    CANCELLED: 0,
  }

  tasks.forEach((task: any) => {
    if (statusCounts[task.status] !== undefined) {
      statusCounts[task.status] += 1
    }
  })

  const topTasks = tasks.slice(0, 4)

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-100 text-primary-800 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
                <Users size={14} /> Team overview
              </div>
              <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">{team.name}</h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-2xl">{team.description || 'This team is configured for collaborative work on your department goals.'}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate('/tasks')}>
                <ArrowRight size={16} /> View Workboard
              </Button>
              <Button onClick={() => setShowCreateTask(true)}>Create Team Task</Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED', 'CANCELLED'].map((status) => (
                <div key={status} className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">{status.replace('_', ' ')}</span>
                    <Badge>{statusCounts[status]}</Badge>
                  </div>
                </div>
              ))}
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                    <CheckCircle size={18} /> Team tasks
                  </div>
                  <div className="text-sm text-gray-500">{tasks.length} total</div>
                </div>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <div className="text-sm text-gray-500">Loading tasks...</div>
                ) : topTasks.length === 0 ? (
                  <div className="text-sm text-gray-500">No tasks have been created for this team yet.</div>
                ) : (
                  <div className="space-y-4">
                    {topTasks.map((task: any) => (
                      <div key={task.id} className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{task.title}</h3>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description || 'No description provided.'}</p>
                          </div>
                          <span className="text-xs uppercase tracking-[0.2em] text-gray-500">{task.status.replace('_', ' ')}</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                          <span>Assignee: {task.assigneeName || 'Unassigned'}</span>
                          <span>{task.dueDate ? `Due ${task.dueDate}` : 'No due date'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                  <Users size={18} /> Team members
                </div>
              </CardHeader>
              <CardContent>
                {team.members && team.members.length > 0 ? (
                  <div className="space-y-4">
                    {team.members.map((member: any) => (
                      <div key={member.id} className="flex items-center gap-3 rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
                        <div className="h-12 w-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold">{member.firstName?.[0]}{member.lastName?.[0]}</div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{member.firstName} {member.lastName}</p>
                          <p className="text-sm text-gray-500">{member.jobPosition || member.position || 'Team member'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No team members have been added to this team yet.</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                  <Clock size={18} /> Quick actions
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={() => setShowCreateTask(true)} className="w-full">Create task for this team</Button>
                <Button variant="ghost" onClick={() => navigate('/tasks')} className="w-full">Go to workboard</Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <CreateTaskModal
          open={showCreateTask}
          onClose={() => setShowCreateTask(false)}
          teamId={parseInt(teamId!)}
          employees={employees}
          onCreated={() => queryClient.invalidateQueries({ queryKey: ['teamTasks', teamId] })}
        />
      </div>
    </MainLayout>
  )
}

