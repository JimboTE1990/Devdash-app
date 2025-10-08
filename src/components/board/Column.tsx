'use client'

import React from 'react'
import { Plus } from 'lucide-react'
import { Column as ColumnType } from '@/lib/types'
import { Button } from '@/components/ui/button'

interface ColumnProps {
  column: ColumnType
  onAddTask?: (columnId: string) => void
}

export function Column({ column, onAddTask }: ColumnProps) {
  return (
    <div className="flex-1 min-w-[320px]">
      <div className="bg-[#2d4a4a] px-4 py-3 rounded-t-lg border-b-2 border-[#7dd87d] flex items-center justify-between">
        <h3 className="font-semibold text-white">{column.title}</h3>
        {onAddTask && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onAddTask(column.id)}
            className="h-7 px-2 text-[#7dd87d] hover:text-white hover:bg-[#3a5a5a]"
          >
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        )}
      </div>
    </div>
  )
}
