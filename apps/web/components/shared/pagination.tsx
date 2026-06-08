"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  page: number
  total: number
  limit: number
  onChange: (page: number) => void
  className?: string
}

export function Pagination({
  page,
  total,
  limit,
  onChange,
  className,
}: Readonly<PaginationProps>) {
  const totalPages = Math.ceil(total / limit)
  if (totalPages <= 1) return null

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <p className="text-xs text-muted-foreground">
        {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total}
      </p>
      <Button
        variant="outline"
        size="icon"
        className="h-7 w-7"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </Button>
      <span className="text-sm">
        {page} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="icon"
        className="h-7 w-7"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
