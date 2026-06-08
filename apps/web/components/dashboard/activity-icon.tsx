import { AlertTriangle, CheckCircle2, Clock } from "lucide-react"

export function ActivityIcon({ action }: Readonly<{ action: string }>) {
  if (action === "completed")
    return <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
  if (action === "deleted")
    return <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-destructive" />
  return <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
}
