'use client'

import React from 'react'
import { Column as ColumnType } from '@/lib/types'

interface ColumnProps {
  column: ColumnType
}

export function Column({ column }: ColumnProps) {
  return (
    <div className="w-[360px] min-w-[360px] shrink-0">
      <div className="bg-muted px-4 py-3 rounded-t-lg border-b-2 border-primary">
        <h3 className="font-semibold text-foreground">{column.title}</h3>
      </div>
    </div>
  )
}
