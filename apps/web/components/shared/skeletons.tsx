import { cn } from "@/lib/utils"

const KPI_SLOTS = ["kpi-revenue", "kpi-orders", "kpi-users", "kpi-growth"] as const
const WORKLOAD_STATS = ["done", "active", "overdue"] as const
const KANBAN_COLUMNS = ["col-todo", "col-in-progress", "col-done"] as const
const KANBAN_TASKS = ["task-a", "task-b"] as const

const ROW_KEYS = [
  "row-01", "row-02", "row-03", "row-04", "row-05",
  "row-06", "row-07", "row-08", "row-09", "row-10",
  "row-11", "row-12", "row-13", "row-14", "row-15",
  "row-16", "row-17", "row-18", "row-19", "row-20",
] as const

const COL_KEYS = [
  "col-01", "col-02", "col-03", "col-04", "col-05",
  "col-06", "col-07", "col-08", "col-09", "col-10",
] as const

function Skeleton({ className }: Readonly<{ className?: string }>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />
}

export function KpiCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {KPI_SLOTS.map((slot) => (
        <div key={slot} className="space-y-3 rounded-xl border bg-card p-4 shadow-sm">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  )
}

export function ProjectCardsSkeleton({ count = 6 }: Readonly<{ count?: number }>) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ROW_KEYS.slice(0, count).map((key) => (
        <div key={key} className="space-y-3 rounded-xl border bg-card p-4 shadow-sm">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <div className="flex items-center justify-between pt-1">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function TableSkeleton({
  rows = 8,
  cols = 6,
}: Readonly<{ rows?: number; cols?: number }>) {
  const headerKeys = COL_KEYS.slice(0, cols)
  const rowKeys = ROW_KEYS.slice(0, rows)

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex gap-4 border-b bg-muted/40 px-4 py-2.5">
        {headerKeys.map((key) => (
          <Skeleton key={key} className="h-4 flex-1" />
        ))}
      </div>
      {rowKeys.map((rowKey) => (
        <div key={rowKey} className="flex items-center gap-4 border-b px-4 py-3 last:border-0">
          {headerKeys.map((colKey, colIdx) => (
            <Skeleton
              key={colKey}
              className={cn("h-4 flex-1", colIdx === 0 && "flex-[2]")}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function MemberCardStatsSkeleton() {
  return (
    <div className="mt-3 space-y-2">
      <div className="flex justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-8" />
      </div>
      <Skeleton className="h-1.5 w-full rounded-full" />
      <div className="grid grid-cols-3 gap-1">
        {WORKLOAD_STATS.map((label) => (
          <div key={label} className="space-y-1 text-center">
            <Skeleton className="mx-auto h-4 w-6" />
            <Skeleton className="mx-auto h-3 w-10" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function MemberCardsSkeleton({ count = 6 }: Readonly<{ count?: number }>) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ROW_KEYS.slice(0, count).map((key) => (
        <div key={key} className="space-y-3 rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-8" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
            <div className="grid grid-cols-3 gap-1">
              {WORKLOAD_STATS.map((label) => (
                <div key={label} className="space-y-1 text-center">
                  <Skeleton className="mx-auto h-4 w-6" />
                  <Skeleton className="mx-auto h-3 w-10" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ActivityFeedSkeleton({ rows = 5 }: Readonly<{ rows?: number }>) {
  return (
    <div className="divide-y">
      {ROW_KEYS.slice(0, rows).map((key) => (
        <div key={key} className="flex items-start gap-3 px-4 py-3">
          <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ProjectDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-80" />
        <div className="flex gap-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {KANBAN_COLUMNS.map((col) => (
          <div key={col} className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-6 rounded-full" />
            </div>
            {KANBAN_TASKS.map((task) => (
              <div key={`${col}-${task}`} className="space-y-2 rounded-lg border bg-card p-3">
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-12 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
