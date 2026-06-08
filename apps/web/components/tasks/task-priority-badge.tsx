import { cn } from "@/lib/utils"
import type { Priority } from "@/types"

const config: Record<Priority, { label: string; className: string }> = {
  HIGH: {
    label: "High",
    className: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
  MEDIUM: {
    label: "Medium",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  LOW: { label: "Low", className: "bg-muted text-muted-foreground" },
}

export function TaskPriorityBadge({ priority }: { priority: Priority }) {
  const { label, className } = config[priority]
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
