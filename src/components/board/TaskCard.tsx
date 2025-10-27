'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Task, Column } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MessageSquare, CheckSquare, AlertCircle, XCircle, Trash2, Check } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { getTaskDeadlineStatus, formatDeadlineStatus } from '@/lib/dateUtils'

interface TaskCardProps {
  task: Task
  onClick: () => void
  onDragStart: (e: React.DragEvent) => void
  onDelete?: (taskId: string) => void
  onUpdate?: (task: Task) => void
  columns?: Column[]
}

export function TaskCard({ task, onClick, onDragStart, onDelete, onUpdate, columns }: TaskCardProps) {
  const completedSubtasks = task.subtasks.filter((st) => st.completed).length
  const totalSubtasks = task.subtasks.length
  const [isDragging, setIsDragging] = React.useState(false)
  const [showDelete, setShowDelete] = React.useState(false)

  // Get deadline status for color coding
  const deadlineStatus = getTaskDeadlineStatus(task.dueDate)
  const deadlineText = formatDeadlineStatus(task.dueDate)

  // Check if task is already in Done column
  const doneColumn = columns?.find(col => col.title.toLowerCase() === 'done')
  const isInDoneColumn = task.columnId === doneColumn?.id
  const canMarkAsDone = doneColumn && !isInDoneColumn && onUpdate

  const handleToggleSubtask = (e: React.MouseEvent, subtaskId: string) => {
    e.stopPropagation()
    if (!onUpdate) return

    const updatedSubtasks = task.subtasks.map(st =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    )
    onUpdate({ ...task, subtasks: updatedSubtasks, updatedAt: new Date() })
  }

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

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    onDragStart(e)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete && confirm(`Are you sure you want to delete "${task.title}"?`)) {
      onDelete(task.id)
    }
  }

  const handleMarkAsDone = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!doneColumn || !onUpdate) return
    onUpdate({ ...task, columnId: doneColumn.id, updatedAt: new Date() })
  }

  // Get deadline border color
  const getDeadlineBorderClass = () => {
    if (!deadlineStatus) return ''
    if (deadlineStatus === 'overdue') return 'border-l-4 border-l-red-500'
    if (deadlineStatus === 'approaching') return 'border-l-4 border-l-amber-500'
    return ''
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        layout: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 }
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onMouseEnter={() => setShowDelete(true)}
        onMouseLeave={() => setShowDelete(false)}
        onDoubleClick={() => {
          if (!isDragging) onClick()
        }}
        className={`p-3 cursor-move hover:bg-border transition-colors duration-200 hover:shadow-lg active:cursor-grabbing relative ${
          isDragging ? 'opacity-50' : ''
        } ${getDeadlineBorderClass()}`}
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-foreground text-sm line-clamp-2 break-words flex-1 pr-1">{task.title}</h4>
            <div className="flex items-center gap-1 shrink-0">
              {task.priority && (
                <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                  {task.priority}
                </Badge>
              )}
              {/* Mark as Done Button - Appears on hover if not in Done column */}
              {showDelete && canMarkAsDone && (
                <Button
                  onClick={handleMarkAsDone}
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 bg-green-500/80 hover:bg-green-600"
                  title="Mark as Done"
                >
                  <Check className="h-3 w-3 text-primary-foreground" />
                </Button>
              )}
              {/* Delete Button - Appears on hover */}
              {showDelete && onDelete && (
                <Button
                  onClick={handleDelete}
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 bg-red-500/80 hover:bg-red-600"
                  title="Delete Task"
                >
                  <Trash2 className="h-3 w-3 text-primary-foreground" />
                </Button>
              )}
            </div>
          </div>

          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 break-words">{task.description}</p>
          )}

          <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
            {task.dueDate && (
              <div className={`flex items-center gap-1 ${
                deadlineStatus === 'overdue' ? 'text-red-500 font-semibold' :
                deadlineStatus === 'approaching' ? 'text-amber-500 font-semibold' :
                ''
              }`}>
                <Calendar className={`h-3 w-3 ${
                  deadlineStatus === 'overdue' ? 'text-red-500' :
                  deadlineStatus === 'approaching' ? 'text-amber-500' :
                  ''
                }`} />
                <span>{formatDate(task.dueDate)}</span>
                {deadlineText && (
                  <span className="text-[10px]">({deadlineText})</span>
                )}
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

      {/* Subtasks as mini cards */}
      {totalSubtasks > 0 && (
        <div className="ml-4 mt-1 space-y-1">
          {task.subtasks.map((subtask) => (
            <div
              key={subtask.id}
              className={`text-xs px-2 py-1.5 rounded border ${
                subtask.completed
                  ? 'bg-muted border-primary text-muted-foreground line-through'
                  : 'bg-muted border-border text-foreground/80'
              } flex items-center gap-2 transition-all duration-200 hover:border-primary`}
            >
              <button
                onClick={(e) => handleToggleSubtask(e, subtask.id)}
                className="shrink-0 cursor-pointer"
              >
                <CheckSquare className={`h-3 w-3 ${subtask.completed ? 'text-primary' : 'text-muted-foreground'}`} />
              </button>
              <span className="flex-1 break-words">{subtask.title}</span>
              {subtask.dueDate && (
                <div className="flex items-center gap-1 text-muted-foreground shrink-0">
                  <Calendar className="h-3 w-3" />
                  <span className="text-[10px]">{formatDate(subtask.dueDate)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
