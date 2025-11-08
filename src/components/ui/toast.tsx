'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (message: string, type?: ToastType, duration?: number) => void
  removeToast: (id: string) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = React.useCallback(
    (message: string, type: ToastType = 'info', duration: number = 5000) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast: Toast = { id, message, type, duration }

      setToasts((prev) => [...prev, newToast])

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }
    },
    [removeToast]
  )

  const success = React.useCallback(
    (message: string, duration?: number) => addToast(message, 'success', duration),
    [addToast]
  )

  const error = React.useCallback(
    (message: string, duration?: number) => addToast(message, 'error', duration),
    [addToast]
  )

  const warning = React.useCallback(
    (message: string, duration?: number) => addToast(message, 'warning', duration),
    [addToast]
  )

  const info = React.useCallback(
    (message: string, duration?: number) => addToast(message, 'info', duration),
    [addToast]
  )

  const value = React.useMemo(
    () => ({
      toasts,
      addToast,
      removeToast,
      success,
      error,
      warning,
      info,
    }),
    [toasts, addToast, removeToast, success, error, warning, info]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastContainerProps {
  toasts: Toast[]
  removeToast: (id: string) => void
}

function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
  onClose: () => void
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const [isExiting, setIsExiting] = React.useState(false)

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(onClose, 300) // Match animation duration
  }

  const typeStyles = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-500/50 text-green-700 dark:text-green-300',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-500/50 text-red-700 dark:text-red-300',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-500/50 text-yellow-700 dark:text-yellow-300',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-500/50 text-blue-700 dark:text-blue-300',
  }

  const typeIcons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 rounded-lg border shadow-lg transition-all duration-300',
        typeStyles[toast.type],
        isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0 animate-slide-in'
      )}
    >
      <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center font-bold">
        {typeIcons[toast.type]}
      </div>
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={handleClose}
        className="flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
