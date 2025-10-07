'use client'

import React, { useState } from 'react'
import { Board as BoardType, Task } from '@/lib/types'
import { Column } from './Column'
import { Swimlane } from './Swimlane'
import { TaskDetailsDialog } from './TaskDetailsDialog'

interface BoardProps {
  board: BoardType
  onUpdateBoard: (board: BoardType) => void
}

export function Board({ board, onUpdateBoard }: BoardProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [isDragging, setIsDragging] = useState(false)

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

  return (
    <div className="h-full flex flex-col">
      {/* Column Headers */}
      <div className="flex gap-4 px-4 py-3 bg-[#1a3a3a] border-b border-[#4a6a6a]">
        <div className="w-48 shrink-0"></div>
        <div className="flex-1 grid grid-cols-3 gap-4">
          {board.columns
            .sort((a, b) => a.order - b.order)
            .map((column) => (
              <Column key={column.id} column={column} />
            ))}
        </div>
      </div>

      {/* Swimlanes */}
      <div className="flex-1 overflow-auto">
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
    </div>
  )
}
