import { Task } from './types'

export type SortOption = 'manual' | 'date-asc' | 'date-desc' | 'priority'

/**
 * Sort tasks based on the selected sort option
 * @param tasks - Array of tasks to sort
 * @param sortBy - Sort option
 * @returns Sorted array of tasks
 */
export function sortTasks(tasks: Task[], sortBy: SortOption): Task[] {
  const tasksCopy = [...tasks]

  switch (sortBy) {
    case 'date-asc':
      // Earliest date first, tasks with no date at the end
      return tasksCopy.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return a.order - b.order
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      })

    case 'date-desc':
      // Latest date first, tasks with no date at the end
      return tasksCopy.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return a.order - b.order
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
      })

    case 'priority':
      // High > Medium > Low > No priority
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return tasksCopy.sort((a, b) => {
        const aPriority = a.priority ? priorityOrder[a.priority] : 999
        const bPriority = b.priority ? priorityOrder[b.priority] : 999
        if (aPriority !== bPriority) {
          return aPriority - bPriority
        }
        return a.order - b.order
      })

    case 'manual':
    default:
      // Sort by order field (manual ordering)
      return tasksCopy.sort((a, b) => a.order - b.order)
  }
}

/**
 * Reorder tasks array after drag and drop
 * @param tasks - Array of tasks
 * @param draggedTaskId - ID of dragged task
 * @param targetIndex - Target index in the array
 * @returns Reordered tasks with updated order field
 */
export function reorderTasks(
  tasks: Task[],
  draggedTaskId: string,
  targetIndex: number
): Task[] {
  const draggedTask = tasks.find(t => t.id === draggedTaskId)
  if (!draggedTask) return tasks

  // Remove dragged task
  const filtered = tasks.filter(t => t.id !== draggedTaskId)

  // Insert at target position
  const reordered = [
    ...filtered.slice(0, targetIndex),
    draggedTask,
    ...filtered.slice(targetIndex)
  ]

  // Update order field for all tasks
  return reordered.map((task, index) => ({
    ...task,
    order: index,
    updatedAt: task.id === draggedTaskId ? new Date() : task.updatedAt
  }))
}
