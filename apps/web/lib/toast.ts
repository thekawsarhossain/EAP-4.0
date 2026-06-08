import { toast } from "sonner"

export function toastSuccess(message: string) {
  toast.success(message)
}

export function toastError(error: unknown, fallback = "Something went wrong") {
  const message =
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    typeof (error as any).data === "object" &&
    (error as any).data !== null &&
    "message" in (error as any).data
      ? String((error as any).data.message)
      : fallback
  toast.error(message)
}
