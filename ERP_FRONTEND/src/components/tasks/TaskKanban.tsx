import React from 'react'
import { Button } from '@components/ui'

export default function TaskKanban({ tasks = [], loading = false, onStatusChange, onSelectTask }: any) {
  const columns = [
    { key: 'TODO', title: 'To Do' },
    { key: 'IN_PROGRESS', title: 'In Progress' },
    { key: 'IN_REVIEW', title: 'In Review' },
    { key: 'DONE', title: 'Done' }
  ]

  if (loading) return <div className="p-4">Loading tasks...</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {columns.map((col) => (
        <div key={col.key} className="bg-gray-50 p-3 rounded">
          <h4 className="font-semibold mb-3">{col.title} <span className="text-xs text-gray-500">{tasks.filter((t: any)=>t.status===col.key).length}</span></h4>
          <div className="space-y-3">
            {tasks.filter((t: any) => t.status === col.key).map((task: any) => (
              <div key={task.id} className="p-3 bg-white rounded shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{task.title}</div>
                    <div className="text-xs text-gray-500">{task.assigneeName || 'Unassigned'}</div>
                  </div>
                  <div className="text-right text-xs">
                    <div>{task.completionPercentage || 0}%</div>
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  {col.key !== 'DONE' && (
                    <Button size="sm" onClick={() => onStatusChange(task.id, nextStatus(col.key))}>Move</Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => onSelectTask(task.id)}>Comments</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function nextStatus(current: string) {
  const order = ['TODO','IN_PROGRESS','IN_REVIEW','DONE']
  const idx = order.indexOf(current)
  return order[Math.min(order.length-1, idx+1)]
}
