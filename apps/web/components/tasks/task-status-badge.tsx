import { cn } from "@/lib/utils"
import type { TaskStatus } from "@/types"

const config: Record<TaskStatus, { label: string; className: string }> = {
  TODO: { label: "Todo", className: "bg-muted text-muted-foreground" },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-primary/10 text-primary",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-green-500/10 text-green-600 dark:text-green-400",
  },
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const { label, className } = config[status]
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        className
      )}
    >
      {label}
    </span>
  )
}
