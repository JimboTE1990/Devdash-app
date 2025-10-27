'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Eye, EyeOff, ArrowUpDown } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { Board as BoardType, Task } from '@/lib/types'
import { Column } from './Column'
import { Swimlane } from './Swimlane'
import { TaskDetailsDialog } from './TaskDetailsDialog'
import { CreateTaskDialog } from './CreateTaskDialog'
import { TaskCard } from './TaskCard'
import { Button } from '@/components/ui/button'
import { sortTasks, reorderTasks, SortOption } from '@/lib/sortUtils'
import { autoArchiveTasks, filterTasksByArchiveStatus, getArchivedTasksCount } from '@/lib/archiveUtils'

interface BoardProps {
  board: BoardType
  onUpdateBoard: (board: BoardType) => void
}

export function Board({ board, onUpdateBoard }: BoardProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [preselectedColumn, setPreselectedColumn] = useState<string>()
  const [preselectedSwimlane, setPreselectedSwimlane] = useState<string>()
  const [dragOverTarget, setDragOverTarget] = useState<{ columnId: string; swimlaneId: string } | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('manual')
  const [showArchived, setShowArchived] = useState(false)
  const [dropPosition, setDropPosition] = useState<{ taskId: string; position: 'before' | 'after' } | null>(null)
  const headerScrollRef = React.useRef<HTMLDivElement>(null)
  const contentScrollRef = React.useRef<HTMLDivElement>(null)

  // Auto-archive completed tasks on mount and when board changes
  useEffect(() => {
    const doneColumn = board.columns.find(col => col.title.toLowerCase() === 'done')
    if (!doneColumn) return

    const archivedTasks = autoArchiveTasks(board.tasks, doneColumn.id)
    const hasChanges = archivedTasks.some((task, index) =>
      task.isArchived !== board.tasks[index].isArchived
    )

    if (hasChanges) {
      onUpdateBoard({
        ...board,
        tasks: archivedTasks,
        updatedAt: new Date(),
      })
    }
  }, [board.id]) // Only run when board changes

  // Get filtered and sorted tasks
  const filteredTasks = filterTasksByArchiveStatus(board.tasks, showArchived)
  const archivedCount = getArchivedTasksCount(board.tasks)

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    setIsDragging(true)
    e.dataTransfer.effectAllowed = 'move'
    // Set custom drag image with transparency
    if (e.currentTarget instanceof HTMLElement) {
      const dragImage = e.currentTarget.cloneNode(true) as HTMLElement
      dragImage.style.opacity = '0.5'
      document.body.appendChild(dragImage)
      e.dataTransfer.setDragImage(dragImage, 0, 0)
      setTimeout(() => document.body.removeChild(dragImage), 0)
    }
  }

  const handleDragOver = (e: React.DragEvent, columnId: string, swimlaneId: string) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    setDragOverTarget({ columnId, swimlaneId })
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    // Only clear if we're leaving the container, not just entering a child
    const relatedTarget = e.relatedTarget as HTMLElement
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      setDragOverTarget(null)
    }
  }

  const handleDrop = (
    e: React.DragEvent,
    columnId: string,
    swimlaneId: string,
    targetTaskId?: string,
    position?: 'before' | 'after'
  ) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverTarget(null)
    setDropPosition(null)

    if (!draggedTask) return

    let updatedTasks = [...board.tasks]

    // Check if moving to different column/swimlane OR reordering within same location
    const isMovingLocation = draggedTask.columnId !== columnId || draggedTask.swimlaneId !== swimlaneId
    const isReordering = targetTaskId && position && !isMovingLocation

    if (isMovingLocation) {
      // Moving to different column/swimlane
      updatedTasks = board.tasks.map((task) =>
        task.id === draggedTask.id
          ? { ...task, columnId, swimlaneId, updatedAt: new Date() }
          : task
      )
    } else if (isReordering) {
      // Reordering within same column/swimlane
      const tasksInLocation = filteredTasks
        .filter(task => task.columnId === columnId && task.swimlaneId === swimlaneId)
        .sort((a, b) => a.order - b.order)

      const targetIndex = tasksInLocation.findIndex(t => t.id === targetTaskId)
      const newIndex = position === 'before' ? targetIndex : targetIndex + 1

      updatedTasks = reorderTasks(board.tasks, draggedTask.id, newIndex)
    }

    onUpdateBoard({
      ...board,
      tasks: updatedTasks,
      updatedAt: new Date(),
    })

    setDraggedTask(null)
    setIsDragging(false)
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
    setIsDragging(false)
    setDragOverTarget(null)
  }

  const handleToggleCollapse = (swimlaneId: string) => {
    const updatedSwimlanes = board.swimlanes.map((swimlane) =>
      swimlane.id === swimlaneId
        ? { ...swimlane, collapsed: !swimlane.collapsed }
        : swimlane
    )

    onUpdateBoard({
      ...board,
      swimlanes: updatedSwimlanes,
      updatedAt: new Date(),
    })
  }

  const handleUpdateTask = (updatedTask: Task) => {
    const updatedTasks = board.tasks.map((task) =>
      task.id === updatedTask.id ? updatedTask : task
    )

    onUpdateBoard({
      ...board,
      tasks: updatedTasks,
      updatedAt: new Date(),
    })

    setSelectedTask(updatedTask)
  }

  const handleOpenCreateDialog = (columnId?: string, swimlaneId?: string) => {
    setPreselectedColumn(columnId || board.columns[0]?.id)
    setPreselectedSwimlane(swimlaneId || board.swimlanes[0]?.id)
    setCreateDialogOpen(true)
  }

  const handleCreateTask = (newTaskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date()

    // Calculate the next order value for this column/swimlane
    const tasksInLocation = board.tasks.filter(
      task => task.columnId === newTaskData.columnId && task.swimlaneId === newTaskData.swimlaneId
    )
    const maxOrder = tasksInLocation.reduce((max, task) => Math.max(max, task.order), -1)

    const newTask: Task = {
      ...newTaskData,
      id: `task-${now.getTime()}-${Math.random().toString(36).substr(2, 9)}`,
      order: maxOrder + 1,
      createdAt: now,
      updatedAt: now,
    }

    // Update task ID in comments if any
    const updatedTask = {
      ...newTask,
      comments: newTask.comments.map((comment) => ({
        ...comment,
        taskId: newTask.id,
      })),
    }

    onUpdateBoard({
      ...board,
      tasks: [...board.tasks, updatedTask],
      updatedAt: now,
    })
  }

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = board.tasks.filter(task => task.id !== taskId)
    onUpdateBoard({
      ...board,
      tasks: updatedTasks,
      updatedAt: new Date(),
    })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with controls */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => handleOpenCreateDialog()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-1.5 bg-card border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="manual">Manual Order</option>
              <option value="date-asc">Date (Earliest First)</option>
              <option value="date-desc">Date (Latest First)</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        </div>

        {/* Archive Toggle */}
        <Button
          variant={showArchived ? "default" : "outline"}
          size="sm"
          onClick={() => setShowArchived(!showArchived)}
          className={`flex items-center gap-2 ${showArchived ? 'bg-primary text-primary-foreground' : ''} ${archivedCount > 0 ? 'animate-pulse' : ''}`}
        >
          {showArchived ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span className="font-semibold">{showArchived ? 'Hide' : 'Show'} Archived</span>
          {archivedCount > 0 && (
            <span className={`px-2 py-0.5 ${showArchived ? 'bg-primary-foreground/20' : 'bg-primary'} ${showArchived ? 'text-primary-foreground' : 'text-primary-foreground'} text-xs font-bold rounded-full`}>
              {archivedCount}
            </span>
          )}
        </Button>
      </div>

      {/* Columns Layout */}
      <div className="flex-1 overflow-auto">
        <div className="flex gap-4 p-4 h-full">
          {board.columns
            .sort((a, b) => a.order - b.order)
            .map((column) => (
              <div key={column.id} className="flex-1 min-w-[360px] flex flex-col">
                {/* Column Header */}
                <div className="bg-muted px-4 py-3 rounded-t-lg border-b-2 border-primary mb-4">
                  <h3 className="font-semibold text-foreground text-lg">{column.title}</h3>
                </div>

                {/* Swimlane Sections within Column */}
                <div className="flex-1 space-y-4 overflow-y-auto">
                  {board.swimlanes
                    .sort((a, b) => a.order - b.order)
                    .map((swimlane) => {
                      const swimlaneTasks = sortTasks(
                        filteredTasks.filter(
                          (task) => task.columnId === column.id && task.swimlaneId === swimlane.id
                        ),
                        sortBy
                      )

                      return (
                        <div key={swimlane.id} className="bg-card rounded-lg border border-muted p-3">
                          {/* Swimlane Label */}
                          <div className="text-sm font-medium text-muted-foreground mb-2 pb-2 border-b border-muted">
                            {swimlane.title}
                          </div>

                          {/* Tasks or Empty State */}
                          {swimlaneTasks.length === 0 ? (
                            <div
                              className={`flex flex-col items-center justify-center h-24 text-muted-foreground text-sm border-2 border-dashed rounded transition-all duration-200 ${
                                dragOverTarget?.columnId === column.id && dragOverTarget?.swimlaneId === swimlane.id
                                  ? 'border-primary bg-primary/10 scale-[1.02]'
                                  : 'border-border'
                              }`}
                              onDragOver={(e) => handleDragOver(e, column.id, swimlane.id)}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, column.id, swimlane.id)}
                            >
                              <span>Drop tasks here</span>
                            </div>
                          ) : (
                            <div
                              className={`space-y-2 p-2 rounded transition-all duration-200 ${
                                dragOverTarget?.columnId === column.id && dragOverTarget?.swimlaneId === swimlane.id
                                  ? 'bg-primary/10 ring-2 ring-primary'
                                  : ''
                              }`}
                              onDragOver={(e) => handleDragOver(e, column.id, swimlane.id)}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, column.id, swimlane.id)}
                            >
                              <AnimatePresence mode="popLayout">
                                {swimlaneTasks.map((task, index) => (
                                  <div
                                    key={task.id}
                                    onDragOver={(e) => {
                                      if (!draggedTask || draggedTask.id === task.id) return
                                      e.preventDefault()
                                      e.stopPropagation()
                                      const rect = e.currentTarget.getBoundingClientRect()
                                      const midpoint = rect.top + rect.height / 2
                                      const position = e.clientY < midpoint ? 'before' : 'after'
                                      setDropPosition({ taskId: task.id, position })
                                    }}
                                    onDrop={(e) => handleDrop(e, column.id, swimlane.id, task.id, dropPosition?.position)}
                                    className="relative"
                                  >
                                    {dropPosition?.taskId === task.id && dropPosition.position === 'before' && (
                                      <div className="absolute -top-1 left-0 right-0 h-1 bg-primary rounded-full z-10 shadow-lg shadow-primary/50" />
                                    )}
                                    <TaskCard
                                      task={task}
                                      onClick={() => setSelectedTask(task)}
                                      onDragStart={(e) => handleDragStart(e, task)}
                                      onDelete={handleDeleteTask}
                                      onUpdate={handleUpdateTask}
                                      columns={board.columns}
                                    />
                                    {dropPosition?.taskId === task.id && dropPosition.position === 'after' && (
                                      <div className="absolute -bottom-1 left-0 right-0 h-1 bg-primary rounded-full z-10 shadow-lg shadow-primary/50" />
                                    )}
                                  </div>
                                ))}
                              </AnimatePresence>
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
        columns={board.columns}
        swimlanes={board.swimlanes}
      />

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreateTask={handleCreateTask}
        columns={board.columns}
        swimlanes={board.swimlanes}
        preselectedColumn={preselectedColumn}
        preselectedSwimlane={preselectedSwimlane}
      />
    </div>
  )
}
