'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export interface BaseDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  className?: string
}

/**
 * Reusable base dialog component with consistent styling and behavior
 *
 * @example
 * <BaseDialog
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Edit Profile"
 *   description="Update your profile information"
 *   footer={
 *     <>
 *       <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
 *       <Button onClick={handleSave}>Save</Button>
 *     </>
 *   }
 * >
 *   <form>...</form>
 * </BaseDialog>
 */
export function BaseDialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
}: BaseDialogProps) {
  // Handle escape key
  React.useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeOnEscape, onClose])

  // Prevent body scroll when dialog is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleOverlayClick}
    >
      <div
        className={cn(
          'relative w-full bg-card rounded-lg shadow-xl border border-border animate-in zoom-in-95 duration-200',
          maxWidthClasses[maxWidth],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-border">
          <div className="flex-1 pr-8">
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="flex-shrink-0 p-2 rounded-md hover:bg-secondary transition-colors"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-border bg-secondary/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Confirmation dialog variant with pre-built footer buttons
 *
 * @example
 * <ConfirmDialog
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onConfirm={handleDelete}
 *   title="Delete Item"
 *   description="Are you sure you want to delete this item?"
 *   confirmText="Delete"
 *   confirmVariant="destructive"
 * >
 *   <p>This action cannot be undone.</p>
 * </ConfirmDialog>
 */
export interface ConfirmDialogProps extends Omit<BaseDialogProps, 'footer'> {
  onConfirm: () => void
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  isLoading?: boolean
}

export function ConfirmDialog({
  onConfirm,
  onClose,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'default',
  isLoading = false,
  ...props
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    if (!isLoading) {
      onClose()
    }
  }

  return (
    <BaseDialog
      {...props}
      onClose={onClose}
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : confirmText}
          </Button>
        </>
      }
    />
  )
}

/**
 * Hook to manage dialog open/close state
 *
 * @example
 * function MyComponent() {
 *   const { isOpen, open, close, toggle } = useDialog()
 *   return (
 *     <>
 *       <Button onClick={open}>Open Dialog</Button>
 *       <BaseDialog isOpen={isOpen} onClose={close} title="My Dialog">
 *         Content here
 *       </BaseDialog>
 *     </>
 *   )
 * }
 */
export function useDialog(initialState = false) {
  const [isOpen, setIsOpen] = React.useState(initialState)

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  }
}
