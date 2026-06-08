"use client"

import { useDraggable } from "@dnd-kit/core"
import { TaskCard } from "@/components/tasks/task-card"
import { cn } from "@/lib/utils"
import type { Task } from "@/types"

export function DraggableTaskCard({
  task,
  isDragActive,
  ...props
}: Readonly<{
  task: Task
  isDragActive: boolean
} & Omit<React.ComponentProps<typeof TaskCard>, "task">>) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "touch-none",
        isDragging && "opacity-40",
        isDragActive && !isDragging && "cursor-grabbing"
      )}
    >
      <TaskCard task={task} {...props} />
    </div>
  )
}
