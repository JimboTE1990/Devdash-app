'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Task } from '@/lib/types'
import { PlannerBoard } from '@/components/planner/PlannerBoard'
import { ChevronLeft, ChevronRight, History } from 'lucide-react'

interface Swimlane {
  id: string
  title: string
  order: number
}

interface PlannerSnapshot {
  timestamp: Date
  tasks: Task[]
  swimlanes: Swimlane[]
}

export default function PlannerPage() {
  const { user, loading, isTrialActive, isPremium } = useAuth()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [swimlanes, setSwimlanes] = useState<Swimlane[]>([
    { id: 'priority-1', title: 'Priority 1', order: 0 },
    { id: 'priority-2', title: 'Priority 2', order: 1 },
    { id: 'priority-3', title: 'Priority 3', order: 2 },
    { id: 'priority-4', title: 'Priority 4', order: 3 },
  ])
  const [history, setHistory] = useState<PlannerSnapshot[]>([])
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)

  // Calculate weeks in the selected month
  const getWeeksInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    // Get the Monday of the week containing the first day
    const firstMonday = new Date(firstDay)
    const dayOfWeek = firstDay.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    firstMonday.setDate(firstDay.getDate() + diff)

    const weeks: { weekNumber: number; startDate: Date; endDate: Date }[] = []
    let currentWeekStart = new Date(firstMonday)
    let weekNum = 1

    while (currentWeekStart <= lastDay) {
      const currentWeekEnd = new Date(currentWeekStart)
      currentWeekEnd.setDate(currentWeekEnd.getDate() + 6)

      weeks.push({
        weekNumber: weekNum,
        startDate: new Date(currentWeekStart),
        endDate: new Date(currentWeekEnd),
      })

      currentWeekStart.setDate(currentWeekStart.getDate() + 7)
      weekNum++
    }

    return weeks
  }

  const weeks = getWeeksInMonth(selectedDate)

  const changeMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setSelectedDate(newDate)
  }

  const changeYear = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    if (direction === 'prev') {
      newDate.setFullYear(newDate.getFullYear() - 1)
    } else {
      newDate.setFullYear(newDate.getFullYear() + 1)
    }
    setSelectedDate(newDate)
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  // Save snapshot to history (max 10 snapshots)
  const saveSnapshot = () => {
    if (!user) return

    const snapshot: PlannerSnapshot = {
      timestamp: new Date(),
      tasks: [...tasks],
      swimlanes: [...swimlanes],
    }

    const newHistory = [snapshot, ...history].slice(0, 10) // Keep last 10 snapshots
    setHistory(newHistory)
    localStorage.setItem(`planner-history-${user.uid}`, JSON.stringify(newHistory))
  }

  // Restore from snapshot
  const restoreSnapshot = (snapshot: PlannerSnapshot) => {
    setTasks(snapshot.tasks.map((task: any) => ({
      ...task,
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
    })))
    setSwimlanes(snapshot.swimlanes)
    setShowHistoryDialog(false)
  }

  useEffect(() => {
    if (user) {
      // Initialize tasks from localStorage
      const storedTasks = localStorage.getItem(`planner-tasks-${user.uid}`)
      if (storedTasks) {
        const parsed = JSON.parse(storedTasks)
        const tasksWithDates = parsed.map((task: any) => ({
          ...task,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
        }))
        setTasks(tasksWithDates)
      }

      // Initialize swimlanes from localStorage
      const storedSwimlanes = localStorage.getItem(`planner-swimlanes-${user.uid}`)
      if (storedSwimlanes) {
        setSwimlanes(JSON.parse(storedSwimlanes))
      }

      // Initialize history from localStorage
      const storedHistory = localStorage.getItem(`planner-history-${user.uid}`)
      if (storedHistory) {
        const parsed = JSON.parse(storedHistory)
        setHistory(parsed.map((snapshot: any) => ({
          ...snapshot,
          timestamp: new Date(snapshot.timestamp),
        })))
      }
    }
  }, [user])

  // Save tasks and swimlanes to localStorage whenever they change
  useEffect(() => {
    if (user) {
      if (tasks.length > 0) {
        localStorage.setItem(`planner-tasks-${user.uid}`, JSON.stringify(tasks))
      }
      localStorage.setItem(`planner-swimlanes-${user.uid}`, JSON.stringify(swimlanes))
    }
  }, [tasks, swimlanes, user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleUpdateTasks = (updatedTasks: Task[]) => {
    saveSnapshot() // Save current state before updating
    setTasks(updatedTasks)
  }

  const handleUpdateSwimlanes = (updatedSwimlanes: Swimlane[]) => {
    saveSnapshot() // Save current state before updating
    setSwimlanes(updatedSwimlanes)
  }

  const monthName = selectedDate.toLocaleString('default', { month: 'long' })
  const year = selectedDate.getFullYear()

  return (
    <div className="h-screen flex flex-col">
      {/* Trial/Premium Status Banner */}
      {isTrialActive && user.trialEndDate && (
        <div className="bg-gradient-to-r from-primary to-accent text-white px-4 py-2 text-center shadow-md">
          <p className="text-sm font-medium">
            Trial Active - {Math.ceil((user.trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining
          </p>
        </div>
      )}

      {!isPremium && !isTrialActive && (
        <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-4 py-2 text-center shadow-md">
          <p className="text-sm font-medium">
            Your trial has expired. Upgrade to Premium to continue using Jimbula.
          </p>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Weekly Planner</h1>
            <p className="text-muted-foreground">
              Plan your tasks week by week
            </p>
          </div>

          {/* Month/Year Controls and History Button */}
          <div className="flex items-center gap-6">
            {/* History Button */}
            <Button
              onClick={() => setShowHistoryDialog(true)}
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={history.length === 0}
            >
              <History className="h-4 w-4" />
              Version History ({history.length})
            </Button>

            {/* Year Control */}
            <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-border shadow-md">
              <Button
                onClick={() => changeYear('prev')}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-foreground font-semibold min-w-[60px] text-center">{year}</span>
              <Button
                onClick={() => changeYear('next')}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Month Control */}
            <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-border shadow-md">
              <Button
                onClick={() => changeMonth('prev')}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-foreground font-semibold min-w-[120px] text-center">{monthName}</span>
              <Button
                onClick={() => changeMonth('next')}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Planner Board */}
        <div className="flex-1 overflow-hidden bg-card/50 backdrop-blur-sm rounded-lg border border-border shadow-xl">
          <PlannerBoard
            tasks={tasks}
            weeks={weeks}
            swimlanes={swimlanes}
            onUpdateTasks={handleUpdateTasks}
            onUpdateSwimlanes={handleUpdateSwimlanes}
            userId={user.uid}
          />
        </div>

        {/* Version History Dialog */}
        {showHistoryDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-lg border border-border p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-foreground">Version History</h2>
                <Button onClick={() => setShowHistoryDialog(false)} variant="ghost" size="sm">
                  Close
                </Button>
              </div>

              <p className="text-muted-foreground mb-4 text-sm">
                Restore a previous version of your planner. The last 10 snapshots are saved automatically.
              </p>

              <div className="space-y-2">
                {history.map((snapshot, index) => (
                  <div
                    key={index}
                    className="bg-muted/50 border border-border rounded-lg p-4 hover:border-primary transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-foreground font-medium">
                          {snapshot.timestamp.toLocaleString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {snapshot.tasks.length} tasks, {snapshot.swimlanes.length} priorities
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          if (confirm('Are you sure you want to restore this version? Current data will be replaced.')) {
                            restoreSnapshot(snapshot)
                          }
                        }}
                        className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
                        size="sm"
                      >
                        Restore
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
