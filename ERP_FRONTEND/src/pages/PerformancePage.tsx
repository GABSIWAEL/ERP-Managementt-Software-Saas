import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, Button, Badge, Input, Select, Modal, DataTable, Textarea } from '@components/ui'
import { MainLayout } from '@components/layout'
import { performanceApi, employeeApi } from '@api/index'
import { PerformanceEvaluation, Employee } from '@types'
import { formatDate, getFullName } from '@utils/helpers'
import { Plus, Star, TrendingUp, Eye } from 'lucide-react'

const performanceSchema = z.object({
  evaluatorId: z.string().min(1, 'Evaluator is required'),
  rating: z.enum(['1', '2', '3', '4', '5']),
  feedback: z.string().min(1, 'Feedback is required'),
  strengths: z.string().optional(),
  areasForImprovement: z.string().optional(),
})

type PerformanceFormData = z.infer<typeof performanceSchema>

export default function PerformancePage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedEvaluation, setSelectedEvaluation] = useState<PerformanceEvaluation | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Fetch evaluations
  const { data: evaluationsData = { content: [] }, isLoading } = useQuery({
    queryKey: ['performance', page],
    queryFn: async () => {
      const response = await performanceApi.getAll(page, 20)
      return response
    }
  })

  // Fetch employees for evaluator dropdown
  const { data: employees = [] } = useQuery({
    queryKey: ['employees-for-perf'],
    queryFn: async () => {
      const response = await employeeApi.getAll(0, 100)
      return response.content || response
    }
  })

  // Create evaluation mutation
  const createEvaluationMutation = useMutation({
    mutationFn: (data: PerformanceFormData) =>
      performanceApi.create({
        ...data,
        rating: parseInt(data.rating)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance'] })
      setShowCreateModal(false)
      resetCreateForm()
    }
  })

  const { register: registerCreate, handleSubmit: handleCreateSubmit, formState: { errors: createErrors }, reset: resetCreateForm } = useForm<PerformanceFormData>({
    resolver: zodResolver(performanceSchema),
    defaultValues: {
      rating: '3'
    }
  })

  const onCreateEvaluation = (data: PerformanceFormData) => {
    createEvaluationMutation.mutate(data)
  }

  const filteredEvaluations = evaluationsData.content?.filter((evaluation: PerformanceEvaluation) =>
    getFullName(evaluation.employee?.firstName, evaluation.employee?.lastName).toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
      />
    ))
  }

  const avgRating = filteredEvaluations.length > 0
    ? (filteredEvaluations.reduce((sum: number, e: PerformanceEvaluation) => sum + (e.rating || 0), 0) / filteredEvaluations.length).toFixed(1)
    : 0

  const columns = [
    {
      key: 'employee' as const,
      label: 'Employee',
      render: (value: Employee) => value ? `${value.firstName} ${value.lastName}` : '-'
    },
    {
      key: 'evaluator' as const,
      label: 'Evaluator',
      render: (value: Employee) => value ? `${value.firstName} ${value.lastName}` : '-'
    },
    {
      key: 'rating' as const,
      label: 'Rating',
      render: (value: number) => (
        <div className="flex items-center gap-1">
          {getRatingStars(value)}
          <span className="ml-2 font-semibold text-gray-900 dark:text-white">{value}/5</span>
        </div>
      )
    },
    {
      key: 'evaluationDate' as const,
      label: 'Date',
      render: (value: string) => formatDate(value)
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: string, item: PerformanceEvaluation) => (
        <div className="flex items-center gap-2">
          <Badge status={value as any}>{value}</Badge>
          <button
            onClick={() => {
              setSelectedEvaluation(item)
              setShowDetailModal(true)
            }}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="View details"
          >
            <Eye size={16} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      )
    },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Performance Evaluations</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track and manage employee performance ratings</p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            New Evaluation
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Evaluations</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{filteredEvaluations.length}</p>
                </div>
                <TrendingUp className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 flex items-center gap-1">
                    {avgRating}
                    <Star size={20} className="fill-yellow-400 text-yellow-400" />
                  </p>
                </div>
                <Star className="fill-yellow-400 text-yellow-400" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Employees Evaluated</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {[...new Set(filteredEvaluations.map((e: PerformanceEvaluation) => e.employee?.id))].length}
                  </p>
                </div>
                <TrendingUp className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Input
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Evaluations Table */}
        <DataTable
          columns={columns}
          data={filteredEvaluations}
          isLoading={isLoading}
          page={page}
          pageSize={20}
          onPageChange={setPage}
          emptyMessage="No performance evaluations found"
        />
      </div>

      {/* Create Evaluation Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          resetCreateForm()
        }}
        title="New Performance Evaluation"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateSubmit(onCreateEvaluation)} isLoading={createEvaluationMutation.isPending}>
              Save Evaluation
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <Select
            label="Evaluator"
            {...registerCreate('evaluatorId')}
            error={createErrors.evaluatorId?.message}
            options={employees.map((emp: Employee) => ({
              value: emp.id.toString(),
              label: `${emp.firstName} ${emp.lastName}`
            }))}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating (1-5 stars)</label>
            <div className="flex items-center gap-4">
              <select
                {...registerCreate('rating')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="1">⭐ 1 - Poor</option>
                <option value="2">⭐⭐ 2 - Fair</option>
                <option value="3">⭐⭐⭐ 3 - Average</option>
                <option value="4">⭐⭐⭐⭐ 4 - Good</option>
                <option value="5">⭐⭐⭐⭐⭐ 5 - Excellent</option>
              </select>
            </div>
            {createErrors.rating && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{createErrors.rating.message}</p>}
          </div>

          <Textarea
            label="Feedback"
            placeholder="Provide detailed feedback on performance..."
            {...registerCreate('feedback')}
            error={createErrors.feedback?.message}
            rows={4}
          />

          <Textarea
            label="Strengths (Optional)"
            placeholder="Key strengths and accomplishments..."
            {...registerCreate('strengths')}
            rows={3}
          />

          <Textarea
            label="Areas for Improvement (Optional)"
            placeholder="Areas where employee can improve..."
            {...registerCreate('areasForImprovement')}
            rows={3}
          />
        </form>
      </Modal>

      {/* Evaluation Details Modal */}
      <Modal
        isOpen={showDetailModal && selectedEvaluation !== null}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedEvaluation(null)
        }}
        title={`Performance Evaluation - ${selectedEvaluation?.employee?.firstName} ${selectedEvaluation?.employee?.lastName}`}
        size="lg"
      >
        {selectedEvaluation && (
          <div className="space-y-6">
            {/* Rating */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Overall Rating</h4>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {getRatingStars(selectedEvaluation.rating || 0)}
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">{selectedEvaluation.rating || 0}/5</span>
              </div>
            </div>

            {/* Evaluator info */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Evaluator</h4>
              <p className="text-gray-700 dark:text-gray-300">
                {selectedEvaluation.evaluator?.firstName} {selectedEvaluation.evaluator?.lastName}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Evaluated on {formatDate(selectedEvaluation.evaluationDate || '')}
              </p>
            </div>

            {/* Feedback */}
            {selectedEvaluation.feedback && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Feedback</h4>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedEvaluation.feedback}</p>
              </div>
            )}

            {/* Strengths */}
            {selectedEvaluation.strengths && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Strengths</h4>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedEvaluation.strengths}</p>
              </div>
            )}

            {/* Areas for Improvement */}
            {selectedEvaluation.areasForImprovement && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Areas for Improvement</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedEvaluation.areasForImprovement}</p>
              </div>
            )}

            {/* Status */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Status: <Badge status={selectedEvaluation.status as any}>{selectedEvaluation.status}</Badge>
            </div>
          </div>
        )}
      </Modal>
    </MainLayout>
  )
}

