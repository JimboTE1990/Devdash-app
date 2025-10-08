'use client'

import React, { useState } from 'react'
import { Board as BoardType, Task } from '@/lib/types'
import { Column } from './Column'
import { Swimlane } from './Swimlane'
import { TaskDetailsDialog } from './TaskDetailsDialog'
import { CreateTaskDialog } from './CreateTaskDialog'

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (
    e: React.DragEvent,
    columnId: string,
    swimlaneId: string
  ) => {
    e.preventDefault()
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
      {/* Column Headers - with horizontal scroll */}
      <div className="flex gap-4 px-4 py-3 bg-[#1a3a3a] border-b border-[#4a6a6a] overflow-x-auto">
        <div className="w-48 shrink-0"></div>
        <div className="flex gap-4 flex-1">
          {board.columns
            .sort((a, b) => a.order - b.order)
            .map((column) => (
              <Column
                key={column.id}
                column={column}
                onAddTask={(columnId) => handleOpenCreateDialog(columnId)}
              />
            ))}
        </div>
      </div>

      {/* Swimlanes - with horizontal scroll */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        {board.swimlanes
          .sort((a, b) => a.order - b.order)
          .map((swimlane) => (
            <Swimlane
              key={swimlane.id}
              swimlane={swimlane}
              columns={board.columns.sort((a, b) => a.order - b.order)}
              tasks={board.tasks}
              onToggleCollapse={handleToggleCollapse}
              onTaskClick={setSelectedTask}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onAddTask={handleOpenCreateDialog}
            />
          ))}
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
