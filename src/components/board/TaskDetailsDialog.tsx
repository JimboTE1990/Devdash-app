'use client'

import React, { useState } from 'react'
import { Task, Comment, Subtask, Column, Swimlane } from '@/lib/types'
import {
  Dialog,
  ResizableDialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import {
  Calendar as CalendarIcon,
  MessageSquare,
  CheckSquare,
  Square,
  Trash2,
  Copy,
  Archive,
  ArchiveRestore,
} from 'lucide-react'
import { formatDate, formatRelativeTime, generateId } from '@/lib/utils'

interface TaskDetailsDialogProps {
  task: Task | null
  open: boolean
  onClose: () => void
  onUpdateTask: (task: Task) => void
  onCloneTask?: (task: Task) => void
  onDeleteTask?: (taskId: string) => void
  columns?: Column[]
  swimlanes?: Swimlane[]
}

export function TaskDetailsDialog({
  task,
  open,
  onClose,
  onUpdateTask,
  onCloneTask,
  onDeleteTask,
  columns,
  swimlanes,
}: TaskDetailsDialogProps) {
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [newComment, setNewComment] = useState('')
  const [newSubtask, setNewSubtask] = useState('')
  const [showCalendar, setShowCalendar] = useState(false)
  const [subtaskDatePickerId, setSubtaskDatePickerId] = useState<string | null>(null)

  React.useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
    }
  }, [task])

  if (!task) return null

  const handleSaveTitle = () => {
    if (title.trim()) {
      onUpdateTask({ ...task, title: title.trim(), updatedAt: new Date() })
    }
  }

  const handleSaveDescription = () => {
    onUpdateTask({ ...task, description, updatedAt: new Date() })
  }

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: generateId(),
        taskId: task.id,
        userId: 'current-user',
        userName: 'You',
        content: newComment.trim(),
        createdAt: new Date(),
      }
      onUpdateTask({
        ...task,
        comments: [...task.comments, comment],
        updatedAt: new Date(),
      })
      setNewComment('')
    }
  }

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      const subtask: Subtask = {
        id: generateId(),
        title: newSubtask.trim(),
        completed: false,
      }
      onUpdateTask({
        ...task,
        subtasks: [...task.subtasks, subtask],
        updatedAt: new Date(),
      })
      setNewSubtask('')
    }
  }

  const handleToggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    )
    onUpdateTask({ ...task, subtasks: updatedSubtasks, updatedAt: new Date() })
  }

  const handleDeleteSubtask = (subtaskId: string) => {
    const updatedSubtasks = task.subtasks.filter((st) => st.id !== subtaskId)
    onUpdateTask({ ...task, subtasks: updatedSubtasks, updatedAt: new Date() })
  }

  const handleSetSubtaskDueDate = (subtaskId: string, date: Date | undefined) => {
    const updatedSubtasks = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, dueDate: date } : st
    )
    onUpdateTask({ ...task, subtasks: updatedSubtasks, updatedAt: new Date() })
    setSubtaskDatePickerId(null)
  }

  const handleSetDueDate = (date: Date) => {
    onUpdateTask({ ...task, dueDate: date, updatedAt: new Date() })
    setShowCalendar(false)
  }

  const handleClone = () => {
    if (onCloneTask && task) {
      onCloneTask(task)
      onClose()
    }
  }

  const handleDelete = () => {
    if (onDeleteTask && task) {
      if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
        onDeleteTask(task.id)
        onClose()
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <ResizableDialogContent className="px-6 py-6 overflow-y-auto">
        <DialogClose onClick={onClose} />
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <DialogTitle>Task Details</DialogTitle>
            <div className="flex items-center gap-2">
              {onCloneTask && (
                <Button
                  onClick={handleClone}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Clone
                </Button>
              )}
              {onDeleteTask && (
                <Button
                  onClick={handleDelete}
                  variant="outline"
                  size="sm"
                  className="gap-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSaveTitle}
              placeholder="Enter task title..."
              className="text-lg font-medium"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleSaveDescription}
              placeholder="Add a description..."
              rows={3}
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label>Due Date</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCalendar(!showCalendar)}
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                {task.dueDate ? formatDate(task.dueDate) : 'Set due date'}
              </Button>
              {task.dueDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onUpdateTask({ ...task, dueDate: undefined, updatedAt: new Date() })
                  }
                >
                  Clear
                </Button>
              )}
            </div>
            {showCalendar && (
              <Calendar selected={task.dueDate} onSelect={handleSetDueDate} />
            )}
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <select
              value={task.priority || 'medium'}
              onChange={(e) => onUpdateTask({ ...task, priority: e.target.value as 'low' | 'medium' | 'high', updatedAt: new Date() })}
              className="w-full px-3 py-2 bg-card border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Move to Column */}
          {columns && columns.length > 0 && (
            <div className="space-y-2">
              <Label>Move to Column</Label>
              <select
                value={task.columnId}
                onChange={(e) => onUpdateTask({ ...task, columnId: e.target.value, updatedAt: new Date() })}
                className="w-full px-3 py-2 bg-card border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {columns.map((column) => (
                  <option key={column.id} value={column.id}>
                    {column.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Archive/Unarchive */}
          {task.columnId === columns?.find(c => c.title.toLowerCase() === 'done')?.id && (
            <div className="space-y-2">
              <Label>Archive</Label>
              <div className="flex gap-2">
                {task.isArchived ? (
                  <Button
                    onClick={() => onUpdateTask({ ...task, isArchived: false, archivedAt: undefined, updatedAt: new Date() })}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <ArchiveRestore className="h-4 w-4" />
                    Unarchive Task
                  </Button>
                ) : (
                  <Button
                    onClick={() => onUpdateTask({ ...task, isArchived: true, archivedAt: new Date(), updatedAt: new Date() })}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Archive className="h-4 w-4" />
                    Archive Task
                  </Button>
                )}
                {task.isArchived && (
                  <Badge variant="secondary" className="text-xs">
                    Archived {task.archivedAt && `on ${formatDate(task.archivedAt)}`}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Subtasks */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                Subtasks ({task.subtasks.filter((st) => st.completed).length}/
                {task.subtasks.length})
              </Label>
              {task.subtasks.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      const updatedSubtasks = task.subtasks.map((st) => ({ ...st, completed: true }))
                      onUpdateTask({ ...task, subtasks: updatedSubtasks, updatedAt: new Date() })
                    }}
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-green-400 hover:text-green-300"
                  >
                    Check All
                  </Button>
                  <Button
                    onClick={() => {
                      const updatedSubtasks = task.subtasks.map((st) => ({ ...st, completed: false }))
                      onUpdateTask({ ...task, subtasks: updatedSubtasks, updatedAt: new Date() })
                    }}
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-gray-400 hover:text-gray-300"
                  >
                    Uncheck All
                  </Button>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {task.subtasks.map((subtask) => (
                <div key={subtask.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleSubtask(subtask.id)}
                      className="text-gray-400 hover:text-white"
                    >
                      {subtask.completed ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                    <span
                      className={`flex-1 text-sm ${
                        subtask.completed ? 'line-through text-muted-foreground' : 'text-foreground/80'
                      }`}
                    >
                      {subtask.title}
                    </span>
                    <Button
                      onClick={() => setSubtaskDatePickerId(subtaskDatePickerId === subtask.id ? null : subtask.id)}
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                    >
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {subtask.dueDate ? formatDate(subtask.dueDate) : 'Date'}
                    </Button>
                    <button
                      onClick={() => handleDeleteSubtask(subtask.id)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {subtaskDatePickerId === subtask.id && (
                    <div className="ml-6 p-3 bg-muted rounded-lg border border-border">
                      <Calendar
                        selected={subtask.dueDate}
                        onSelect={(date) => handleSetSubtaskDueDate(subtask.id, date)}
                      />
                      {subtask.dueDate && (
                        <Button
                          onClick={() => handleSetSubtaskDueDate(subtask.id, undefined)}
                          variant="ghost"
                          size="sm"
                          className="w-full mt-2"
                        >
                          Clear Date
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Input
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddSubtask()
                  }}
                  placeholder="Add a subtask..."
                  className="flex-1"
                />
                <Button onClick={handleAddSubtask} size="sm">
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comments ({task.comments.length})
            </Label>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {task.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-3 bg-muted rounded-md space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {comment.userName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80">{comment.content}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleAddComment()
                  }
                }}
                placeholder="Add a comment..."
                rows={2}
                className="flex-1"
              />
              <Button onClick={handleAddComment} size="sm">
                Send
              </Button>
            </div>
          </div>

          {/* Update Button */}
          <div className="flex justify-end pt-4 border-t border-border">
            <Button
              onClick={onClose}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8"
            >
              Done
            </Button>
          </div>
        </div>
      </ResizableDialogContent>
    </Dialog>
  )
}
