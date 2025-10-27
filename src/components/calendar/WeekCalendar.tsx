'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameDay,
  addWeeks,
  subWeeks,
  parseISO,
  startOfDay,
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

interface WeekCalendarProps {
  events: Event[]
  onDateClick: (date: Date) => void
  onCreateEvent: () => void
  onEventUpdate: (eventId: string, newDate: Date, newStartTime?: string) => void
  onEventDelete: (eventId: string) => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function WeekCalendar({ events, onDateClick, onCreateEvent, onEventUpdate, onEventDelete }: WeekCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null)

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }) // Monday
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 })
  const days = []
  let day = weekStart

  while (day <= weekEnd) {
    days.push(day)
    day = addDays(day, 1)
  }

  const getEventsForDay = (date: Date) => {
    return events.filter(event => isSameDay(new Date(event.date), date))
  }

  const getEventPosition = (startTime?: string) => {
    if (!startTime) return { top: 0, height: 60 }
    const [hours, minutes] = startTime.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes
    const top = (totalMinutes / 60) * 60 // 60px per hour
    return { top, height: 60 }
  }

  const getEventDuration = (startTime?: string, endTime?: string) => {
    if (!startTime || !endTime) return 60
    const [startHours, startMinutes] = startTime.split(':').map(Number)
    const [endHours, endMinutes] = endTime.split(':').map(Number)
    const startTotal = startHours * 60 + startMinutes
    const endTotal = endHours * 60 + endMinutes
    return ((endTotal - startTotal) / 60) * 60 // Convert to pixels
  }

  const isToday = (date: Date) => isSameDay(date, new Date())

  const handleDragStart = (event: Event) => {
    setDraggedEvent(event)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (date: Date, hour: number) => {
    if (!draggedEvent) return

    const newStartTime = `${hour.toString().padStart(2, '0')}:00`
    onEventUpdate(draggedEvent.id, date, newStartTime)
    setDraggedEvent(null)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-foreground">
            {format(weekStart, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
              variant="ghost"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => setCurrentWeek(new Date())}
              variant="ghost"
              size="sm"
            >
              Today
            </Button>
            <Button
              onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
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
      <div className="flex-1 bg-card rounded-xl border border-border shadow-lg overflow-hidden">
        <div className="flex h-full">
          {/* Time column */}
          <div className="w-16 border-r border-border bg-secondary/30">
            <div className="h-14 border-b border-border"></div>
            <div className="relative">
              {HOURS.map(hour => (
                <div
                  key={hour}
                  className="h-[60px] border-b border-border flex items-start justify-center pt-1"
                >
                  <span className="text-xs text-muted-foreground">
                    {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Days columns */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex min-w-max">
              {days.map(day => {
                const dayEvents = getEventsForDay(day)
                return (
                  <div key={day.toString()} className="flex-1 min-w-[140px] border-r border-border">
                    {/* Day header */}
                    <div className={`h-14 border-b border-border flex flex-col items-center justify-center ${
                      isToday(day) ? 'bg-primary/5' : ''
                    }`}>
                      <div className="text-xs text-muted-foreground uppercase">{format(day, 'EEE')}</div>
                      <div className={`text-lg font-semibold ${
                        isToday(day)
                          ? 'bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center'
                          : 'text-foreground'
                      }`}>
                        {format(day, 'd')}
                      </div>
                    </div>

                    {/* Time slots */}
                    <div className="relative">
                      {HOURS.map(hour => (
                        <div
                          key={hour}
                          className="h-[60px] border-b border-border hover:bg-secondary/30 cursor-pointer transition-colors"
                          onClick={() => onDateClick(day)}
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(day, hour)}
                        ></div>
                      ))}

                      {/* Events */}
                      <div className="absolute inset-0 pointer-events-none">
                        {dayEvents.map(event => {
                          const position = getEventPosition(event.startTime)
                          const height = getEventDuration(event.startTime, event.endTime)
                          return (
                            <div
                              key={event.id}
                              draggable
                              onDragStart={() => handleDragStart(event)}
                              className="absolute left-1 right-1 border-l-3 rounded-lg p-1.5 pointer-events-auto cursor-move hover:opacity-90 transition-all overflow-hidden shadow-sm group"
                              style={{
                                top: `${position.top}px`,
                                height: `${height}px`,
                                borderLeftWidth: '3px',
                                borderLeftColor: event.color,
                                backgroundColor: `${event.color}20`,
                              }}
                              onClick={(e) => {
                                e.stopPropagation()
                                onDateClick(day)
                              }}
                            >
                              <div className="flex items-start justify-between gap-1">
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-semibold text-foreground truncate">{event.title}</div>
                                  {event.startTime && (
                                    <div className="text-[10px] font-medium" style={{ color: event.color }}>{event.startTime}</div>
                                  )}
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onEventDelete(event.id)
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-destructive/20 rounded"
                                >
                                  <svg className="w-3 h-3 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
