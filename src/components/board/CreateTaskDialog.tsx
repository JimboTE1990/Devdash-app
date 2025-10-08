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
            <Label htmlFor="title" className="text-white">
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
            <Label htmlFor="description" className="text-white">
              Description <span className="text-gray-400 text-sm">(optional)</span>
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
            <Label htmlFor="comment" className="text-white">
              Add Comment <span className="text-gray-400 text-sm">(optional)</span>
            </Label>
            <Textarea
              id="comment"
              value={initialComment}
              onChange={(e) => setInitialComment(e.target.value)}
              placeholder="Add an initial comment..."
              rows={2}
            />
          </div>

          {/* Target Date - Optional */}
          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-white">
              Target Date <span className="text-gray-400 text-sm">(optional)</span>
            </Label>
            <div className="flex gap-2">
              <Input
                value={dueDate ? dueDate.toLocaleDateString() : ''}
                placeholder="Select target date..."
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
              <div className="border border-[#4a6a6a] rounded-lg p-3 bg-[#2d4a4a]">
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

          {/* Move ticket to (Column) */}
          <div className="space-y-2">
            <Label htmlFor="column" className="text-white">
              Move ticket to
            </Label>
            <select
              id="column"
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value)}
              className="w-full px-3 py-2 bg-[#1a3a3a] border border-[#4a6a6a] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#7dd87d]"
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
            <Label htmlFor="swimlane" className="text-white">
              Swimlane
            </Label>
            <select
              id="swimlane"
              value={selectedSwimlane}
              onChange={(e) => setSelectedSwimlane(e.target.value)}
              className="w-full px-3 py-2 bg-[#1a3a3a] border border-[#4a6a6a] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#7dd87d]"
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
            <Button type="submit" className="bg-[#7dd87d] text-[#1a3a3a] hover:bg-[#6cc76c]">
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
