'use client'

import React, { useState } from 'react'
import { Dialog, ResizableDialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Task } from '@/lib/types'

interface Column {
  id: string
  title: string
  order: number
}

interface CreateTaskDialogV2Props {
  open: boolean
  onClose: () => void
  onCreateTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  columns: Column[]
}

export function CreateTaskDialogV2({
  open,
  onClose,
  onCreateTask,
  columns,
}: CreateTaskDialogV2Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [initialComment, setInitialComment] = useState('')
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState(columns[0]?.id || '')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')

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
      swimlaneId: 'default',
      dueDate: dueDate,
      priority,
      assignee: undefined,
      comments: initialComment.trim()
        ? [
            {
              id: `comment-${Date.now()}`,
              taskId: '',
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
      isRecurring: false,
      order: 0,
      isArchived: false,
    }

    onCreateTask(newTask)
    handleClose()
  }

  const handleClose = () => {
    setTitle('')
    setDescription('')
    setInitialComment('')
    setSelectedColumn(columns[0]?.id || '')
    setPriority('medium')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <ResizableDialogContent className="overflow-y-auto">
        <DialogClose onClick={handleClose} />
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to your board
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 mt-4">
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

          {/* Target Date - Optional - ADDED FOR VISIBILITY */}
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
                className="cursor-pointer bg-background border-input text-foreground placeholder:text-muted-foreground"
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
              <div
                className="border border-[#4a6a6a] rounded-lg p-3 bg-[#0f2a2a]"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => {
                    setDueDate(date)
                    setShowCalendar(false)
                  }}
                  className="rounded-md bg-[#0f2a2a] text-white border-none"
                  classNames={{
                    months: "text-white",
                    month: "text-white",
                    caption: "text-white",
                    caption_label: "text-white font-semibold",
                    nav: "text-white",
                    nav_button: "text-white hover:bg-[#2a4a4a] border-[#4a6a6a]",
                    nav_button_previous: "text-white hover:bg-[#2a4a4a]",
                    nav_button_next: "text-white hover:bg-[#2a4a4a]",
                    table: "text-white",
                    head_row: "text-gray-400",
                    head_cell: "text-gray-400 font-medium",
                    row: "text-white",
                    cell: "text-white hover:bg-[#2a4a4a] rounded-md",
                    day: "text-white hover:bg-[#2a4a4a] hover:text-white rounded-md",
                    day_selected: "bg-[#7dd87d] text-[#0f2a2a] hover:bg-[#6cc76c] hover:text-[#0f2a2a] font-bold",
                    day_today: "bg-[#2a4a4a] text-white font-semibold",
                    day_outside: "text-gray-600",
                    day_disabled: "text-gray-700",
                    day_hidden: "invisible",
                  }}
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
              rows={2}
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
              className="w-full px-3 py-2 bg-[#1a3a3a] border border-[#4a6a6a] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#7dd87d]"
            >
              {columns.map((column) => (
                <option key={column.id} value={column.id}>
                  {column.title}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority" className="text-foreground">
              Priority
            </Label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="w-full px-3 py-2 bg-[#1a3a3a] border border-[#4a6a6a] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#7dd87d]"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
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
      </ResizableDialogContent>
    </Dialog>
  )
}
