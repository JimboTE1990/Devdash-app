'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ChevronDown, Clock, FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  setMonth,
  setYear,
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

interface MonthCalendarProps {
  events: Event[]
  selectedDate: Date
  onSelectDate: (date: Date) => void
  onDateClick: (date: Date) => void
  onEventEdit?: (event: Event) => void
}

export function MonthCalendar({ events, selectedDate, onSelectDate, onDateClick, onEventEdit }: MonthCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [hoverDate, setHoverDate] = useState<Date | null>(null)
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 })
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null)
  const cellRef = useRef<HTMLDivElement | null>(null)

  const getEventsForDate = (date: Date) => {
    return events.filter(event =>
      isSameDay(new Date(event.date), date)
    )
  }

  const handleMouseEnter = (date: Date, e: React.MouseEvent<HTMLDivElement>) => {
    const dayEvents = getEventsForDate(date)
    if (dayEvents.length === 0) return

    hoverTimeout.current = setTimeout(() => {
      const rect = e.currentTarget.getBoundingClientRect()
      setPopoverPosition({
        x: rect.left + rect.width / 2,
        y: rect.bottom + 10,
      })
      setHoverDate(date)
    }, 500)
  }

  const handleMouseLeave = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current)
    }
    setHoverDate(null)
  }

  useEffect(() => {
    return () => {
      if (hoverTimeout.current) {
        clearTimeout(hoverTimeout.current)
      }
    }
  }, [])

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const currentYear = currentMonth.getFullYear()
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i)

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-xl font-semibold text-foreground">
                {format(currentMonth, 'MMMM')}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-64 overflow-y-auto">
              {months.map((month, index) => (
                <DropdownMenuItem
                  key={month}
                  onClick={() => setCurrentMonth(setMonth(currentMonth, index))}
                >
                  {month}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-xl font-semibold text-foreground">
                {format(currentMonth, 'yyyy')}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-64 overflow-y-auto">
              {years.map(year => (
                <DropdownMenuItem
                  key={year}
                  onClick={() => setCurrentMonth(setYear(currentMonth, year))}
                >
                  {year}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            variant="ghost"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => setCurrentMonth(new Date())}
            variant="ghost"
            size="sm"
          >
            Today
          </Button>
          <Button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            variant="ghost"
            size="sm"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return (
      <div className="grid grid-cols-7 border-b border-border mb-2">
        {days.map(day => (
          <div
            key={day}
            className="py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>
    )
  }

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const rows = []
    let days = []
    let day = startDate

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const currentDay = day
        const dayEvents = getEventsForDate(currentDay)
        const isSelected = isSameDay(currentDay, selectedDate)
        const isCurrentMonth = isSameMonth(currentDay, monthStart)
        const isToday = isSameDay(currentDay, new Date())

        days.push(
          <div
            key={currentDay.toString()}
            className={`min-h-[110px] p-2 cursor-pointer transition-all duration-200 rounded-lg ${
              !isCurrentMonth ? 'opacity-40' : 'hover:bg-secondary/50'
            } ${isSelected ? 'bg-secondary ring-1 ring-primary' : ''}`}
            onClick={() => {
              onSelectDate(currentDay)
              onDateClick(currentDay)
            }}
            onMouseEnter={(e) => handleMouseEnter(currentDay, e)}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-start justify-between mb-2">
              <span
                className={`text-sm font-medium inline-flex items-center justify-center ${
                  isToday
                    ? 'bg-primary text-primary-foreground rounded-full w-7 h-7 font-bold'
                    : isCurrentMonth
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                {format(currentDay, 'd')}
              </span>
            </div>
            <div className="space-y-1">
              {dayEvents.slice(0, 3).map(event => (
                <div
                  key={event.id}
                  className="border-l-3 px-2 py-1 text-xs truncate rounded-md hover:opacity-90 transition-all shadow-sm cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (onEventEdit) {
                      onEventEdit(event)
                    } else {
                      onSelectDate(currentDay)
                    }
                  }}
                  style={{
                    borderLeftWidth: '3px',
                    borderLeftColor: event.color,
                    backgroundColor: `${event.color}15`
                  }}
                >
                  {event.startTime && (
                    <span className="font-semibold mr-1" style={{ color: event.color }}>
                      {event.startTime}
                    </span>
                  )}
                  <span className="text-foreground">{event.title}</span>
                </div>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-xs text-muted-foreground px-2 italic">
                  +{dayEvents.length - 3} more
                </div>
              )}
            </div>
          </div>
        )
        day = addDays(day, 1)
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-2">
          {days}
        </div>
      )
      days = []
    }

    return <div className="space-y-2">{rows}</div>
  }

  const hoverEvents = hoverDate ? getEventsForDate(hoverDate) : []

  return (
    <div className="relative">
      {renderHeader()}
      {renderDays()}
      {renderCells()}

      {/* Hover Popover */}
      {hoverDate && hoverEvents.length > 0 && (
        <div
          className="fixed z-50 bg-card border-2 border-primary rounded-xl shadow-2xl p-4 max-w-sm transition-all duration-200"
          style={{
            left: `${popoverPosition.x}px`,
            top: `${popoverPosition.y}px`,
            transform: 'translateX(-50%)',
          }}
          onMouseEnter={() => {
            if (hoverTimeout.current) {
              clearTimeout(hoverTimeout.current)
            }
          }}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">
              {format(hoverDate, 'MMMM d, yyyy')}
            </h3>
            <button
              onClick={() => setHoverDate(null)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {hoverEvents.map(event => (
              <div
                key={event.id}
                className="rounded-lg p-3 border-l-4 hover:opacity-90 transition-all cursor-pointer"
                style={{
                  borderLeftColor: event.color,
                  backgroundColor: `${event.color}10`
                }}
                onClick={() => {
                  if (onEventEdit) {
                    onEventEdit(event)
                  } else {
                    onSelectDate(hoverDate)
                  }
                  setHoverDate(null)
                }}
              >
                <h4 className="font-medium text-foreground mb-1">{event.title}</h4>
                {(event.startTime || event.endTime) && (
                  <div className="flex items-center gap-1 text-xs mb-2" style={{ color: event.color }}>
                    <Clock className="h-3 w-3" />
                    <span>
                      {event.startTime}
                      {event.endTime && ` - ${event.endTime}`}
                    </span>
                  </div>
                )}
                {event.description && (
                  <div className="flex items-start gap-1 text-xs text-muted-foreground">
                    <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <p className="line-clamp-2">{event.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t border-border text-center">
            <button
              onClick={() => {
                onDateClick(hoverDate)
                setHoverDate(null)
              }}
              className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
            >
              View all events
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
