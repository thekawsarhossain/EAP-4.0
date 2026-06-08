"use client"

import { useGetUserWorkloadQuery } from "@/store/api/users-api"
import { MemberCardStatsSkeleton } from "@/components/shared/skeletons"
import type { User } from "@/types"

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  PROJECT_MANAGER: "Project Manager",
  TEAM_MEMBER: "Team Member",
}

interface MemberCardProps {
  user: User
}

export function MemberCard({ user }: Readonly<MemberCardProps>) {
  const { data: workload, isLoading: isWorkloadLoading } = useGetUserWorkloadQuery(user.id)

  const rate = workload?.total
    ? Math.round((workload.completed / workload.total) * 100)
    : 0

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
          {user.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="mt-3">
        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {ROLE_LABEL[user.role]}
        </span>
      </div>

      {isWorkloadLoading && <MemberCardStatsSkeleton />}
      {workload && (
        <div className="mt-3 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{workload.total} tasks total</span>
            <span>{rate}% done</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted">
            <div
              className="h-1.5 rounded-full bg-primary transition-all"
              style={{ width: `${rate}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-1 text-center text-xs">
            <div>
              <p className="font-medium">{workload.completed}</p>
              <p className="text-muted-foreground">Done</p>
            </div>
            <div>
              <p className="font-medium">{workload.inProgress}</p>
              <p className="text-muted-foreground">Active</p>
            </div>
            <div>
              <p className="font-medium text-destructive">{workload.overdue}</p>
              <p className="text-muted-foreground">Overdue</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
