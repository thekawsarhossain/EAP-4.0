import type { User } from "./user.types"

export interface ActivityLog {
  id: string
  userId: string
  action: string
  entity: string
  entityId: string
  entityName: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  user: Pick<User, "id" | "name" | "avatar">
}
