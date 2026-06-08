"use client"

import type { Role } from "@/types"
import { useSession } from "next-auth/react"

export function useHasPermission(...roles: Role[]) {
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role as Role | undefined
  if (!userRole) return false
  return roles.includes(userRole)
}
