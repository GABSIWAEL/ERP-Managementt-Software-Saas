import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, Button, Input } from '@components/ui'
import { MainLayout } from '@components/layout'
import { departmentApi } from '@api/index'
import { Plus, Edit3, Trash2, AlertCircle } from 'lucide-react'
import { Department } from '@types'

export default function DepartmentsPage() {
  const [page, setPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [newDeptName, setNewDeptName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  
  // Edit states
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editDeptName, setEditDeptName] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  
  // Delete states
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data: departmentsData = { content: [] }, isLoading, refetch } = useQuery({
    queryKey: ['departments', page],
    queryFn: async () => {
      const response = await departmentApi.getAll(page, 20)
      return response
    }
  })

  const departments = Array.isArray(departmentsData) ? departmentsData : (departmentsData.content || [])

  const filteredDepartments = departments.filter((dept: Department) =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateDepartment = async () => {
    if (!newDeptName.trim()) return
    
    try {
      setIsCreating(true)
      await departmentApi.create({ name: newDeptName })
      setNewDeptName('')
      setShowForm(false)
      refetch()
    } catch (error) {
      console.error('Error creating department:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleStartEdit = (department: Department) => {
    setEditingId(department.id)
    setEditDeptName(department.name)
  }

  const handleEditDepartment = async () => {
    if (!editDeptName.trim() || editingId === null) return
    
    try {
      setIsUpdating(true)
      await departmentApi.update(editingId, { name: editDeptName })
      setEditingId(null)
      setEditDeptName('')
      refetch()
    } catch (error) {
      console.error('Error updating department:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteDepartment = async () => {
    if (!deleteConfirm) return
    
    try {
      setIsDeleting(true)
      await departmentApi.delete(deleteConfirm.id)
      setDeleteConfirm(null)
      refetch()
    } catch (error) {
      console.error('Error deleting department:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Departments</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Organize your company structure</p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            Add Department
          </Button>
        </div>

        {/* Create Form */}
        {showForm && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Input
                  placeholder="Department name..."
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateDepartment()}
                />
                <Button
                  variant="primary"
                  onClick={handleCreateDepartment}
                  isLoading={isCreating}
                >
                  Create
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <Input
          placeholder="Search departments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <p className="col-span-full text-center text-gray-500 dark:text-gray-400">Loading...</p>
          ) : filteredDepartments.length === 0 ? (
            <p className="col-span-full text-center text-gray-500 dark:text-gray-400">No departments found</p>
          ) : (
            filteredDepartments.map((department: Department) => (
              <Card key={department.id} className="hover:shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{department.name}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStartEdit(department)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Edit3 size={18} className="text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ id: department.id, name: department.name })}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} className="text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {department.employees?.length || 0} employees
                  </p>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Manager: {department.manager ? `${department.manager.firstName} ${department.manager.lastName}` : 'Not assigned'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Edit Modal */}
        {editingId !== null && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Department</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Department name..."
                  value={editDeptName}
                  onChange={(e) => setEditDeptName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleEditDepartment()}
                />
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    onClick={handleEditDepartment}
                    isLoading={isUpdating}
                    className="flex-1"
                  >
                    Save
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEditingId(null)
                      setEditDeptName('')
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Delete Department?</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="danger"
                    onClick={handleDeleteDepartment}
                    isLoading={isDeleting}
                    className="flex-1"
                  >
                    Delete
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

