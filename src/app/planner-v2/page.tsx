'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Task } from '@/lib/types'
import { PlannerV2Board } from '@/components/planner/PlannerV2Board'
import { UpgradePrompt } from '@/components/upgrade/UpgradePrompt'
import { supabase } from '@/lib/supabase/client'

export default function PlannerV2Page() {
  const { user, loading, isTrialActive, isPremium, requiresUpgrade } = useAuth()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [tasksLoading, setTasksLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  // Fetch tasks from Supabase
  useEffect(() => {
    if (user) {
      fetchTasks()

      // Set up real-time subscription for task changes
      const channel = supabase
        .channel('planner-v2-tasks-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'planner_tasks',
            filter: `user_id=eq.${user.uid}`,
          },
          () => {
            // Refetch tasks when changes occur
            fetchTasks()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [user])

  const fetchTasks = async () => {
    if (!user) return

    setTasksLoading(true)
    try {
      const { data, error } = await supabase
        .from('planner_tasks')
        .select('*')
        .eq('user_id', user.uid)
        .eq('board_type', 'planner-v2')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching tasks:', error)
        return
      }

      if (data) {
        const tasksWithDates = data.map((task: any) => ({
          id: task.id,
          title: task.title,
          description: task.description || '',
          columnId: task.column_id,
          swimlaneId: task.swimlane_id || 'default',
          boardId: 'planner-v2',
          dueDate: task.due_date ? new Date(task.due_date) : undefined,
          priority: task.priority || 'medium',
          tags: task.tags || [],
          assignee: task.assignee || '',
          subtasks: task.subtasks || [],
          comments: task.comments || [],
          isBlocked: task.is_blocked || false,
          isRejected: task.is_rejected || false,
          order: task.order || 0,
          isArchived: task.is_archived || false,
          createdAt: new Date(task.created_at),
          updatedAt: new Date(task.updated_at),
        }))
        setTasks(tasksWithDates)
      }
    } catch (err) {
      console.error('Error fetching tasks:', err)
    } finally {
      setTasksLoading(false)
    }
  }

  if (loading || tasksLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-foreground">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Show upgrade prompt if trial expired
  if (requiresUpgrade) {
    return <UpgradePrompt mode="page" />
  }

  const handleUpdateTasks = (updatedTasks: Task[]) => {
    setTasks(updatedTasks)
  }

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

      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-foreground">Activity Planner</h1>
            <p className="text-muted-foreground max-w-4xl leading-relaxed">
              Organize tasks with clarity. Streamline your workflow and boost productivity with visual task management. Track priorities, deadlines, and progress at a glance.
            </p>
          </div>
        </div>

        {/* Planner Board */}
        <div className="flex-1 overflow-hidden bg-card/50 backdrop-blur-sm rounded-lg border border-border shadow-xl">
          <PlannerV2Board
            tasks={tasks}
            onUpdateTasks={handleUpdateTasks}
            userId={user.uid}
          />
        </div>
      </div>
    </div>
  )
}
