'use client'

import React, { useState } from 'react'
import { Task, Comment, Subtask } from '@/lib/types'
import {
  Dialog,
  DialogContent,
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
  AlertCircle,
  XCircle,
  Trash2,
} from 'lucide-react'
import { formatDate, formatRelativeTime, generateId } from '@/lib/utils'

interface TaskDetailsDialogProps {
  task: Task | null
  open: boolean
  onClose: () => void
  onUpdateTask: (task: Task) => void
}

export function TaskDetailsDialog({
  task,
  open,
  onClose,
  onUpdateTask,
}: TaskDetailsDialogProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [newComment, setNewComment] = useState('')
  const [newSubtask, setNewSubtask] = useState('')
  const [showCalendar, setShowCalendar] = useState(false)

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
      setIsEditingTitle(false)
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

  const handleSetDueDate = (date: Date) => {
    onUpdateTask({ ...task, dueDate: date, updatedAt: new Date() })
    setShowCalendar(false)
  }

  const handleToggleBlocked = () => {
    if (task.isBlocked) {
      onUpdateTask({
        ...task,
        isBlocked: false,
        blockReason: undefined,
        updatedAt: new Date(),
      })
    } else {
      const reason = prompt('Enter block reason:')
      if (reason) {
        onUpdateTask({
          ...task,
          isBlocked: true,
          blockReason: reason,
          updatedAt: new Date(),
        })
      }
    }
  }

  const handleToggleRejected = () => {
    if (task.isRejected) {
      onUpdateTask({
        ...task,
        isRejected: false,
        rejectionReason: undefined,
        updatedAt: new Date(),
      })
    } else {
      const reason = prompt('Enter rejection reason:')
      if (reason) {
        onUpdateTask({
          ...task,
          isRejected: true,
          rejectionReason: reason,
          updatedAt: new Date(),
        })
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogClose onClick={onClose} />
        <DialogHeader>
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle()
                  if (e.key === 'Escape') {
                    setTitle(task.title)
                    setIsEditingTitle(false)
                  }
                }}
                autoFocus
              />
            </div>
          ) : (
            <DialogTitle
              onClick={() => setIsEditingTitle(true)}
              className="cursor-pointer hover:text-[#7dd87d]"
            >
              {task.title}
            </DialogTitle>
          )}
        </DialogHeader>

        <div className="space-y-6">
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

          {/* Status Actions */}
          <div className="flex gap-2">
            <Button
              variant={task.isBlocked ? 'destructive' : 'outline'}
              size="sm"
              onClick={handleToggleBlocked}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              {task.isBlocked ? 'Unblock' : 'Block'}
            </Button>
            <Button
              variant={task.isRejected ? 'destructive' : 'outline'}
              size="sm"
              onClick={handleToggleRejected}
            >
              <XCircle className="h-4 w-4 mr-2" />
              {task.isRejected ? 'Unreject' : 'Reject'}
            </Button>
          </div>

          {task.isBlocked && task.blockReason && (
            <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-md">
              <p className="text-sm text-red-300">
                <strong>Blocked:</strong> {task.blockReason}
              </p>
            </div>
          )}

          {task.isRejected && task.rejectionReason && (
            <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-md">
              <p className="text-sm text-red-300">
                <strong>Rejected:</strong> {task.rejectionReason}
              </p>
            </div>
          )}

          {/* Subtasks */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Subtasks ({task.subtasks.filter((st) => st.completed).length}/
              {task.subtasks.length})
            </Label>
            <div className="space-y-2">
              {task.subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center gap-2">
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
                      subtask.completed ? 'line-through text-gray-500' : 'text-gray-200'
                    }`}
                  >
                    {subtask.title}
                  </span>
                  <button
                    onClick={() => handleDeleteSubtask(subtask.id)}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
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
                  className="p-3 bg-[#3a5a5a] rounded-md space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">
                      {comment.userName}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-200">{comment.content}</p>
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
