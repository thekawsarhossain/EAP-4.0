import { cn } from "@/lib/utils"
import { LoaderIcon } from "lucide-react"

export function Spinner({ className, ...props }: Readonly<React.ComponentProps<"svg">>) {
  return (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}
