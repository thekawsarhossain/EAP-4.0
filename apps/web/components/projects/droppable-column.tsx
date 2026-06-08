"use client"

import { useDroppable } from "@dnd-kit/core"
import { cn } from "@/lib/utils"

export function DroppableColumn({
  id,
  children,
}: Readonly<{
  id: string
  children: React.ReactNode
}>) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-16 space-y-2 rounded-lg p-1 transition-colors",
        isOver && "bg-primary/5 ring-2 ring-primary/20 ring-inset"
      )}
    >
      {children}
    </div>
  )
}
