import type { User } from "./user.types"
import type { Project } from "./project.types"

export type Priority = "HIGH" | "MEDIUM" | "LOW"
export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED"

export interface Task {
  id: string
  title: string
  description: string | null
  projectId: string
  assignedToId: string | null
  createdById: string
  dueDate: string | null
  priority: Priority
  status: TaskStatus
  createdAt: string
  updatedAt: string
  assignedTo: Pick<User, "id" | "name" | "avatar"> | null
  createdBy: Pick<User, "id" | "name">
  project: Pick<Project, "id" | "name">
  _count: { comments: number; attachments: number }
}

export interface Comment {
  id: string
  taskId: string
  userId: string
  content: string
  createdAt: string
  updatedAt: string
  user: Pick<User, "id" | "name" | "avatar">
}

export interface Attachment {
  id: string
  taskId: string
  fileName: string
  url: string
  size: number
  mimeType: string | null
  createdAt: string
}

export interface TaskStats {
  total: number
  completed: number
  inProgress: number
  pending: number
  overdue: number
}
