import type { Role } from "./auth.types"

export interface User {
  id: string
  name: string
  email: string
  role: Role
  avatar: string | null
  createdAt: string
}

export interface Workload {
  user: User
  total: number
  completed: number
  inProgress: number
  pending: number
  overdue: number
  completionPct: number
}
