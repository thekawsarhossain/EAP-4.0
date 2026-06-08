import { TasksView } from "@/components/tasks/tasks-view"
import { Suspense } from "react"

export default function TasksPage() {
  return (
    <Suspense>
      <TasksView />
    </Suspense>
  )
}
