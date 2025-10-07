'use client'

import React from 'react'
import { Task } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MessageSquare, CheckSquare, AlertCircle, XCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onClick: () => void
  onDragStart: (e: React.DragEvent) => void
}

export function TaskCard({ task, onClick, onDragStart }: TaskCardProps) {
  const completedSubtasks = task.subtasks.filter((st) => st.completed).length
  const totalSubtasks = task.subtasks.length

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'warning'
      case 'low':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <Card
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="p-3 cursor-pointer hover:bg-[#4a6a6a] transition-colors"
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-white text-sm line-clamp-2">{task.title}</h4>
          {task.priority && (
            <Badge variant={getPriorityColor(task.priority)} className="text-xs shrink-0">
              {task.priority}
            </Badge>
          )}
        </div>

        {task.description && (
          <p className="text-xs text-gray-400 line-clamp-2">{task.description}</p>
        )}

        <div className="flex flex-wrap gap-2 items-center text-xs text-gray-400">
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          )}

          {task.comments.length > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span>{task.comments.length}</span>
            </div>
          )}

          {totalSubtasks > 0 && (
            <div className="flex items-center gap-1">
              <CheckSquare className="h-3 w-3" />
              <span>
                {completedSubtasks}/{totalSubtasks}
              </span>
            </div>
          )}

          {task.isBlocked && (
            <Badge variant="destructive" className="text-xs flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Blocked
            </Badge>
          )}

          {task.isRejected && (
            <Badge variant="destructive" className="text-xs flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              Rejected
            </Badge>
          )}
        </div>
      </div>
    </Card>
  )
}
