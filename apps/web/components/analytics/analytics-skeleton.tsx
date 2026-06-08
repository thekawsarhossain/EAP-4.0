import { cn } from "@/lib/utils"

function Sk({ className }: Readonly<{ className?: string }>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />
}

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {["a", "b", "c", "d", "e", "f"].map((k) => (
          <div key={k} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <Sk className="h-7 w-10" />
              <Sk className="h-9 w-9 rounded-lg" />
            </div>
            <Sk className="mt-3 h-3.5 w-24" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {["a", "b"].map((k) => (
          <div key={k} className="rounded-xl border bg-card p-5 shadow-sm">
            <Sk className="mb-5 h-4 w-36" />
            <Sk className="mx-auto h-44 w-44 rounded-full" />
            <div className="mt-5 space-y-2">
              {["a", "b", "c"].map((j) => (
                <div key={j} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sk className="h-2.5 w-2.5 rounded-full" />
                    <Sk className="h-3 w-20" />
                  </div>
                  <Sk className="h-3 w-12" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <Sk className="mb-5 h-4 w-36" />
        <Sk className="h-52 w-full" />
      </div>
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <Sk className="mb-5 h-4 w-36" />
        <Sk className="h-52 w-full" />
      </div>
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <Sk className="mb-5 h-4 w-36" />
        <div className="animate-pulse rounded-md bg-muted w-full" style={{ height: 160 }} />
      </div>
    </div>
  )
}
