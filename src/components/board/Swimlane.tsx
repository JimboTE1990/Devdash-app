'use client'

import React from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Swimlane as SwimlaneType, Column, Task } from '@/lib/types'
import { TaskCard } from './TaskCard'

interface SwimlaneProps {
  swimlane: SwimlaneType
  columns: Column[]
  tasks: Task[]
  onToggleCollapse: (swimlaneId: string) => void
  onTaskClick: (task: Task) => void
  onDragStart: (e: React.DragEvent, task: Task) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, columnId: string, swimlaneId: string) => void
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
}: SwimlaneProps) {
  return (
    <Collapsible
      open={!swimlane.collapsed}
      onOpenChange={() => onToggleCollapse(swimlane.id)}
      className="border-b border-[#4a6a6a]"
    >
      <div className="flex items-center bg-[#2d4a4a] px-4 py-3 sticky left-0 z-10">
        <CollapsibleTrigger className="flex items-center gap-2 text-white font-medium hover:text-[#7dd87d] transition-colors">
          {swimlane.collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
          <span>{swimlane.title}</span>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent>
        <div className="grid grid-cols-3 gap-4 p-4">
          {columns.map((column) => {
            const columnTasks = tasks.filter(
              (task) =>
                task.columnId === column.id && task.swimlaneId === swimlane.id
            )

            return (
              <div
                key={column.id}
                className="min-h-[200px] bg-[#1a3a3a] rounded-lg border-2 border-[#3a5a5a] p-3 transition-all duration-200 hover:border-[#4a7a7a]"
                onDragOver={onDragOver}
                onDrop={(e) => {
                  e.currentTarget.classList.remove('border-[#7dd87d]', 'bg-[#7dd87d]/10')
                  onDrop(e, column.id, swimlane.id)
                }}
                onDragEnter={(e) => {
                  e.currentTarget.classList.add('border-[#7dd87d]', 'bg-[#7dd87d]/10')
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove('border-[#7dd87d]', 'bg-[#7dd87d]/10')
                }}
              >
                {columnTasks.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-gray-500 text-sm border-2 border-dashed border-[#4a6a6a] rounded">
                    Drop tasks here
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
      </CollapsibleContent>
    </Collapsible>
  )
}
