"use client"

import { useGetUserWorkloadQuery } from "@/store/api/users-api"

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  PROJECT_MANAGER: "PM",
  TEAM_MEMBER: "Member",
}

interface WorkloadRowProps {
  userId: string
  name: string
  role: string
}

export function WorkloadRow({
  userId,
  name,
  role,
}: Readonly<WorkloadRowProps>) {
  const { data: wl } = useGetUserWorkloadQuery(userId)
  const rate = wl?.total ? Math.round((wl.completed / wl.total) * 100) : 0

  return (
    <tr className="transition-colors hover:bg-muted/30">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
            {name.charAt(0).toUpperCase()}
          </span>
          <span className="font-medium">{name}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-muted-foreground">
        {ROLE_LABEL[role] ?? role}
      </td>
      <td className="px-4 py-3 text-center">{wl?.total ?? 0}</td>
      <td className="px-4 py-3 text-center text-green-600 dark:text-green-400">
        {wl?.completed ?? 0}
      </td>
      <td className="px-4 py-3 text-center text-muted-foreground">
        {wl?.pending ?? 0}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 rounded-full bg-muted">
            <div
              className="h-1.5 rounded-full bg-primary transition-all"
              style={{ width: `${rate}%` }}
            />
          </div>
          <span className="w-8 text-xs text-muted-foreground">{rate}%</span>
        </div>
      </td>
    </tr>
  )
}
