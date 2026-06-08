import { cn } from "@/lib/utils"
import type { ProjectStatus } from "@/types"

const config: Record<ProjectStatus, { label: string; className: string }> = {
  ACTIVE: {
    label: "Active",
    className: "bg-green-500/10 text-green-600 dark:text-green-400",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-primary/10 text-primary",
  },
  ON_HOLD: {
    label: "On Hold",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
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
