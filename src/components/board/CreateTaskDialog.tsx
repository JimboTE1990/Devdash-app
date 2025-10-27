'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Column, Swimlane, Task } from '@/lib/types'

interface CreateTaskDialogProps {
  open: boolean
  onClose: () => void
  onCreateTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  columns: Column[]
  swimlanes: Swimlane[]
  preselectedColumn?: string
  preselectedSwimlane?: string
}

export function CreateTaskDialog({
  open,
  onClose,
  onCreateTask,
  columns,
  swimlanes,
  preselectedColumn,
  preselectedSwimlane,
}: CreateTaskDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [initialComment, setInitialComment] = useState('')
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [selectedColumn, setSelectedColumn] = useState(preselectedColumn || columns[0]?.id || '')
  const [selectedSwimlane, setSelectedSwimlane] = useState(preselectedSwimlane || swimlanes[0]?.id || '')
  const [showCalendar, setShowCalendar] = useState(false)

  useEffect(() => {
    if (preselectedColumn) setSelectedColumn(preselectedColumn)
    if (preselectedSwimlane) setSelectedSwimlane(preselectedSwimlane)
  }, [preselectedColumn, preselectedSwimlane])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      alert('Please enter a task title')
      return
    }

    const newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      title: title.trim(),
      description: description.trim() || undefined,
      columnId: selectedColumn,
      swimlaneId: selectedSwimlane,
      dueDate,
      priority: undefined,
      assignee: undefined,
      comments: initialComment.trim()
        ? [
            {
              id: `comment-${Date.now()}`,
              taskId: '', // Will be set when task is created
              userId: 'current-user',
              userName: 'You',
              content: initialComment.trim(),
              createdAt: new Date(),
            },
          ]
        : [],
      subtasks: [],
      isBlocked: false,
      isRejected: false,
      order: 0, // Will be set by parent component
      isArchived: false,
      archivedAt: undefined,
    }

    onCreateTask(newTask)
    handleClose()
  }

  const handleClose = () => {
    setTitle('')
    setDescription('')
    setInitialComment('')
    setDueDate(undefined)
    setShowCalendar(false)
    setSelectedColumn(preselectedColumn || columns[0]?.id || '')
    setSelectedSwimlane(preselectedSwimlane || swimlanes[0]?.id || '')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to your board. All fields except title are optional.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Title - Required */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">
              Title <span className="text-red-400">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              required
              autoFocus
            />
          </div>

          {/* Target Date - Optional - MOVED UP FOR VISIBILITY */}
          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-foreground">
              Target Date <span className="text-muted-foreground text-sm">(optional)</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="dueDate"
                value={dueDate ? dueDate.toLocaleDateString() : ''}
                placeholder="Click to select target date..."
                readOnly
                onClick={() => setShowCalendar(!showCalendar)}
                className="cursor-pointer"
              />
              {dueDate && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDueDate(undefined)}
                >
                  Clear
                </Button>
              )}
            </div>
            {showCalendar && (
              <div className="border border-border rounded-lg p-3 bg-muted">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => {
                    setDueDate(date)
                    setShowCalendar(false)
                  }}
                  className="rounded-md"
                />
              </div>
            )}
          </div>

          {/* Description - Optional */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">
              Description <span className="text-muted-foreground text-sm">(optional)</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description..."
              rows={3}
            />
          </div>

          {/* Initial Comment - Optional */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-foreground">
              Add Comment <span className="text-muted-foreground text-sm">(optional)</span>
            </Label>
            <Textarea
              id="comment"
              value={initialComment}
              onChange={(e) => setInitialComment(e.target.value)}
              placeholder="Add an initial comment..."
              rows={2}
            />
          </div>

          {/* Move ticket to (Column) */}
          <div className="space-y-2">
            <Label htmlFor="column" className="text-foreground">
              Move ticket to
            </Label>
            <select
              id="column"
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value)}
              className="w-full px-3 py-2 bg-card border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {columns.map((column) => (
                <option key={column.id} value={column.id}>
                  {column.title}
                </option>
              ))}
            </select>
          </div>

          {/* Swimlane Selection */}
          <div className="space-y-2">
            <Label htmlFor="swimlane" className="text-foreground">
              Swimlane
            </Label>
            <select
              id="swimlane"
              value={selectedSwimlane}
              onChange={(e) => setSelectedSwimlane(e.target.value)}
              className="w-full px-3 py-2 bg-card border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {swimlanes.map((swimlane) => (
                <option key={swimlane.id} value={swimlane.id}>
                  {swimlane.title}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
