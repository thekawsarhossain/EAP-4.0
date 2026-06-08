"use client"

import { ActivityIcon } from "@/components/dashboard/activity-icon"
import {
  ActivitySkeleton,
  DeadlinesSkeleton,
  HighPrioritySkeleton,
  ProjectSummarySkeleton,
  TeamWorkloadSkeleton,
} from "@/components/dashboard/dashboard-skeleton"
import { WorkloadRow } from "@/components/dashboard/workload-row"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { cn, formatDate, isOverdue, timeAgo } from "@/lib/utils"
import { useGetActivityQuery } from "@/store/api/activity-api"
import { useGetProjectsQuery } from "@/store/api/projects-api"
import { useGetTaskStatsQuery, useGetTasksQuery } from "@/store/api/tasks-api"
import { useGetUsersQuery } from "@/store/api/users-api"
import { resetTaskFilters, setTaskFilter } from "@/store/slices/filter.slice"
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock,
  FolderKanban,
  ListTodo,
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { data: taskStats, isLoading: statsLoading } = useGetTaskStatsQuery()
  const { data: projects, isLoading: projectsLoading } = useGetProjectsQuery({
    limit: 5,
    sort: "deadline_asc",
  })
  const { data: highPriorityTasks, isLoading: tasksLoading } = useGetTasksQuery(
    { priority: "HIGH", status: "TODO", limit: 5 }
  )
  const { data: activity, isLoading: activityLoading } = useGetActivityQuery({
    limit: 8,
  })
  const { data: users = [], isLoading: usersLoading } = useGetUsersQuery({})

  const dispatch = useAppDispatch()
  const kpiLoading = statsLoading || projectsLoading

  const KPIS = [
    {
      label: "Total Projects",
      value: projects?.total ?? 0,
      icon: FolderKanban,
      href: "/dashboard/projects",
      color: "text-primary",
      bg: "bg-primary/10",
      onNavigate: undefined,
    },
    {
      label: "Total Tasks",
      value: taskStats?.total ?? 0,
      icon: ListTodo,
      href: "/dashboard/tasks",
      color: "text-violet-500",
      bg: "bg-violet-500/10",
      onNavigate: () => dispatch(resetTaskFilters()),
    },
    {
      label: "Completed",
      value: taskStats?.completed ?? 0,
      icon: CheckCircle2,
      href: "/dashboard/tasks?status=COMPLETED",
      color: "text-green-500",
      bg: "bg-green-500/10",
      onNavigate: () => dispatch(setTaskFilter({ status: "COMPLETED", deadlineStatus: "", priority: "", assignedToId: "" })),
    },
    {
      label: "Pending",
      value: taskStats?.pending ?? 0,
      icon: Clock,
      href: "/dashboard/tasks",
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      onNavigate: () => dispatch(setTaskFilter({ status: "", deadlineStatus: "", priority: "", assignedToId: "" })),
    },
    {
      label: "Overdue",
      value: taskStats?.overdue ?? 0,
      icon: AlertTriangle,
      href: "/dashboard/tasks?deadlineStatus=overdue",
      color: "text-destructive",
      bg: "bg-destructive/10",
      onNavigate: () => dispatch(setTaskFilter({ deadlineStatus: "overdue", status: "", priority: "", assignedToId: "" })),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {KPIS.map(({ label, value, icon: Icon, href, color, bg, onNavigate }, idx) => (
          <Link
            key={label}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex min-h-[90px] flex-col rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md",
              idx === KPIS.length - 1 && KPIS.length % 2 !== 0 && "col-span-2 sm:col-span-1",
              kpiLoading && "animate-pulse"
            )}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-semibold">{value}</p>
                <p className="mt-auto pt-2 text-right text-sm text-muted-foreground">
                  {label}
                </p>
              </div>
              <div className={`rounded-lg p-2 ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex h-full flex-col rounded-xl border bg-card shadow-sm">
            <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
              <h2 className="text-sm font-medium">Recent Activity</h2>
              {/* <span className="text-xs text-muted-foreground">
                {activity?.length ?? 0} events
              </span> */}
            </div>
            {activityLoading ? (
              <ActivitySkeleton />
            ) : (
              <div className="min-h-0 flex-1 divide-y overflow-y-auto">
                {activity?.length ? (
                  activity.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 px-4 py-3"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                        {log.user.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{log.user.name}</span>{" "}
                          <span className="text-muted-foreground">
                            {log.action}
                          </span>{" "}
                          {log.entityName && (
                            <span className="font-medium">
                              &ldquo;{log.entityName}&rdquo;
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {timeAgo(log.createdAt)}
                        </p>
                      </div>
                      <ActivityIcon action={log.action} />
                    </div>
                  ))
                ) : (
                  <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No activity yet
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-sm font-medium">Upcoming Deadlines</h2>
            </div>
            {projectsLoading ? (
              <DeadlinesSkeleton />
            ) : (
              <div className="divide-y">
                {projects?.items.filter(
                  (p) => p.deadline && p.status !== "COMPLETED"
                ).length ? (
                  projects.items
                    .filter((p) => p.deadline && p.status !== "COMPLETED")
                    .slice(0, 5)
                    .map((p) => (
                      <Link
                        key={p.id}
                        href={`/dashboard/projects/${p.id}`}
                        className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted/30"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {p._count.tasks} tasks
                          </p>
                        </div>
                        <span
                          className={`shrink-0 text-xs font-medium ${
                            isOverdue(p.deadline)
                              ? "text-destructive"
                              : "text-muted-foreground"
                          }`}
                        >
                          {formatDate(p.deadline, "MMM d")}
                        </span>
                      </Link>
                    ))
                ) : (
                  <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No upcoming deadlines
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="rounded-xl border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-sm font-medium">High Priority Tasks</h2>
            </div>
            {tasksLoading ? (
              <HighPrioritySkeleton />
            ) : (
              <div className="divide-y">
                {highPriorityTasks?.items.length ? (
                  highPriorityTasks.items.slice(0, 5).map((t) => (
                    <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                      <Circle className="h-3.5 w-3.5 shrink-0 text-destructive" />
                      <div className="min-w-0">
                        <p className="truncate text-sm">{t.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.project.name}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No high priority tasks
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-medium">Project Summary</h2>
          <Link
            href="/dashboard/projects"
            className="text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            View all
          </Link>
        </div>
        {projectsLoading ? (
          <ProjectSummarySkeleton />
        ) : (
          <div className="divide-y">
            {projects?.items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                No projects yet
              </p>
            ) : (
              projects?.items.map((p) => (
                <Link
                  key={p.id}
                  href={`/dashboard/projects/${p.id}`}
                  className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/30"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.completedCount} done · {p.pendingCount} pending
                      {p.deadline && (
                        <span
                          className={
                            isOverdue(p.deadline) && p.status !== "COMPLETED"
                              ? "· text-destructive"
                              : ""
                          }
                        >
                          {" "}
                          ·{" "}
                          {isOverdue(p.deadline) && p.status !== "COMPLETED"
                            ? "Overdue"
                            : `Due ${formatDate(p.deadline, "MMM d")}`}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <div className="h-1.5 w-24 rounded-full bg-muted">
                      <div
                        className="h-1.5 rounded-full bg-primary transition-all"
                        style={{ width: `${p.completionPct}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs text-muted-foreground">
                      {p.completionPct}%
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b px-4 py-3">
          <h2 className="text-sm font-medium">Team Workload</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                  Member
                </th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                  Role
                </th>
                <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">
                  Total
                </th>
                <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">
                  Done
                </th>
                <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">
                  Pending
                </th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                  Progress
                </th>
              </tr>
            </thead>
            {usersLoading ? (
              <TeamWorkloadSkeleton />
            ) : (
              <tbody className="divide-y">
                {users.slice(0, 6).map((u) => (
                  <WorkloadRow
                    key={u.id}
                    userId={u.id}
                    name={u.name}
                    role={u.role}
                  />
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}
