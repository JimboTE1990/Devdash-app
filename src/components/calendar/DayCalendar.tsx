'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  addDays,
  subDays,
  format,
  isSameDay,
} from 'date-fns'

interface Event {
  id: string
  title: string
  description: string
  date: Date
  startTime?: string
  endTime?: string
  color: string
  createdAt: Date
}

interface DayCalendarProps {
  events: Event[]
  onDateClick: (date: Date) => void
  onCreateEvent: () => void
  onEventUpdate: (eventId: string, newDate: Date, newStartTime?: string) => void
  onEventDelete: (eventId: string) => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function DayCalendar({ events, onDateClick, onCreateEvent, onEventUpdate, onEventDelete }: DayCalendarProps) {
  const [currentDay, setCurrentDay] = useState(new Date())
  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null)

  const dayEvents = events.filter(event => isSameDay(new Date(event.date), currentDay))

  // Check if two events overlap
  const eventsOverlap = (event1: Event, event2: Event) => {
    if (!event1.startTime || !event2.startTime) return false

    const [start1Hours, start1Minutes] = event1.startTime.split(':').map(Number)
    const [start2Hours, start2Minutes] = event2.startTime.split(':').map(Number)
    const start1 = start1Hours * 60 + start1Minutes
    const start2 = start2Hours * 60 + start2Minutes

    const end1 = event1.endTime ? (() => {
      const [endHours, endMinutes] = event1.endTime.split(':').map(Number)
      return endHours * 60 + endMinutes
    })() : start1 + 60

    const end2 = event2.endTime ? (() => {
      const [endHours, endMinutes] = event2.endTime.split(':').map(Number)
      return endHours * 60 + endMinutes
    })() : start2 + 60

    return start1 < end2 && start2 < end1
  }

  // Calculate layout columns for overlapping events
  const getEventLayout = () => {
    const sortedEvents = [...dayEvents].sort((a, b) => {
      const aTime = a.startTime || '00:00'
      const bTime = b.startTime || '00:00'
      return aTime.localeCompare(bTime)
    })

    const columns: Event[][] = []

    sortedEvents.forEach(event => {
      let placed = false

      for (let i = 0; i < columns.length; i++) {
        const column = columns[i]
        const hasOverlap = column.some(existingEvent => eventsOverlap(event, existingEvent))

        if (!hasOverlap) {
          column.push(event)
          placed = true
          break
        }
      }

      if (!placed) {
        columns.push([event])
      }
    })

    const layout: Record<string, { column: number, totalColumns: number }> = {}

    columns.forEach((column, columnIndex) => {
      column.forEach(event => {
        layout[event.id] = {
          column: columnIndex,
          totalColumns: columns.length
        }
      })
    })

    return layout
  }

  const eventLayout = getEventLayout()

  const getEventPosition = (startTime?: string) => {
    if (!startTime) return { top: 0, height: 80 }
    const [hours, minutes] = startTime.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes
    const top = (totalMinutes / 60) * 80 // 80px per hour for better visibility
    return { top, height: 80 }
  }

  const getEventDuration = (startTime?: string, endTime?: string) => {
    if (!startTime || !endTime) return 80
    const [startHours, startMinutes] = startTime.split(':').map(Number)
    const [endHours, endMinutes] = endTime.split(':').map(Number)
    const startTotal = startHours * 60 + startMinutes
    const endTotal = endHours * 60 + endMinutes
    return ((endTotal - startTotal) / 60) * 80 // Convert to pixels
  }

  const isToday = isSameDay(currentDay, new Date())

  const handleDragStart = (event: Event) => {
    setDraggedEvent(event)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (hour: number) => {
    if (!draggedEvent) return

    const newStartTime = `${hour.toString().padStart(2, '0')}:00`
    onEventUpdate(draggedEvent.id, currentDay, newStartTime)
    setDraggedEvent(null)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-foreground">
            {format(currentDay, 'EEEE, MMMM d, yyyy')}
          </h2>
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentDay(subDays(currentDay, 1))}
              variant="ghost"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => setCurrentDay(new Date())}
              variant="ghost"
              size="sm"
            >
              Today
            </Button>
            <Button
              onClick={() => setCurrentDay(addDays(currentDay, 1))}
              variant="ghost"
              size="sm"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button onClick={onCreateEvent}>
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 bg-card rounded-xl border border-border shadow-lg overflow-auto">
        <div className="flex">
          {/* Time column */}
          <div className="w-20 border-r border-border bg-secondary/30 sticky left-0 z-10">
            {HOURS.map(hour => (
              <div
                key={hour}
                className="h-20 border-b border-border flex items-start justify-center pt-2"
              >
                <span className="text-sm text-muted-foreground font-medium">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </span>
              </div>
            ))}
          </div>

          {/* Day column */}
          <div className="flex-1 relative">
            {HOURS.map(hour => (
              <div
                key={hour}
                className="h-20 border-b border-border hover:bg-secondary/30 cursor-pointer transition-colors"
                onClick={() => onDateClick(currentDay)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(hour)}
              ></div>
            ))}

            {/* Events */}
            <div className="absolute inset-0 pointer-events-none">
              {dayEvents.map(event => {
                const position = getEventPosition(event.startTime)
                const height = getEventDuration(event.startTime, event.endTime)
                const layout = eventLayout[event.id]
                const widthPercent = layout ? (100 / layout.totalColumns) - 2 : 96
                const leftPercent = layout ? (layout.column * (100 / layout.totalColumns)) + 2 : 2

                return (
                  <div
                    key={event.id}
                    draggable
                    onDragStart={() => handleDragStart(event)}
                    className="absolute border-l-4 rounded-lg p-3 pointer-events-auto cursor-move hover:opacity-90 transition-all overflow-hidden shadow-md group"
                    style={{
                      top: `${position.top}px`,
                      height: `${height}px`,
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                      borderLeftColor: event.color,
                      backgroundColor: `${event.color}20`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onDateClick(currentDay)
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 h-full">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground mb-1">{event.title}</div>
                        {event.startTime && (
                          <div className="text-xs font-medium mb-1" style={{ color: event.color }}>
                            {event.startTime} {event.endTime && `- ${event.endTime}`}
                          </div>
                        )}
                        {event.description && (
                          <div className="text-xs text-muted-foreground line-clamp-2">{event.description}</div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onEventDelete(event.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/20 rounded flex-shrink-0"
                      >
                        <svg className="w-4 h-4 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
