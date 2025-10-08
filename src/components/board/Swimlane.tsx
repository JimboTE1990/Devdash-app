'use client'

import React from 'react'
import { ChevronDown, ChevronRight, Plus } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Swimlane as SwimlaneType, Column, Task } from '@/lib/types'
import { TaskCard } from './TaskCard'
import { Button } from '@/components/ui/button'

interface SwimlaneProps {
  swimlane: SwimlaneType
  columns: Column[]
  tasks: Task[]
  onToggleCollapse: (swimlaneId: string) => void
  onTaskClick: (task: Task) => void
  onDragStart: (e: React.DragEvent, task: Task) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, columnId: string, swimlaneId: string) => void
  onAddTask?: (columnId: string, swimlaneId: string) => void
}

export function Swimlane({
  swimlane,
  columns,
  tasks,
  onToggleCollapse,
  onTaskClick,
  onDragStart,
  onDragOver,
  onDrop,
  onAddTask,
}: SwimlaneProps) {
  return (
    <Collapsible
      open={!swimlane.collapsed}
      onOpenChange={() => onToggleCollapse(swimlane.id)}
      className="border-b border-[#4a6a6a]"
    >
      {/* Swimlane Header - aligned with columns */}
      <div className="flex gap-4 px-4 py-3 bg-[#2d4a4a]">
        <div className="w-48 shrink-0">
          <CollapsibleTrigger className="flex items-center gap-2 text-white font-medium hover:text-[#7dd87d] transition-colors">
            {swimlane.collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
            <span>{swimlane.title}</span>
          </CollapsibleTrigger>
        </div>
        <div className="flex-1"></div>
      </div>

      <CollapsibleContent>
        <div className="flex gap-4 px-4 py-4 min-w-max">
          {/* Swimlane label space */}
          <div className="w-48 shrink-0"></div>

          {/* Column drop zones - Flex layout for horizontal scroll */}
          <div className="flex gap-4 shrink-0">
            {columns.map((column) => {
              const columnTasks = tasks.filter(
                (task) =>
                  task.columnId === column.id && task.swimlaneId === swimlane.id
              )

              return (
                <div
                  key={column.id}
                  className="w-96 min-w-[384px] shrink-0 min-h-[200px] bg-[#1a3a3a] rounded-lg border-2 border-[#3a5a5a] p-3 transition-all duration-150"
                  onDragOver={onDragOver}
                  onDrop={(e) => {
                    e.currentTarget.classList.remove('!border-[#7dd87d]', '!bg-[#7dd87d]/20', 'scale-[1.02]', 'shadow-lg', 'shadow-[#7dd87d]/50')
                    onDrop(e, column.id, swimlane.id)
                  }}
                  onDragEnter={(e) => {
                    e.currentTarget.classList.add('!border-[#7dd87d]', '!bg-[#7dd87d]/20', 'scale-[1.02]', 'shadow-lg', 'shadow-[#7dd87d]/50')
                  }}
                  onDragLeave={(e) => {
                    // Only remove if we're actually leaving the drop zone (not just entering a child)
                    const rect = e.currentTarget.getBoundingClientRect()
                    const x = e.clientX
                    const y = e.clientY
                    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
                      e.currentTarget.classList.remove('!border-[#7dd87d]', '!bg-[#7dd87d]/20', 'scale-[1.02]', 'shadow-lg', 'shadow-[#7dd87d]/50')
                    }
                  }}
                >
                  {columnTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-500 text-sm border-2 border-dashed border-[#4a6a6a] rounded gap-2">
                      <span>Drop tasks here</span>
                      {onAddTask && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onAddTask(column.id, swimlane.id)}
                          className="text-[#7dd87d] border-[#7dd87d] hover:bg-[#7dd87d]/10"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Task
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {columnTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onClick={() => onTaskClick(task)}
                          onDragStart={(e) => onDragStart(e, task)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
