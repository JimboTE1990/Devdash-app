'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { MonthCalendar } from '@/components/calendar/MonthCalendar'
import { WeekCalendar } from '@/components/calendar/WeekCalendar'
import { WeekOverview } from '@/components/calendar/WeekOverview'
import { DayCalendar } from '@/components/calendar/DayCalendar'
import { UpgradePrompt } from '@/components/upgrade/UpgradePrompt'
import { ClaimTrialPrompt } from '@/components/upgrade/ClaimTrialPrompt'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Edit, Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'

interface Event {
  id: string
  title: string
  description: string
  date: Date
  startTime?: string
  endTime?: string
  color: string
  linkedTaskId?: string
  createdAt: Date
}

export default function CalendarPage() {
  const { user, requiresUpgrade, hasAccess } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [eventTitle, setEventTitle] = useState('')
  const [eventDescription, setEventDescription] = useState('')
  const [eventStartTime, setEventStartTime] = useState('')
  const [eventEndTime, setEventEndTime] = useState('')
  const [eventColor, setEventColor] = useState('#8b5cf6')
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'week-overview' | 'month'>('week-overview')
  const [validationError, setValidationError] = useState('')
  const [showDatePicker, setShowDatePicker] = useState(false)

  const colorOptions = [
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Yellow', value: '#f59e0b' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Orange', value: '#f97316' },
  ]

  useEffect(() => {
    if (user) {
      const storedEvents = localStorage.getItem(`calendar-events-${user.uid}`)
      if (storedEvents) {
        const parsed = JSON.parse(storedEvents)
        setEvents(parsed.map((e: any) => ({
          ...e,
          date: new Date(e.date),
          createdAt: new Date(e.createdAt),
        })))
      }
    }
  }, [user])

  const saveEvents = (newEvents: Event[]) => {
    if (user) {
      localStorage.setItem(`calendar-events-${user.uid}`, JSON.stringify(newEvents))
      setEvents(newEvents)
    }
  }

  const handleCreateEvent = () => {
    setEditingEvent(null)
    setEventTitle('')
    setEventDescription('')
    setEventStartTime('')
    setEventEndTime('')
    setEventColor('#8b5cf6')
    setValidationError('')
    setShowEventDialog(true)
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setEventTitle(event.title)
    setEventDescription(event.description)
    setEventStartTime(event.startTime || '')
    setEventEndTime(event.endTime || '')
    setEventColor(event.color || '#8b5cf6')
    setSelectedDate(event.date)
    setValidationError('')
    setShowEventDialog(true)
  }

  const handleSaveEvent = () => {
    // Validation
    if (!eventTitle.trim()) {
      setValidationError('Event title is required')
      return
    }
    if (!eventStartTime.trim()) {
      setValidationError('Start time is required')
      return
    }

    setValidationError('')

    if (editingEvent) {
      const updatedEvents = events.map(e =>
        e.id === editingEvent.id
          ? { ...e, title: eventTitle, description: eventDescription, startTime: eventStartTime, endTime: eventEndTime, color: eventColor }
          : e
      )
      saveEvents(updatedEvents)
    } else {
      const newEvent: Event = {
        id: Date.now().toString(),
        title: eventTitle,
        description: eventDescription,
        date: selectedDate,
        startTime: eventStartTime,
        endTime: eventEndTime,
        color: eventColor,
        createdAt: new Date(),
      }
      saveEvents([...events, newEvent])
    }

    setShowEventDialog(false)
    setEventTitle('')
    setEventDescription('')
    setEventStartTime('')
    setEventEndTime('')
    setEventColor('#8b5cf6')
    setEditingEvent(null)
  }

  const handleDeleteEvent = (eventId: string) => {
    saveEvents(events.filter(e => e.id !== eventId))
  }

  const handleEventUpdate = (eventId: string, newDate: Date, newStartTime?: string) => {
    const updatedEvents = events.map(e => {
      if (e.id === eventId) {
        const updatedEvent = { ...e, date: newDate }
        if (newStartTime) {
          updatedEvent.startTime = newStartTime
          // Calculate new end time if there was an original duration
          if (e.startTime && e.endTime) {
            const [oldStartHours, oldStartMinutes] = e.startTime.split(':').map(Number)
            const [oldEndHours, oldEndMinutes] = e.endTime.split(':').map(Number)
            const durationMinutes = (oldEndHours * 60 + oldEndMinutes) - (oldStartHours * 60 + oldStartMinutes)

            const [newStartHours, newStartMinutes] = newStartTime.split(':').map(Number)
            const newEndTotalMinutes = (newStartHours * 60 + newStartMinutes) + durationMinutes
            const newEndHours = Math.floor(newEndTotalMinutes / 60) % 24
            const newEndMinutes = newEndTotalMinutes % 60
            updatedEvent.endTime = `${newEndHours.toString().padStart(2, '0')}:${newEndMinutes.toString().padStart(2, '0')}`
          }
        }
        return updatedEvent
      }
      return e
    })
    saveEvents(updatedEvents)
  }

  const eventsForSelectedDate = events.filter(
    e => format(e.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  )

  const datesWithEvents = events.map(e => e.date)

  // Show claim trial prompt if user hasn't claimed their trial yet
  if (!hasAccess && !requiresUpgrade) {
    return <ClaimTrialPrompt />
  }

  // Show upgrade prompt if trial expired
  if (requiresUpgrade) {
    return <UpgradePrompt mode="page" />
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
              <p className="text-muted-foreground leading-relaxed">Track your meetings and key events</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setViewMode('day')}
                variant={viewMode === 'day' ? 'default' : 'outline'}
                size="sm"
              >
                Day
              </Button>
              <Button
                onClick={() => setViewMode('week-overview')}
                variant={viewMode === 'week-overview' ? 'default' : 'outline'}
                size="sm"
              >
                Week
              </Button>
              <Button
                onClick={() => setViewMode('week')}
                variant={viewMode === 'week' ? 'default' : 'outline'}
                size="sm"
              >
                Grid View
              </Button>
              <Button
                onClick={() => setViewMode('month')}
                variant={viewMode === 'month' ? 'default' : 'outline'}
                size="sm"
              >
                Month
              </Button>
            </div>
          </div>
        </div>

        {viewMode === 'day' ? (
          <DayCalendar
            events={events}
            onDateClick={(date) => {
              setSelectedDate(date)
              handleCreateEvent()
            }}
            onCreateEvent={handleCreateEvent}
            onEventUpdate={handleEventUpdate}
            onEventDelete={handleDeleteEvent}
          />
        ) : viewMode === 'week-overview' ? (
          <WeekOverview
            events={events}
            onDateClick={(date) => {
              setSelectedDate(date)
              handleCreateEvent()
            }}
            onCreateEvent={handleCreateEvent}
            onEventDelete={handleDeleteEvent}
            onEventEdit={handleEditEvent}
          />
        ) : viewMode === 'week' ? (
          <WeekCalendar
            events={events}
            onDateClick={(date) => {
              setSelectedDate(date)
              handleCreateEvent()
            }}
            onCreateEvent={handleCreateEvent}
            onEventUpdate={handleEventUpdate}
            onEventDelete={handleDeleteEvent}
            onEventEdit={handleEditEvent}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-3">
              <div className="bg-card rounded-xl border border-border shadow-lg p-6">
                <MonthCalendar
                  events={events}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  onDateClick={(date) => {
                    setSelectedDate(date)
                    const dayEvents = events.filter(
                      e => format(e.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                    )
                    if (dayEvents.length === 0) {
                      handleCreateEvent()
                    }
                  }}
                  onEventEdit={handleEditEvent}
                />
              </div>
            </div>

            {/* Events List */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border border-border shadow-lg p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  {format(selectedDate, 'MMMM d, yyyy')}
                </h2>
                {eventsForSelectedDate.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No events for this day</p>
                ) : (
                  <div className="space-y-3">
                    {eventsForSelectedDate.map(event => (
                      <div
                        key={event.id}
                        className="p-4 rounded-xl border-l-4 hover:opacity-90 transition-all shadow-sm"
                        style={{
                          borderLeftColor: event.color,
                          backgroundColor: `${event.color}10`
                        }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-medium text-foreground text-sm">{event.title}</h3>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEditEvent(event)}
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        {event.description && (
                          <p className="text-muted-foreground text-xs mb-2">{event.description}</p>
                        )}
                        {(event.startTime || event.endTime) && (
                          <p className="text-xs font-medium" style={{ color: event.color }}>
                            {event.startTime} {event.endTime && `- ${event.endTime}`}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Event Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit Event' : 'New Event'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {validationError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-500/50 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300 font-medium">{validationError}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label>Event Title <span className="text-red-500">*</span></Label>
              <Input
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Team meeting, Client call..."
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="Add details..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                {format(selectedDate, 'MMMM d, yyyy')}
              </Button>
              {showDatePicker && (
                <div className="border border-border rounded-lg p-3 bg-card">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) setSelectedDate(date)
                      setShowDatePicker(false)
                    }}
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time <span className="text-red-500">*</span></Label>
                <div className="flex gap-2">
                  <select
                    value={eventStartTime.split(':')[0] || ''}
                    onChange={(e) => {
                      const minutes = eventStartTime.split(':')[1] || '00'
                      setEventStartTime(`${e.target.value}:${minutes}`)
                    }}
                    className="flex-1 px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">--</option>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0')
                      const display = i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`
                      return <option key={hour} value={hour}>{display}</option>
                    })}
                  </select>
                  <select
                    value={eventStartTime.split(':')[1] || ''}
                    onChange={(e) => {
                      const hours = eventStartTime.split(':')[0] || ''
                      if (hours) {
                        setEventStartTime(`${hours}:${e.target.value}`)
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={!eventStartTime.split(':')[0]}
                  >
                    <option value="">--</option>
                    {Array.from({ length: 12 }, (_, i) => {
                      const minute = (i * 5).toString().padStart(2, '0')
                      return <option key={minute} value={minute}>{minute}</option>
                    })}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <div className="flex gap-2">
                  <select
                    value={eventEndTime.split(':')[0] || ''}
                    onChange={(e) => {
                      const minutes = eventEndTime.split(':')[1] || '00'
                      setEventEndTime(`${e.target.value}:${minutes}`)
                    }}
                    className="flex-1 px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">--</option>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0')
                      const display = i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`
                      return <option key={hour} value={hour}>{display}</option>
                    })}
                  </select>
                  <select
                    value={eventEndTime.split(':')[1] || ''}
                    onChange={(e) => {
                      const hours = eventEndTime.split(':')[0] || ''
                      if (hours) {
                        setEventEndTime(`${hours}:${e.target.value}`)
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={!eventEndTime.split(':')[0]}
                  >
                    <option value="">--</option>
                    {Array.from({ length: 12 }, (_, i) => {
                      const minute = (i * 5).toString().padStart(2, '0')
                      return <option key={minute} value={minute}>{minute}</option>
                    })}
                  </select>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Event Color</Label>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setEventColor(color.value)}
                    className={`w-10 h-10 rounded-lg transition-all hover:scale-110 ${
                      eventColor === color.value ? 'ring-2 ring-offset-2 ring-primary' : ''
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEvent}>
                {editingEvent ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
