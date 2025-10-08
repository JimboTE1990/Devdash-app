'use client'

import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { Board as BoardType, Task } from '@/lib/types'
import { Column } from './Column'
import { Swimlane } from './Swimlane'
import { TaskDetailsDialog } from './TaskDetailsDialog'
import { CreateTaskDialog } from './CreateTaskDialog'
import { TaskCard } from './TaskCard'
import { Button } from '@/components/ui/button'

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
  const headerScrollRef = React.useRef<HTMLDivElement>(null)
  const contentScrollRef = React.useRef<HTMLDivElement>(null)

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
    swimlaneId: string
  ) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverTarget(null)

    if (!draggedTask) return

    // Only update if the task is actually moving to a different location
    if (draggedTask.columnId !== columnId || draggedTask.swimlaneId !== swimlaneId) {
      const updatedTasks = board.tasks.map((task) =>
        task.id === draggedTask.id
          ? { ...task, columnId, swimlaneId, updatedAt: new Date() }
          : task
      )

      onUpdateBoard({
        ...board,
        tasks: updatedTasks,
        updatedAt: new Date(),
      })
    }

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
    const newTask: Task = {
      ...newTaskData,
      id: `task-${now.getTime()}-${Math.random().toString(36).substr(2, 9)}`,
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

  return (
    <div className="h-full flex flex-col">
      {/* Header with New Task button */}
      <div className="flex items-center gap-4 px-4 py-3 bg-[#1a3a3a] border-b border-[#4a6a6a]">
        <Button
          onClick={() => handleOpenCreateDialog()}
          className="bg-[#7dd87d] text-[#1a3a3a] hover:bg-[#6cc86c] font-semibold"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Task
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
                <div className="bg-[#2d4a4a] px-4 py-3 rounded-t-lg border-b-2 border-[#7dd87d] mb-4">
                  <h3 className="font-semibold text-white text-lg">{column.title}</h3>
                </div>

                {/* Swimlane Sections within Column */}
                <div className="flex-1 space-y-4 overflow-y-auto">
                  {board.swimlanes
                    .sort((a, b) => a.order - b.order)
                    .map((swimlane) => {
                      const swimlaneTasks = board.tasks.filter(
                        (task) => task.columnId === column.id && task.swimlaneId === swimlane.id
                      )

                      return (
                        <div key={swimlane.id} className="bg-[#1a3a3a] rounded-lg border border-[#3a5a5a] p-3">
                          {/* Swimlane Label */}
                          <div className="text-sm font-medium text-gray-400 mb-2 pb-2 border-b border-[#3a5a5a]">
                            {swimlane.title}
                          </div>

                          {/* Tasks or Empty State */}
                          {swimlaneTasks.length === 0 ? (
                            <div
                              className={`flex flex-col items-center justify-center h-24 text-gray-500 text-sm border-2 border-dashed rounded transition-all duration-200 ${
                                dragOverTarget?.columnId === column.id && dragOverTarget?.swimlaneId === swimlane.id
                                  ? 'border-[#7dd87d] bg-[#7dd87d]/10 scale-[1.02]'
                                  : 'border-[#4a6a6a]'
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
                                  ? 'bg-[#7dd87d]/10 ring-2 ring-[#7dd87d]'
                                  : ''
                              }`}
                              onDragOver={(e) => handleDragOver(e, column.id, swimlane.id)}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, column.id, swimlane.id)}
                            >
                              {swimlaneTasks.map((task) => (
                                <TaskCard
                                  key={task.id}
                                  task={task}
                                  onClick={() => setSelectedTask(task)}
                                  onDragStart={(e) => handleDragStart(e, task)}
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
