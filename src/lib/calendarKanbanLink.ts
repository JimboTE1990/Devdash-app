import { Task, CalendarEvent } from './types'

export interface LinkResult {
  success: boolean
  message: string
  updatedTask?: Task
  updatedEvent?: CalendarEvent
}

/**
 * Create a calendar event from a Kanban task
 * Links the event to the task using the task's due date
 */
export function createEventFromTask(task: Task, userId: string): CalendarEvent | null {
  if (!task.dueDate) {
    return null
  }

  const event: CalendarEvent = {
    id: `event-${Date.now()}`,
    title: task.title,
    description: task.description || '',
    date: new Date(task.dueDate),
    startTime: '09:00',
    endTime: '10:00',
    color: getPriorityColor(task.priority),
    linkedTaskId: task.id,
    createdAt: new Date(),
  }

  return event
}

/**
 * Create a Kanban task from a calendar event
 * Links the task to the event using the event's date as due date
 */
export function createTaskFromEvent(
  event: CalendarEvent,
  boardId: string,
  swimlaneId: string,
  columnId: string
): Task {
  const task: Task = {
    id: `task-${Date.now()}`,
    title: event.title,
    description: event.description,
    swimlaneId,
    columnId,
    dueDate: new Date(event.date),
    priority: 'medium',
    assignee: undefined,
    comments: [],
    subtasks: [],
    isBlocked: false,
    isRejected: false,
    linkedEventId: event.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  return task
}

/**
 * Link an existing calendar event to an existing Kanban task
 */
export function linkEventToTask(event: CalendarEvent, task: Task): { event: CalendarEvent; task: Task } {
  return {
    event: { ...event, linkedTaskId: task.id },
    task: { ...task, linkedEventId: event.id },
  }
}

/**
 * Unlink a calendar event from a Kanban task
 */
export function unlinkEventFromTask(event: CalendarEvent, task: Task): { event: CalendarEvent; task: Task } {
  const updatedEvent = { ...event }
  delete updatedEvent.linkedTaskId

  const updatedTask = { ...task }
  delete updatedTask.linkedEventId

  return {
    event: updatedEvent,
    task: updatedTask,
  }
}

/**
 * Sync changes from task to event
 * Updates event properties based on task changes
 */
export function syncTaskToEvent(task: Task, event: CalendarEvent): CalendarEvent {
  return {
    ...event,
    title: task.title,
    description: task.description || event.description,
    date: task.dueDate || event.date,
    color: getPriorityColor(task.priority),
  }
}

/**
 * Sync changes from event to task
 * Updates task properties based on event changes
 */
export function syncEventToTask(event: CalendarEvent, task: Task): Task {
  return {
    ...task,
    title: event.title,
    description: event.description || task.description,
    dueDate: new Date(event.date),
    updatedAt: new Date(),
  }
}

/**
 * Get color based on task priority
 */
function getPriorityColor(priority?: 'low' | 'medium' | 'high'): string {
  switch (priority) {
    case 'high':
      return '#ef4444' // Red
    case 'medium':
      return '#f59e0b' // Orange
    case 'low':
      return '#10b981' // Green
    default:
      return '#8b5cf6' // Purple
  }
}

/**
 * Check if a task has a linked event
 */
export function hasLinkedEvent(task: Task): boolean {
  return !!task.linkedEventId
}

/**
 * Check if an event has a linked task
 */
export function hasLinkedTask(event: CalendarEvent): boolean {
  return !!event.linkedTaskId
}

/**
 * Get linked event ID from task
 */
export function getLinkedEventId(task: Task): string | undefined {
  return task.linkedEventId
}

/**
 * Get linked task ID from event
 */
export function getLinkedTaskId(event: CalendarEvent): string | undefined {
  return event.linkedTaskId
}
