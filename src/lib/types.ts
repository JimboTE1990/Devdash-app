export interface User {
  uid: string
  email: string
  firstName?: string
  lastName?: string
  plan: 'free' | 'premium'
  trialStartDate?: Date
  trialEndDate?: Date
  subscriptionStartDate?: Date
  createdAt: Date
}

export interface Comment {
  id: string
  taskId: string
  userId: string
  userName: string
  content: string
  createdAt: Date
}

export interface Subtask {
  id: string
  title: string
  completed: boolean
}

export interface Task {
  id: string
  title: string
  description?: string
  swimlaneId: string
  columnId: string
  dueDate?: Date
  priority?: 'low' | 'medium' | 'high'
  assignee?: string
  comments: Comment[]
  subtasks: Subtask[]
  isBlocked: boolean
  blockReason?: string
  isRejected: boolean
  rejectionReason?: string
  createdAt: Date
  updatedAt: Date
}

export interface Column {
  id: string
  title: string
  order: number
}

export interface Swimlane {
  id: string
  title: string
  order: number
  collapsed: boolean
}

export interface Board {
  id: string
  title: string
  userId: string
  columns: Column[]
  swimlanes: Swimlane[]
  tasks: Task[]
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export type BoardType = 'marketing' | 'product' | 'custom'
