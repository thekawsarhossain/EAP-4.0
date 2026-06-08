import type { User } from "./user.types"

export type ProjectStatus = "ACTIVE" | "COMPLETED" | "ON_HOLD"

export interface ProjectMember {
  projectId: string
  userId: string
  joinedAt: string
  user: Pick<User, "id" | "name" | "email" | "avatar" | "role">
}

export interface Project {
  id: string
  name: string
  description: string | null
  deadline: string | null
  status: ProjectStatus
  createdById: string
  createdAt: string
  updatedAt: string
  members: ProjectMember[]
  tasks?: Array<{ status: string }>
  _count: { tasks: number }
  completedCount: number
  pendingCount: number
  completionPct: number
}

export interface ProjectSummary {
  id: string
  name: string
  status: ProjectStatus
  deadline: string | null
  total: number
  completed: number
  pending: number
  completionPct: number
}
