import type { ProjectSummary } from "./project.types"
import type { Workload } from "./user.types"

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

export interface AnalyticsDashboard {
  kpis: {
    totalProjects: number
    totalTasks: number
    completedTasks: number
    pendingTasks: number
    overdueTasks: number
    inProgressTasks: number
  }
  tasksByPriority: { high: number; medium: number; low: number }
  tasksByStatus: { todo: number; inProgress: number; completed: number }
  projectProgress: ProjectSummary[]
  teamProductivity: Workload[]
}
