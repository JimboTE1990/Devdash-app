'use client'

import React, { useState, useEffect } from 'react'
import { Task } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { TaskCard } from '@/components/board/TaskCard'
import { TaskDetailsDialog } from '@/components/board/TaskDetailsDialog'
import { CreateTaskDialogV2 } from './CreateTaskDialogV2'
import { Plus, Eye, EyeOff } from 'lucide-react'
import { autoArchiveTasks, filterTasksByArchiveStatus, getArchivedTasksCount } from '@/lib/archiveUtils'
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { playCardMoveSound } from '@/lib/soundEffects'
import { supabase } from '@/lib/supabase/client'

interface Column {
  id: string
  title: string
  order: number
}

interface PlannerV2BoardProps {
  tasks: Task[]
  onUpdateTasks: (tasks: Task[]) => void
  userId: string
}

const DEFAULT_COLUMNS: Column[] = [
  { id: 'backlog-todo', title: 'Backlog/To Do', order: 0 },
  { id: 'in-progress', title: 'In Progress', order: 1 },
  { id: 'done', title: 'Done', order: 2 },
]

export function PlannerV2Board({ tasks, onUpdateTasks, userId }: PlannerV2BoardProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [columns] = useState<Column[]>(DEFAULT_COLUMNS)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null)
  const [showArchived, setShowArchived] = useState(false)

  // Auto-archive tasks in Done column > 7 days
  useEffect(() => {
    const doneColumn = columns.find(col => col.id === 'done')
    if (!doneColumn) return

    const archivedTasks = autoArchiveTasks(tasks, doneColumn.id)
    const hasChanges = archivedTasks.some((task, index) =>
      task.isArchived !== tasks[index]?.isArchived
    )

    if (hasChanges) {
      onUpdateTasks(archivedTasks)
    }
  }, [tasks, columns, onUpdateTasks])

  const handleCreateTask = async (newTaskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date()
    const taskId = `task-${now.getTime()}-${Math.random().toString(36).substr(2, 9)}`

    const newTask: Task = {
      ...newTaskData,
      id: taskId,
      createdAt: now,
      updatedAt: now,
      comments: newTaskData.comments.map(comment => ({
        ...comment,
        taskId,
      })),
    }

    // Save to Supabase
    const { error } = await supabase.from('planner_tasks').insert([
      {
        id: newTask.id,
        user_id: userId,
        board_type: 'planner-v2',
        title: newTask.title,
        description: newTask.description,
        column_id: newTask.columnId,
        due_date: newTask.dueDate?.toISOString(),
        priority: newTask.priority,
        tags: newTask.tags,
        assignee: newTask.assignee,
        subtasks: newTask.subtasks,
        comments: newTask.comments,
        is_archived: newTask.isArchived || false,
      },
    ])

    if (error) {
      console.error('Error creating task:', error)
      return
    }

    // Update local state
    onUpdateTasks([...tasks, newTask])
  }

  const handleUpdateTask = async (updatedTask: Task) => {
    // Save to Supabase
    const { error } = await supabase
      .from('planner_tasks')
      .update({
        title: updatedTask.title,
        description: updatedTask.description,
        column_id: updatedTask.columnId,
        due_date: updatedTask.dueDate?.toISOString(),
        priority: updatedTask.priority,
        tags: updatedTask.tags,
        assignee: updatedTask.assignee,
        subtasks: updatedTask.subtasks,
        comments: updatedTask.comments,
        is_archived: updatedTask.isArchived || false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', updatedTask.id)

    if (error) {
      console.error('Error updating task:', error)
      return
    }

    // Update local state
    const updatedTasks = tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
    onUpdateTasks(updatedTasks)
    setSelectedTask(updatedTask)
  }

  const handleDeleteTask = async (taskId: string) => {
    // Delete from Supabase
    const { error } = await supabase.from('planner_tasks').delete().eq('id', taskId)

    if (error) {
      console.error('Error deleting task:', error)
      return
    }

    // Update local state
    onUpdateTasks(tasks.filter(t => t.id !== taskId))
    setSelectedTask(null)
  }

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    setDragOverTarget(columnId)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    const relatedTarget = e.relatedTarget as HTMLElement
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      setDragOverTarget(null)
    }
  }

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverTarget(null)

    if (!draggedTask) return

    // Check if moving to "done" column with incomplete subtasks
    if (columnId === 'done' && draggedTask.subtasks.length > 0) {
      const incompleteSubtasks = draggedTask.subtasks.filter(st => !st.completed)
      if (incompleteSubtasks.length > 0) {
        alert(`Cannot move to Done: ${incompleteSubtasks.length} subtask(s) are still incomplete. Please complete all subtasks first.`)
        setDraggedTask(null)
        return
      }
    }

    const updatedTask = {
      ...draggedTask,
      columnId,
      updatedAt: new Date(),
    }

    const updatedTasks = tasks.map(t => t.id === draggedTask.id ? updatedTask : t)
    onUpdateTasks(updatedTasks)
    setDraggedTask(null)
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
    setDragOverTarget(null)
  }

  const handleCloneTask = async (task: Task) => {
    const now = new Date()
    const taskId = `task-${now.getTime()}-${Math.random().toString(36).substr(2, 9)}`

    const clonedTask: Task = {
      ...task,
      id: taskId,
      title: `${task.title} (Copy)`,
      createdAt: now,
      updatedAt: now,
      comments: task.comments.map((comment, index) => ({
        ...comment,
        id: `comment-${now.getTime()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
        taskId,
      })),
      subtasks: task.subtasks.map((subtask, index) => ({
        ...subtask,
        id: `subtask-${now.getTime()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
      })),
    }

    // Save to Supabase
    const { error } = await supabase.from('planner_tasks').insert([
      {
        id: clonedTask.id,
        user_id: userId,
        board_type: 'planner-v2',
        title: clonedTask.title,
        description: clonedTask.description,
        column_id: clonedTask.columnId,
        due_date: clonedTask.dueDate?.toISOString(),
        priority: clonedTask.priority,
        tags: clonedTask.tags,
        assignee: clonedTask.assignee,
        subtasks: clonedTask.subtasks,
        comments: clonedTask.comments,
        is_archived: clonedTask.isArchived || false,
      },
    ])

    if (error) {
      console.error('Error cloning task:', error)
      return
    }

    // Update local state
    onUpdateTasks([...tasks, clonedTask])
  }

  const getTasksForColumn = (columnId: string) => {
    // Filter tasks by archive status first
    const filteredTasks = filterTasksByArchiveStatus(tasks, showArchived)

    // Then filter by column and sort
    return filteredTasks.filter(t => t.columnId === columnId).sort((a, b) => {
      if (a.dueDate && b.dueDate) {
        return a.dueDate.getTime() - b.dueDate.getTime()
      }
      if (a.dueDate) return -1
      if (b.dueDate) return 1
      return b.updatedAt.getTime() - a.updatedAt.getTime()
    })
  }

  // Get archived tasks count
  const archivedCount = getArchivedTasksCount(tasks)

  return (
    <div className="h-full flex flex-col">
      {/* Header with New Task Button */}
      <div className="flex items-center gap-4 px-4 py-3 bg-card/80 backdrop-blur-sm border-b border-border">
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 font-semibold shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>

        {/* Archive Toggle Button */}
        <Button
          variant={showArchived ? "default" : "outline"}
          size="sm"
          onClick={() => setShowArchived(!showArchived)}
          className={`flex items-center gap-2 ${showArchived ? 'bg-primary text-primary-foreground' : ''} ${archivedCount > 0 ? 'animate-pulse' : ''}`}
        >
          {showArchived ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span className="font-semibold">{showArchived ? 'Hide' : 'Show'} Archived</span>
          {archivedCount > 0 && (
            <span className={`px-2 py-0.5 ${showArchived ? 'bg-primary-foreground/20' : 'bg-primary'} text-xs font-bold rounded-full`}>
              {archivedCount}
            </span>
          )}
        </Button>
      </div>

      {/* Columns Layout */}
      <div className="flex-1 overflow-auto">
        <div className="flex h-full overflow-x-auto gap-6 p-6">
          {columns.map(column => {
            const columnTasks = getTasksForColumn(column.id)

            return (
              <div
                key={column.id}
                className="flex-shrink-0 w-96 flex flex-col"
              >
                {/* Column Header */}
                <div className="bg-muted/30 backdrop-blur-sm px-4 py-3 rounded-t-lg border-b border-border/50 mb-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground text-lg">{column.title}</h3>
                    <span className="text-xs text-muted-foreground bg-card/80 px-2 py-1 rounded shadow-sm">
                      {columnTasks.length}
                    </span>
                  </div>
                </div>

                {/* Column Content */}
                <div
                  className={`flex-1 bg-card/30 backdrop-blur-sm rounded-lg border border-border/50 p-4 transition-all duration-200 ${
                    dragOverTarget === column.id
                      ? 'border-primary/70 bg-primary/5 ring-2 ring-primary/30'
                      : 'border-border/50'
                  }`}
                  onDragOver={(e) => handleDragOver(e, column.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  {columnTasks.length === 0 ? (
                    <div className="text-center text-muted-foreground py-10 border-2 border-dashed border-border/50 rounded-lg bg-muted/10">
                      <p className="text-sm font-medium">No tasks yet</p>
                      <p className="text-xs mt-1 text-muted-foreground/70">Drag tasks here or create a new one</p>
                    </div>
                  ) : (
                    <div className="space-y-4 overflow-y-auto">
                      {columnTasks.map(task => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task)}
                          onDragEnd={handleDragEnd}
                          className="cursor-pointer"
                        >
                          <TaskCard
                            task={task}
                            onClick={() => setSelectedTask(task)}
                            onDragStart={(e) => handleDragStart(e, task)}
                            onDelete={handleDeleteTask}
                            onUpdate={handleUpdateTask}
                            columns={columns.map(col => ({ ...col, tasks: [] }))}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Task Details Dialog */}
      <TaskDetailsDialog
        task={selectedTask}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdateTask={handleUpdateTask}
        onCloneTask={handleCloneTask}
        onDeleteTask={handleDeleteTask}
        columns={columns.map(col => ({ ...col, tasks: [] }))}
      />

      {/* Create Task Dialog */}
      <CreateTaskDialogV2
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreateTask={handleCreateTask}
        columns={columns}
      />
    </div>
  )
}
