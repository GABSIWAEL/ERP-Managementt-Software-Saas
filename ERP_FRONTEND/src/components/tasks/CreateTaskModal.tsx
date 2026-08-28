import React, { useState } from 'react'
import { Card, CardContent, CardHeader, Button, Input, Textarea, Select } from '@components/ui'
import { taskApi } from '@api/index'

export default function CreateTaskModal({ open, onClose, teamId, employees = [], onCreated }: any) {
  const [form, setForm] = useState({ title: '', description: '', assigneeId: '', priority: 'MEDIUM', dueDate: '' })
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const submit = async (e: any) => {
    e.preventDefault()
    if (!form.title.trim() || !form.assigneeId) return alert('Please fill required fields')
    setLoading(true)
    try {
      await taskApi.create({
        title: form.title,
        description: form.description,
        assigneeId: parseInt(form.assigneeId),
        priority: form.priority,
        dueDate: form.dueDate || null,
        teamId
      })
      setForm({ title: '', description: '', assigneeId: '', priority: 'MEDIUM', dueDate: '' })
      onCreated && onCreated()
      onClose()
    } catch (err) {
      console.error(err)
      alert('Failed to create task')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Create Task</h3>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Title *</label>
              <Input value={form.title} onChange={(e:any)=>setForm({...form,title:e.target.value})} />
            </div>
            <div>
              <label className="block text-sm mb-1">Description</label>
              <Textarea value={form.description} onChange={(e:any)=>setForm({...form,description:e.target.value})} rows={3} />
            </div>
            <div>
              <label className="block text-sm mb-1">Assign To *</label>
              <Select value={form.assigneeId} onChange={(e:any)=>setForm({...form,assigneeId:e.target.value})}>
                <option value="">Select</option>
                {employees.map((emp: any) => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
              </Select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm mb-1">Priority</label>
                <Select value={form.priority} onChange={(e:any)=>setForm({...form,priority:e.target.value})}>
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </Select>
              </div>
              <div className="flex-1">
                <label className="block text-sm mb-1">Due Date</label>
                <Input type="date" value={form.dueDate} onChange={(e:any)=>setForm({...form,dueDate:e.target.value})} />
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1" isLoading={loading}>Create</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
