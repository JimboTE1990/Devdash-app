export type DeadlineStatus = 'overdue' | 'approaching' | 'normal' | null

/**
 * Get the deadline status of a task based on its due date
 * @param dueDate - The task's due date
 * @returns 'overdue' | 'approaching' | 'normal' | null
 */
export function getTaskDeadlineStatus(dueDate?: Date): DeadlineStatus {
  if (!dueDate) return null

  const now = new Date()
  const due = new Date(dueDate)

  // Reset time to start of day for accurate comparison
  now.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)

  const diffTime = due.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  // Overdue: past the due date
  if (diffDays < 0) {
    return 'overdue'
  }

  // Approaching: within 3 days of due date (including today)
  if (diffDays <= 3) {
    return 'approaching'
  }

  // Normal: more than 3 days away
  return 'normal'
}

/**
 * Get the number of days until the due date
 * @param dueDate - The task's due date
 * @returns Number of days (negative if overdue)
 */
export function getDaysUntilDue(dueDate?: Date): number | null {
  if (!dueDate) return null

  const now = new Date()
  const due = new Date(dueDate)

  now.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)

  const diffTime = due.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Format deadline status as human-readable text
 * @param dueDate - The task's due date
 * @returns Formatted status text
 */
export function formatDeadlineStatus(dueDate?: Date): string {
  const days = getDaysUntilDue(dueDate)

  if (days === null) return ''

  if (days < 0) {
    const absDays = Math.abs(days)
    return `Overdue by ${absDays} day${absDays !== 1 ? 's' : ''}`
  }

  if (days === 0) {
    return 'Due today'
  }

  if (days === 1) {
    return 'Due tomorrow'
  }

  if (days <= 3) {
    return `Due in ${days} days`
  }

  return ''
}
