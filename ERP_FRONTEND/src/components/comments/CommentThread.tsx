import React, { useEffect, useState } from 'react'
import { Button, Textarea } from '@components/ui'
import { taskApi } from '@api/index'

export default function CommentThread({ taskId, onComment }: any) {
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [task, setTask] = useState<any>(null)

  useEffect(() => {
    let mounted = true
    if (!taskId) { setTask(null); return }
    taskApi.getById(taskId).then((resp:any)=>{ if(mounted) setTask(resp) }).catch(()=>{})
    return ()=>{ mounted = false }
  }, [taskId])

  const submit = async () => {
    if (!taskId || !comment.trim()) return
    setLoading(true)
    try {
      await taskApi.addComment(taskId, comment)
      setComment('')
      onComment && onComment()
      // refresh local view
      const updated = await taskApi.getById(taskId)
      setTask(updated)
    } catch (err) {
      console.error(err)
      alert('Failed to add comment')
    } finally { setLoading(false) }
  }

  return (
    <div>
      {!taskId && <div className="text-sm text-gray-500">Select a task to view/add comments</div>}
      {taskId && (
        <div className="space-y-3">
          <div className="text-sm text-gray-700 font-medium">{task?.title || 'Task'}</div>
          <div className="text-xs text-gray-500">Assignee: {task?.assigneeName || '-'}</div>

          <div className="bg-gray-100 p-2 rounded max-h-48 overflow-y-auto text-sm">
            {task?.comments ? task.comments.split('\n---\n').map((c: string, i: number) => (
              <div key={i} className="mb-2 border-b pb-2">{c}</div>
            )) : <div className="text-gray-500">No comments yet</div>}
          </div>

          <div>
            <Textarea value={comment} onChange={(e:any)=>setComment(e.target.value)} rows={3} placeholder="Add a comment..." />
            <div className="flex gap-2 pt-2">
              <Button onClick={submit} loading={loading} className="flex-1">Submit</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
