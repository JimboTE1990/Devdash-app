import { Board, Column, Swimlane } from './types'

export const defaultColumns: Column[] = [
  { id: 'backlog', title: 'Backlog', order: 0 },
  { id: 'in-progress', title: 'In Progress', order: 1 },
  { id: 'done', title: 'Done', order: 2 },
]

export const marketingSwimlanes: Swimlane[] = [
  { id: 'outbound', title: 'Outbound', order: 0, collapsed: false },
  { id: 'organic', title: 'Organic', order: 1, collapsed: false },
  { id: 'affiliate', title: 'Affiliate/Partnership', order: 2, collapsed: false },
  { id: 'paid-ads', title: 'Paid Ads', order: 3, collapsed: false },
]

export const productSwimlanes: Swimlane[] = [
  { id: 'build', title: 'Build', order: 0, collapsed: false },
  { id: 'test', title: 'Test', order: 1, collapsed: false },
  { id: 'validation', title: 'Validation/Feedback', order: 2, collapsed: false },
  { id: 'bug-fixes', title: 'Bug Fixes/New Features', order: 3, collapsed: false },
]

export function createMarketingBoard(userId: string): Board {
  const now = new Date()
  return {
    id: 'marketing-board',
    title: 'Marketing',
    userId,
    columns: defaultColumns,
    swimlanes: marketingSwimlanes,
    tasks: [
      {
        id: 'task-1',
        title: 'Cold Email Campaign',
        description: 'Set up and launch cold email outreach to potential customers',
        swimlaneId: 'outbound',
        columnId: 'backlog',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        priority: 'high',
        comments: [],
        subtasks: [
          { id: 'st-1', title: 'Research target audience', completed: false },
          { id: 'st-2', title: 'Write email templates', completed: false },
          { id: 'st-3', title: 'Set up email automation', completed: false },
        ],
        isBlocked: false,
        isRejected: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'task-2',
        title: 'X Build-in-Public',
        description: 'Share daily updates about product development on X (Twitter)',
        swimlaneId: 'organic',
        columnId: 'in-progress',
        priority: 'medium',
        comments: [],
        subtasks: [
          { id: 'st-4', title: 'Create content calendar', completed: true },
          { id: 'st-5', title: 'Post daily updates', completed: false },
        ],
        isBlocked: false,
        isRejected: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'task-3',
        title: 'Reddit AMA',
        description: 'Host an AMA session on relevant subreddits',
        swimlaneId: 'organic',
        columnId: 'backlog',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        priority: 'low',
        comments: [],
        subtasks: [],
        isBlocked: false,
        isRejected: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'task-4',
        title: 'Content Creator Partnerships',
        description: 'Reach out to tech YouTubers for product reviews',
        swimlaneId: 'affiliate',
        columnId: 'backlog',
        priority: 'medium',
        comments: [],
        subtasks: [
          { id: 'st-6', title: 'Create list of potential partners', completed: false },
          { id: 'st-7', title: 'Draft partnership proposal', completed: false },
        ],
        isBlocked: false,
        isRejected: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'task-5',
        title: 'Google Ads Campaign',
        description: 'Set up targeted Google Ads for product keywords',
        swimlaneId: 'paid-ads',
        columnId: 'backlog',
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        priority: 'low',
        comments: [],
        subtasks: [],
        isBlocked: true,
        blockReason: 'Waiting for marketing budget approval',
        isRejected: false,
        createdAt: now,
        updatedAt: now,
      },
    ],
    isDefault: true,
    createdAt: now,
    updatedAt: now,
  }
}

export function createProductBoard(userId: string): Board {
  const now = new Date()
  return {
    id: 'product-board',
    title: 'Product Build',
    userId,
    columns: defaultColumns,
    swimlanes: productSwimlanes,
    tasks: [
      {
        id: 'task-6',
        title: 'User Authentication',
        description: 'Implement Firebase authentication with email/password',
        swimlaneId: 'build',
        columnId: 'done',
        priority: 'high',
        comments: [],
        subtasks: [
          { id: 'st-8', title: 'Set up Firebase project', completed: true },
          { id: 'st-9', title: 'Create login/register forms', completed: true },
          { id: 'st-10', title: 'Add password reset', completed: true },
        ],
        isBlocked: false,
        isRejected: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'task-7',
        title: 'Drag and Drop Functionality',
        description: 'Implement drag and drop for task cards using @dnd-kit',
        swimlaneId: 'build',
        columnId: 'in-progress',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        priority: 'high',
        comments: [],
        subtasks: [
          { id: 'st-11', title: 'Install @dnd-kit packages', completed: true },
          { id: 'st-12', title: 'Implement draggable cards', completed: false },
          { id: 'st-13', title: 'Add drop zones', completed: false },
        ],
        isBlocked: false,
        isRejected: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'task-8',
        title: 'Unit Tests for Auth',
        description: 'Write comprehensive unit tests for authentication flow',
        swimlaneId: 'test',
        columnId: 'backlog',
        priority: 'medium',
        comments: [],
        subtasks: [],
        isBlocked: false,
        isRejected: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'task-9',
        title: 'User Feedback Session',
        description: 'Conduct user interviews with beta testers',
        swimlaneId: 'validation',
        columnId: 'backlog',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        priority: 'high',
        comments: [],
        subtasks: [
          { id: 'st-14', title: 'Recruit 5 beta testers', completed: false },
          { id: 'st-15', title: 'Schedule interviews', completed: false },
          { id: 'st-16', title: 'Prepare interview questions', completed: false },
        ],
        isBlocked: false,
        isRejected: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'task-10',
        title: 'Fix Mobile Responsiveness',
        description: 'Dashboard not displaying correctly on mobile devices',
        swimlaneId: 'bug-fixes',
        columnId: 'in-progress',
        priority: 'high',
        comments: [
          {
            id: 'c-1',
            taskId: 'task-10',
            userId: userId,
            userName: 'You',
            content: 'Issue reported by multiple users on iPhone 13',
            createdAt: now,
          },
        ],
        subtasks: [],
        isBlocked: false,
        isRejected: false,
        createdAt: now,
        updatedAt: now,
      },
    ],
    isDefault: true,
    createdAt: now,
    updatedAt: now,
  }
}

export function createCustomBoard(userId: string, title: string): Board {
  const now = new Date()
  return {
    id: `custom-${Date.now()}`,
    title,
    userId,
    columns: defaultColumns,
    swimlanes: [
      { id: 'swimlane-1', title: 'New Swimlane', order: 0, collapsed: false },
    ],
    tasks: [],
    isDefault: false,
    createdAt: now,
    updatedAt: now,
  }
}
