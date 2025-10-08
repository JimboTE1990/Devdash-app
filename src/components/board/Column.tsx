'use client'

import React from 'react'
import { Column as ColumnType } from '@/lib/types'

interface ColumnProps {
  column: ColumnType
}

export function Column({ column }: ColumnProps) {
  return (
    <div className="flex-1 min-w-[320px]">
      <div className="bg-[#2d4a4a] px-4 py-3 rounded-t-lg border-b-2 border-[#7dd87d]">
        <h3 className="font-semibold text-white">{column.title}</h3>
      </div>
    </div>
  )
}
