'use client'

import React, { useState } from 'react'
import { Plus, Edit2, Trash2, Check, X, Calendar as CalendarIcon } from 'lucide-react'
import { Task } from '@/lib/types'
import { TaskCard } from '@/components/board/TaskCard'
import { TaskDetailsDialog } from '@/components/board/TaskDetailsDialog'
import { CreatePlannerTaskDialog } from './CreatePlannerTaskDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'

interface Week {
  weekNumber: number
  startDate: Date
  endDate: Date
}

interface Swimlane {
  id: string
  title: string
  order: number
}

interface PlannerBoardProps {
  tasks: Task[]
  weeks: Week[]
  swimlanes: Swimlane[]
  onUpdateTasks: (tasks: Task[]) => void
  onUpdateSwimlanes: (swimlanes: Swimlane[]) => void
  userId: string
}

const COLUMNS = [
  { id: 'backlog', title: 'Backlog', order: 0 },
  { id: 'in-progress', title: 'In Progress', order: 1 },
  { id: 'done', title: 'Done', order: 2 },
]

export function PlannerBoard({ tasks, weeks, swimlanes, onUpdateTasks, onUpdateSwimlanes, userId }: PlannerBoardProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [dragOverTarget, setDragOverTarget] = useState<{
    columnId: string
    swimlaneId: string
    weekNumber: number
  } | null>(null)
  const [selectedWeek, setSelectedWeek] = useState<number>(weeks[0]?.weekNumber || 1)
  const [editingSwimlaneId, setEditingSwimlaneId] = useState<string | null>(null)
  const [editingSwimlaneTitle, setEditingSwimlaneTitle] = useState<string>('')
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false)
  const [taskToClone, setTaskToClone] = useState<Task | null>(null)
  const [selectedWeeksForClone, setSelectedWeeksForClone] = useState<number[]>([])

  // Filter tasks for the current selected week
  const getTasksForWeek = (weekNumber: number) => {
    const week = weeks.find(w => w.weekNumber === weekNumber)
    if (!week) return []

    return tasks.filter(task => {
      // Recurring tasks appear in all weeks
      if (task.isRecurring) return true

      // Tasks with no due date or tasks due in this week
      if (!task.dueDate) return task.swimlaneId?.startsWith('priority-')

      const dueDate = new Date(task.dueDate)
      return dueDate >= week.startDate && dueDate <= week.endDate && task.swimlaneId?.startsWith('priority-')
    })
  }

  // Migrate tasks: when switching weeks, tasks that are incomplete move to the new week
  const handleWeekChange = (newWeekNumber: number) => {
    const oldWeek = weeks.find(w => w.weekNumber === selectedWeek)
    const newWeek = weeks.find(w => w.weekNumber === newWeekNumber)

    if (!oldWeek || !newWeek) return

    const updatedTasks = tasks.map(task => {
      // Only migrate incomplete tasks (not in "done" column)
      if (task.columnId !== 'done' && task.dueDate) {
        const dueDate = new Date(task.dueDate)
        // If task was due in old week and not done, move to new week
        if (dueDate >= oldWeek.startDate && dueDate <= oldWeek.endDate) {
          return {
            ...task,
            dueDate: newWeek.endDate, // Set to end of new week
            updatedAt: new Date(),
          }
        }
      }
      return task
    })

    onUpdateTasks(updatedTasks)
    setSelectedWeek(newWeekNumber)
  }

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, columnId: string, swimlaneId: string, weekNumber: number) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    setDragOverTarget({ columnId, swimlaneId, weekNumber })
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    const relatedTarget = e.relatedTarget as HTMLElement
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      setDragOverTarget(null)
    }
  }

  const handleDrop = (e: React.DragEvent, columnId: string, swimlaneId: string, weekNumber: number) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverTarget(null)

    if (!draggedTask) return

    const week = weeks.find(w => w.weekNumber === weekNumber)
    if (!week) return

    // Update task with new column, swimlane, and due date for the week
    const updatedTasks = tasks.map(task =>
      task.id === draggedTask.id
        ? {
            ...task,
            columnId,
            swimlaneId,
            dueDate: week.endDate, // Set due date to end of week
            updatedAt: new Date(),
          }
        : task
    )

    onUpdateTasks(updatedTasks)
    setDraggedTask(null)
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
    setDragOverTarget(null)
  }

  const handleUpdateTask = (updatedTask: Task) => {
    const updatedTasks = tasks.map(task =>
      task.id === updatedTask.id ? updatedTask : task
    )
    onUpdateTasks(updatedTasks)
    setSelectedTask(updatedTask)
  }

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId)
    onUpdateTasks(updatedTasks)
    if (selectedTask?.id === taskId) {
      setSelectedTask(null)
    }
  }

  const handleCreateTask = (newTaskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date()
    const week = weeks.find(w => w.weekNumber === selectedWeek)

    const newTask: Task = {
      ...newTaskData,
      id: `task-${now.getTime()}-${Math.random().toString(36).substr(2, 9)}`,
      dueDate: week?.endDate || newTaskData.dueDate, // Default to end of selected week
      createdAt: now,
      updatedAt: now,
      comments: newTaskData.comments.map(comment => ({
        ...comment,
        taskId: `task-${now.getTime()}-${Math.random().toString(36).substr(2, 9)}`,
      })),
    }

    onUpdateTasks([...tasks, newTask])
  }

  const handleInitiateClone = (task: Task) => {
    setTaskToClone(task)
    setSelectedWeeksForClone([])
    setCloneDialogOpen(true)
  }

  const toggleWeekSelection = (weekNumber: number) => {
    setSelectedWeeksForClone(prev =>
      prev.includes(weekNumber)
        ? prev.filter(w => w !== weekNumber)
        : [...prev, weekNumber]
    )
  }

  const handleConfirmClone = () => {
    if (!taskToClone) return

    const clonedTasks: Task[] = []
    const now = new Date()

    // Simple clone: one copy per selected week
    selectedWeeksForClone.forEach((weekNumber, index) => {
      const targetWeek = weeks.find(w => w.weekNumber === weekNumber)
      const timestamp = now.getTime() + index // Ensure unique IDs

      const clonedTask: Task = {
        ...taskToClone,
        id: `task-${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
        title: `${taskToClone.title} (Copy)`,
        dueDate: targetWeek?.endDate || taskToClone.dueDate,
        createdAt: now,
        updatedAt: now,
        isRecurring: false, // Cloned tasks are not recurring
        comments: taskToClone.comments.map((comment, cIndex) => ({
          ...comment,
          id: `comment-${timestamp}-${cIndex}-${Math.random().toString(36).substr(2, 9)}`,
          taskId: `task-${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
        })),
        subtasks: taskToClone.subtasks.map((subtask, sIndex) => ({
          ...subtask,
          id: `subtask-${timestamp}-${sIndex}-${Math.random().toString(36).substr(2, 9)}`,
        })),
      }
      clonedTasks.push(clonedTask)
    })

    if (clonedTasks.length > 0) {
      onUpdateTasks([...tasks, ...clonedTasks])
    }

    setCloneDialogOpen(false)
    setTaskToClone(null)
    setSelectedWeeksForClone([])
  }

  // Swimlane management functions
  const handleAddSwimlane = () => {
    const newOrder = swimlanes.length
    const newSwimlane: Swimlane = {
      id: `priority-${Date.now()}`,
      title: `Priority ${newOrder + 1}`,
      order: newOrder,
    }
    onUpdateSwimlanes([...swimlanes, newSwimlane])
  }

  const handleEditSwimlane = (swimlaneId: string, currentTitle: string) => {
    setEditingSwimlaneId(swimlaneId)
    setEditingSwimlaneTitle(currentTitle)
  }

  const handleSaveSwimlane = () => {
    if (!editingSwimlaneId || !editingSwimlaneTitle.trim()) return

    const updatedSwimlanes = swimlanes.map(sl =>
      sl.id === editingSwimlaneId ? { ...sl, title: editingSwimlaneTitle.trim() } : sl
    )
    onUpdateSwimlanes(updatedSwimlanes)
    setEditingSwimlaneId(null)
    setEditingSwimlaneTitle('')
  }

  const handleCancelEdit = () => {
    setEditingSwimlaneId(null)
    setEditingSwimlaneTitle('')
  }

  const handleRemoveSwimlane = (swimlaneId: string) => {
    // Check if there are tasks in this swimlane
    const tasksInSwimlane = tasks.filter(task => task.swimlaneId === swimlaneId)

    if (tasksInSwimlane.length > 0) {
      if (!confirm(`This priority has ${tasksInSwimlane.length} task(s). Are you sure you want to remove it? Tasks will be deleted.`)) {
        return
      }
      // Remove tasks in this swimlane
      const updatedTasks = tasks.filter(task => task.swimlaneId !== swimlaneId)
      onUpdateTasks(updatedTasks)
    }

    // Remove the swimlane and reorder
    const updatedSwimlanes = swimlanes
      .filter(sl => sl.id !== swimlaneId)
      .map((sl, index) => ({ ...sl, order: index }))

    onUpdateSwimlanes(updatedSwimlanes)
  }

  const currentWeekTasks = getTasksForWeek(selectedWeek)

  const formatWeekRange = (week: Week) => {
    const start = week.startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    const end = week.endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    return `${start} - ${end}`
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with Week Selector and New Task button */}
      <div className="flex items-center gap-4 px-4 py-3 bg-card border-b border-border">
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>

        <Button
          onClick={handleAddSwimlane}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Priority
        </Button>

        {/* Week Selector */}
        <div className="flex gap-2">
          {weeks.map((week) => (
            <Button
              key={week.weekNumber}
              onClick={() => handleWeekChange(week.weekNumber)}
              variant={selectedWeek === week.weekNumber ? 'default' : 'outline'}
              size="sm"
              className={selectedWeek === week.weekNumber ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}
            >
              <div className="flex flex-col items-start">
                <span className="text-xs font-semibold">Week {week.weekNumber}</span>
                <span className="text-[10px] opacity-80">{formatWeekRange(week)}</span>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Columns Layout */}
      <div className="flex-1 overflow-auto">
        <div className="flex gap-4 p-4 h-full">
          {COLUMNS.map((column) => (
            <div key={column.id} className="flex-1 min-w-[360px] flex flex-col">
              {/* Column Header */}
              <div className="bg-muted px-4 py-3 rounded-t-lg border-b-2 border-primary mb-4">
                <h3 className="font-semibold text-foreground text-lg">{column.title}</h3>
              </div>

              {/* Swimlane Sections within Column */}
              <div className="flex-1 space-y-4 overflow-y-auto">
                {swimlanes.sort((a, b) => a.order - b.order).map((swimlane) => {
                  const swimlaneTasks = currentWeekTasks.filter(
                    (task) => task.columnId === column.id && task.swimlaneId === swimlane.id
                  )

                  return (
                    <div
                      key={swimlane.id}
                      className="bg-card rounded-lg border border-muted p-3"
                    >
                      {/* Swimlane Label with Edit/Delete */}
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-border">
                        {editingSwimlaneId === swimlane.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              value={editingSwimlaneTitle}
                              onChange={(e) => setEditingSwimlaneTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveSwimlane()
                                if (e.key === 'Escape') handleCancelEdit()
                              }}
                              className="h-7 text-sm"
                              autoFocus
                            />
                            <Button
                              onClick={handleSaveSwimlane}
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0"
                            >
                              <Check className="h-3 w-3 text-primary" />
                            </Button>
                            <Button
                              onClick={handleCancelEdit}
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0"
                            >
                              <X className="h-3 w-3 text-red-400" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className="text-sm font-medium text-muted-foreground">{swimlane.title}</span>
                            <div className="flex items-center gap-1">
                              <Button
                                onClick={() => handleEditSwimlane(swimlane.id, swimlane.title)}
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                              >
                                <Edit2 className="h-3 w-3 text-muted-foreground hover:text-primary" />
                              </Button>
                              <Button
                                onClick={() => handleRemoveSwimlane(swimlane.id)}
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                              >
                                <Trash2 className="h-3 w-3 text-muted-foreground hover:text-red-400" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Tasks or Empty State */}
                      {swimlaneTasks.length === 0 ? (
                        <div
                          className={`flex flex-col items-center justify-center h-24 text-muted-foreground text-sm border-2 border-dashed rounded transition-all duration-200 ${
                            dragOverTarget?.columnId === column.id &&
                            dragOverTarget?.swimlaneId === swimlane.id &&
                            dragOverTarget?.weekNumber === selectedWeek
                              ? 'border-primary bg-primary/10 scale-[1.02]'
                              : 'border-border'
                          }`}
                          onDragOver={(e) => handleDragOver(e, column.id, swimlane.id, selectedWeek)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, column.id, swimlane.id, selectedWeek)}
                        >
                          <span>Drop tasks here</span>
                        </div>
                      ) : (
                        <div
                          className={`space-y-2 p-2 rounded transition-all duration-200 ${
                            dragOverTarget?.columnId === column.id &&
                            dragOverTarget?.swimlaneId === swimlane.id &&
                            dragOverTarget?.weekNumber === selectedWeek
                              ? 'bg-primary/10 ring-2 ring-primary'
                              : ''
                          }`}
                          onDragOver={(e) => handleDragOver(e, column.id, swimlane.id, selectedWeek)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, column.id, swimlane.id, selectedWeek)}
                        >
                          {swimlaneTasks.map((task) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              onClick={() => setSelectedTask(task)}
                              onDragStart={(e) => handleDragStart(e, task)}
                              onDelete={handleDeleteTask}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Details Dialog */}
      <TaskDetailsDialog
        task={selectedTask}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdateTask={handleUpdateTask}
        onCloneTask={handleInitiateClone}
        onDeleteTask={handleDeleteTask}
      />

      {/* Clone Week Selection Dialog */}
      {cloneDialogOpen && taskToClone && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-card rounded-lg border border-border p-6 max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-foreground mb-2">Clone Task: {taskToClone.title}</h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Select which weeks to clone this task to. Each week will get one independent copy.
            </p>

            {/* Week Selection */}
            <div className="space-y-2 mb-6">
              {weeks.map((week) => (
                <button
                  key={week.weekNumber}
                  onClick={() => toggleWeekSelection(week.weekNumber)}
                  className={`w-full text-left px-4 py-3 border rounded-lg transition-colors ${
                    selectedWeeksForClone.includes(week.weekNumber)
                      ? 'bg-primary/20 border-primary ring-2 ring-primary'
                      : 'bg-muted border-border hover:border-primary'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedWeeksForClone.includes(week.weekNumber)
                          ? 'border-primary bg-primary'
                          : 'border-border'
                      }`}>
                        {selectedWeeksForClone.includes(week.weekNumber) && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                      <span className="text-foreground font-medium">Week {week.weekNumber}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{formatWeekRange(week)}</span>
                  </div>
                </button>
              ))}
              {selectedWeeksForClone.length > 0 && (
                <p className="text-sm text-primary mt-3 font-medium">
                  ✓ {selectedWeeksForClone.length} week(s) selected
                </p>
              )}
            </div>

            {/* Info Box */}
            <div className="mb-6 p-3 bg-muted border border-border rounded-lg">
              <p className="text-xs text-foreground/80">
                💡 <strong>Tip:</strong> For tasks that repeat every week, use the "Make this a recurring task" checkbox when creating or editing a task instead.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setCloneDialogOpen(false)
                  setTaskToClone(null)
                  setSelectedWeeksForClone([])
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmClone}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                disabled={selectedWeeksForClone.length === 0}
              >
                Clone to {selectedWeeksForClone.length || 0} Week(s)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Dialog */}
      <CreatePlannerTaskDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreateTask={handleCreateTask}
        columns={COLUMNS}
        swimlanes={swimlanes}
        selectedWeek={weeks.find(w => w.weekNumber === selectedWeek)}
      />
    </div>
  )
}
