import { Task } from './types'

const ARCHIVE_THRESHOLD_DAYS = 7

/**
 * Automatically archive tasks that have been in "Done" column for 7+ days
 * @param tasks - Array of tasks
 * @param doneColumnId - ID of the "Done" column (default: 'done')
 * @returns Updated tasks array with archived tasks
 */
export function autoArchiveTasks(
  tasks: Task[],
  doneColumnId: string = 'done'
): Task[] {
  const now = new Date()

  return tasks.map(task => {
    // Skip if already archived
    if (task.isArchived) return task

    // Only archive tasks in "Done" column
    if (task.columnId !== doneColumnId) return task

    // Check if task has been updated more than 7 days ago
    const daysSinceUpdate = Math.floor(
      (now.getTime() - new Date(task.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSinceUpdate >= ARCHIVE_THRESHOLD_DAYS) {
      return {
        ...task,
        isArchived: true,
        archivedAt: now,
      }
    }

    return task
  })
}

/**
 * Filter tasks by archive status
 * @param tasks - Array of tasks
 * @param showArchived - Whether to show archived tasks
 * @returns Filtered tasks array
 */
export function filterTasksByArchiveStatus(
  tasks: Task[],
  showArchived: boolean
): Task[] {
  if (showArchived) {
    return tasks // Show all tasks including archived
  }
  return tasks.filter(task => !task.isArchived) // Only show non-archived tasks
}

/**
 * Get count of archived tasks
 * @param tasks - Array of tasks
 * @returns Number of archived tasks
 */
export function getArchivedTasksCount(tasks: Task[]): number {
  return tasks.filter(task => task.isArchived).length
}

/**
 * Manually archive a task
 * @param task - Task to archive
 * @returns Archived task
 */
export function archiveTask(task: Task): Task {
  return {
    ...task,
    isArchived: true,
    archivedAt: new Date(),
    updatedAt: new Date(),
  }
}

/**
 * Unarchive a task
 * @param task - Task to unarchive
 * @returns Unarchived task
 */
export function unarchiveTask(task: Task): Task {
  return {
    ...task,
    isArchived: false,
    archivedAt: undefined,
    updatedAt: new Date(),
  }
}
