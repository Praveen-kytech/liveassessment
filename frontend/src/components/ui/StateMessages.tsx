import { FileQuestion, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
  className?: string
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 mb-4">
        {icon || <FileQuestion className="h-10 w-10 text-muted-foreground" />}
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-2 max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  )
}

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again later.",
  onRetry,
  className
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 mb-4">
        <AlertCircle className="h-10 w-10 text-destructive" />
      </div>
      <h3 className="text-xl font-semibold text-destructive">{title}</h3>
      <p className="text-muted-foreground mt-2 max-w-sm mb-6">{description}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>Try Again</Button>
      )}
    </div>
  )
}
