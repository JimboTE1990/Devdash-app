'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Task } from '@/lib/types'

interface Week {
  weekNumber: number
  startDate: Date
  endDate: Date
}

interface Column {
  id: string
  title: string
  order: number
}

interface Swimlane {
  id: string
  title: string
  order: number
}

interface CreatePlannerTaskDialogProps {
  open: boolean
  onClose: () => void
  onCreateTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  columns: Column[]
  swimlanes: Swimlane[]
  selectedWeek?: Week
}

export function CreatePlannerTaskDialog({
  open,
  onClose,
  onCreateTask,
  columns,
  swimlanes,
  selectedWeek,
}: CreatePlannerTaskDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [initialComment, setInitialComment] = useState('')
  const [selectedColumn, setSelectedColumn] = useState(columns[0]?.id || '')
  const [selectedSwimlane, setSelectedSwimlane] = useState(swimlanes[0]?.id || '')
  const [isRecurring, setIsRecurring] = useState(false)

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
      dueDate: isRecurring ? undefined : selectedWeek?.endDate, // No due date for recurring tasks
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
      isRecurring,
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
    setSelectedColumn(columns[0]?.id || '')
    setSelectedSwimlane(swimlanes[0]?.id || '')
    setIsRecurring(false)
    onClose()
  }

  const formatWeekRange = (week: Week) => {
    const start = week.startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    const end = week.endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    return `${start} - ${end}`
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            {selectedWeek && (
              <span className="text-primary">
                Week {selectedWeek.weekNumber}: {formatWeekRange(selectedWeek)}
              </span>
            )}
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

          {/* Section Selection */}
          <div className="space-y-2">
            <Label htmlFor="swimlane" className="text-foreground">
              Add to section
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

          {/* Recurring Checkbox */}
          <div className="space-y-2 p-4 bg-muted border border-border rounded-lg">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="recurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border bg-card text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <Label htmlFor="recurring" className="text-foreground font-medium cursor-pointer">
                  Make this a recurring task
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {isRecurring
                    ? "This task will appear in every week of this month automatically"
                    : "Enable to show this task in all weeks"}
                </p>
              </div>
            </div>
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
