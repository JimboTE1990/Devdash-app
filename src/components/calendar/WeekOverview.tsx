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

interface WeekOverviewProps {
  events: Event[]
  onDateClick: (date: Date) => void
  onCreateEvent: () => void
  onEventDelete: (eventId: string) => void
  onEventEdit: (event: Event) => void
}

export function WeekOverview({ events, onDateClick, onCreateEvent, onEventDelete, onEventEdit }: WeekOverviewProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date())

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
      .sort((a, b) => {
        if (!a.startTime) return 1
        if (!b.startTime) return -1
        return a.startTime.localeCompare(b.startTime)
      })
  }

  const isToday = (date: Date) => isSameDay(date, new Date())

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-foreground">
            {format(weekStart, 'MMMM d')} - {format(weekEnd, 'd, yyyy')}
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

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-3 flex-1">
        {days.map(day => {
          const dayEvents = getEventsForDay(day)
          return (
            <div
              key={day.toString()}
              className={`bg-card rounded-xl border border-border shadow-md p-4 flex flex-col ${
                isToday(day) ? 'ring-2 ring-primary' : ''
              }`}
            >
              {/* Day header */}
              <div className="text-center mb-3 pb-2 border-b border-border">
                <div className="text-xs text-muted-foreground uppercase font-semibold">
                  {format(day, 'EEE')}
                </div>
                <div className={`text-2xl font-bold ${
                  isToday(day) ? 'text-primary' : 'text-foreground'
                }`}>
                  {format(day, 'd')}
                </div>
              </div>

              {/* Events list */}
              <div className="flex-1 space-y-2 overflow-y-auto">
                {dayEvents.length === 0 ? (
                  <div
                    className="text-xs text-muted-foreground text-center py-4 cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => onDateClick(day)}
                  >
                    No events
                  </div>
                ) : (
                  dayEvents.map(event => (
                    <div
                      key={event.id}
                      className="group relative rounded-lg p-2 border-l-3 cursor-pointer hover:opacity-90 transition-all shadow-sm"
                      style={{
                        borderLeftWidth: '3px',
                        borderLeftColor: event.color,
                        backgroundColor: `${event.color}15`,
                      }}
                      onClick={() => onEventEdit(event)}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex-1 min-w-0">
                          {event.startTime && (
                            <div className="text-xs font-semibold mb-0.5" style={{ color: event.color }}>
                              {event.startTime}
                            </div>
                          )}
                          <div className="text-sm font-medium text-foreground truncate">
                            {event.title}
                          </div>
                          {event.description && (
                            <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {event.description}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm('Delete this event?')) {
                              onEventDelete(event.id)
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-destructive/20 rounded flex-shrink-0"
                        >
                          <svg className="w-3 h-3 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add event button */}
              <button
                onClick={() => onDateClick(day)}
                className="mt-2 w-full py-1.5 text-xs text-muted-foreground hover:text-primary hover:bg-secondary rounded transition-colors"
              >
                + Add event
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
