"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDate, isOverdue } from "@/lib/utils"
import type { Task, TaskStatus } from "@/types"
import { MoreHorizontal } from "lucide-react"
import { TaskPriorityBadge } from "./task-priority-badge"

interface TaskCardProps {
  task: Task
  canManage: boolean
  onStatusChange: (id: string, status: TaskStatus) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onOpen: (id: string) => void
}

const NEXT_STATUS: Record<TaskStatus, TaskStatus | null> = {
  TODO: "IN_PROGRESS",
  IN_PROGRESS: "COMPLETED",
  COMPLETED: null,
}

export function TaskCard({
  task,
  canManage,
  onStatusChange,
  onEdit,
  onDelete,
  onOpen,
}: Readonly<TaskCardProps>) {
  const next = NEXT_STATUS[task.status]

  return (
    <div className="group rounded-lg border bg-card p-3 shadow-sm">
      <div className="flex items-start justify-between gap-1">
        <Button
          variant="ghost"
          onClick={() => onOpen(task.id)}
          className="h-auto flex-1 justify-start p-0 text-left text-sm leading-tight font-medium hover:bg-transparent hover:underline"
        >
          {task.title}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-accent">
            <MoreHorizontal className="h-3 w-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {next && (
              <DropdownMenuItem
                onClick={() => onStatusChange(task.id, next as TaskStatus)}
              >
                Mark as {next.replace("_", " ").toLowerCase()}
              </DropdownMenuItem>
            )}
            {canManage && (
              <>
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete(task.id)}
                >
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <TaskPriorityBadge priority={task.priority} />
        {task.dueDate && (
          <span
            className={`text-[11px] ${
              isOverdue(task.dueDate) && task.status !== "COMPLETED"
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            {formatDate(task.dueDate, "MMM d")}
          </span>
        )}
      </div>

      {task.assignedTo && (
        <div className="mt-2 flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] font-medium text-primary-foreground">
            {task.assignedTo.name.charAt(0).toUpperCase()}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {task.assignedTo.name}
          </span>
        </div>
      )}
    </div>
  )
}
