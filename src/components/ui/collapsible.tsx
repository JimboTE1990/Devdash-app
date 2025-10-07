import * as React from 'react'
import { cn } from '@/lib/utils'

interface CollapsibleProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

const CollapsibleContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>({
  open: false,
  onOpenChange: () => {},
})

const Collapsible: React.FC<CollapsibleProps> = ({
  open: controlledOpen,
  onOpenChange,
  children,
  className,
}) => {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = controlledOpen ?? internalOpen
  const handleOpenChange = onOpenChange ?? setInternalOpen

  return (
    <CollapsibleContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      <div className={className}>{children}</div>
    </CollapsibleContext.Provider>
  )
}

const CollapsibleTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const { open, onOpenChange } = React.useContext(CollapsibleContext)

  return (
    <button
      ref={ref}
      className={className}
      onClick={() => onOpenChange(!open)}
      {...props}
    >
      {children}
    </button>
  )
})
CollapsibleTrigger.displayName = 'CollapsibleTrigger'

const CollapsibleContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { open } = React.useContext(CollapsibleContext)

  if (!open) return null

  return (
    <div
      ref={ref}
      className={cn('overflow-hidden', className)}
      {...props}
    >
      {children}
    </div>
  )
})
CollapsibleContent.displayName = 'CollapsibleContent'

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
