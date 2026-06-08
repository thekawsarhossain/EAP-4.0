export function DonutLegend({
  items,
}: Readonly<{ items: { name: string; value: number; fill: string }[] }>) {
  const total = items.reduce((s, i) => s + i.value, 0)
  return (
    <div className="mt-5 space-y-2.5">
      {items.map((item) => (
        <div key={item.name} className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: item.fill }}
            />
            <span className="text-muted-foreground">{item.name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-medium tabular-nums">{item.value}</span>
            {total > 0 && (
              <span className="text-xs text-muted-foreground">
                ({Math.round((item.value / total) * 100)}%)
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
