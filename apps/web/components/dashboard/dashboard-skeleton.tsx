import { cn } from "@/lib/utils"

function Sk({ className }: Readonly<{ className?: string }>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />
}

export function ActivitySkeleton() {
  return (
    <div className="min-h-0 flex-1 divide-y overflow-hidden">
      {["a", "b", "c", "d", "e", "f"].map((k) => (
        <div key={k} className="flex items-start gap-3 px-4 py-3">
          <Sk className="h-6 w-6 shrink-0 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Sk className="h-4 w-3/4" />
            <Sk className="h-3 w-20" />
          </div>
          <Sk className="h-4 w-4 rounded-full" />
        </div>
      ))}
    </div>
  )
}

export function DeadlinesSkeleton() {
  return (
    <div className="divide-y">
      {["a", "b", "c"].map((k) => (
        <div key={k} className="flex items-center justify-between px-4 py-3">
          <div className="space-y-1.5">
            <Sk className="h-4 w-32" />
            <Sk className="h-3 w-16" />
          </div>
          <Sk className="h-3 w-12" />
        </div>
      ))}
    </div>
  )
}

export function HighPrioritySkeleton() {
  return (
    <div className="divide-y">
      {["a", "b", "c"].map((k) => (
        <div key={k} className="flex items-center gap-3 px-4 py-3">
          <Sk className="h-3.5 w-3.5 shrink-0 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Sk className="h-4 w-full" />
            <Sk className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ProjectSummarySkeleton() {
  return (
    <div className="divide-y">
      {["a", "b", "c", "d"].map((k) => (
        <div key={k} className="flex items-center gap-4 px-4 py-3">
          <div className="flex-1 space-y-1.5">
            <Sk className="h-4 w-40" />
            <Sk className="h-3 w-48" />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Sk className="h-1.5 w-24 rounded-full" />
            <Sk className="h-3 w-8" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function TeamWorkloadSkeleton() {
  return (
    <tbody className="divide-y">
      {["a", "b", "c", "d"].map((k) => (
        <tr key={k}>
          <td className="px-4 py-3">
            <div className="flex items-center gap-2">
              <Sk className="h-7 w-7 rounded-full" />
              <Sk className="h-4 w-24" />
            </div>
          </td>
          <td className="px-4 py-3">
            <Sk className="h-5 w-20 rounded-full" />
          </td>
          {["a", "b", "c"].map((j) => (
            <td key={j} className="px-4 py-3 text-center">
              <Sk className="mx-auto h-4 w-6" />
            </td>
          ))}
          <td className="px-4 py-3">
            <Sk className="h-1.5 w-32 rounded-full" />
          </td>
        </tr>
      ))}
    </tbody>
  )
}
