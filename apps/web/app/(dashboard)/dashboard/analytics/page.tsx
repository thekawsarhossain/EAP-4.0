"use client"

import { AnalyticsSkeleton } from "@/components/analytics/analytics-skeleton"
import { GRID_STROKE, PRIORITY_COLORS, STATUS_COLORS, TICK } from "@/components/analytics/chart-config"
import { DonutLegend } from "@/components/analytics/donut-legend"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { useGetAnalyticsDashboardQuery } from "@/store/api/analytics-api"
import type { User } from "@/types"
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FolderKanban,
  ListTodo,
  Timer,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"

export default function AnalyticsPage() {
  const { data, isLoading } = useGetAnalyticsDashboardQuery()

  if (isLoading) return <AnalyticsSkeleton />

  const priorityData = [
    { name: "High", value: data?.tasksByPriority.high ?? 0, fill: PRIORITY_COLORS.High },
    { name: "Medium", value: data?.tasksByPriority.medium ?? 0, fill: PRIORITY_COLORS.Medium },
    { name: "Low", value: data?.tasksByPriority.low ?? 0, fill: PRIORITY_COLORS.Low },
  ]

  const statusData = [
    { name: "Todo", value: data?.tasksByStatus.todo ?? 0, fill: STATUS_COLORS.Todo },
    { name: "In Progress", value: data?.tasksByStatus.inProgress ?? 0, fill: STATUS_COLORS["In Progress"] },
    { name: "Completed", value: data?.tasksByStatus.completed ?? 0, fill: STATUS_COLORS.Completed },
  ]

  const projectBarData = (data?.projectProgress ?? []).slice(0, 8).map((p) => ({
    name: p.name.length > 14 ? `${p.name.slice(0, 13)}…` : p.name,
    Completed: p.completed,
    Pending: p.pending,
  }))

  const progressLineData = (data?.projectProgress ?? []).slice(0, 8).map((p) => ({
    name: p.name.length > 14 ? `${p.name.slice(0, 13)}…` : p.name,
    Completion: p.completionPct,
  }))

  const productivityData = (data?.teamProductivity ?? []).map((item) => ({
    name: (item.user as User).name.split(" ")[0],
    Completed: item.completed,
    "In Progress": item.inProgress,
    Pending: item.pending,
  }))

  const kpis = [
    { label: "Total Projects", value: data?.kpis.totalProjects ?? 0, icon: FolderKanban, bg: "bg-primary/10", color: "text-primary" },
    { label: "Total Tasks", value: data?.kpis.totalTasks ?? 0, icon: ListTodo, bg: "bg-violet-500/10", color: "text-violet-500" },
    { label: "Completed", value: data?.kpis.completedTasks ?? 0, icon: CheckCircle2, bg: "bg-green-500/10", color: "text-green-500" },
    { label: "In Progress", value: data?.kpis.inProgressTasks ?? 0, icon: Timer, bg: "bg-blue-500/10", color: "text-blue-500" },
    { label: "Pending", value: data?.kpis.pendingTasks ?? 0, icon: Clock, bg: "bg-orange-500/10", color: "text-orange-500" },
    { label: "Overdue", value: data?.kpis.overdueTasks ?? 0, icon: AlertTriangle, bg: "bg-destructive/10", color: "text-destructive" },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {kpis.map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="flex flex-col rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-semibold tabular-nums">{value}</p>
                <p className="mt-3 text-sm text-muted-foreground">{label}</p>
              </div>
              <div className={cn("rounded-lg p-2", bg)}>
                <Icon className={cn("h-5 w-5", color)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold">Tasks by Priority</h2>
          <ChartContainer
            config={{ value: { label: "Tasks", color: "var(--chart-1)" } }}
            className="mt-2 h-44 w-full aspect-auto"
          >
            <PieChart>
              <Pie
                data={priorityData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={72}
                strokeWidth={2}
                stroke="var(--card)"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
          <DonutLegend items={priorityData} />
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold">Task Status Distribution</h2>
          <ChartContainer
            config={{ value: { label: "Tasks", color: "var(--chart-1)" } }}
            className="mt-2 h-44 w-full aspect-auto"
          >
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={72}
                strokeWidth={2}
                stroke="var(--card)"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
          <DonutLegend items={statusData} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold">Tasks per Project</h2>
          <ChartContainer
            config={{
              Completed: { label: "Completed", color: "var(--chart-2)" },
              Pending: { label: "Pending", color: "var(--muted-foreground)" },
            }}
            className="aspect-auto h-56 w-full"
          >
            <BarChart
              data={projectBarData}
              margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
              barCategoryGap="30%"
              barGap={2}
            >
              <CartesianGrid vertical={false} stroke={GRID_STROKE} />
              <XAxis dataKey="name" tick={TICK} axisLine={false} tickLine={false} />
              <YAxis tick={TICK} axisLine={false} tickLine={false} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="Completed" fill="var(--chart-2)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Pending" fill="var(--muted-foreground)" radius={[3, 3, 0, 0]} opacity={0.4} />
            </BarChart>
          </ChartContainer>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold">Project Completion Rate</h2>
          <ChartContainer
            config={{
              Completion: { label: "Completion %", color: "var(--chart-1)" },
            }}
            className="aspect-auto h-56 w-full"
          >
            <LineChart
              data={progressLineData}
              margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
            >
              <CartesianGrid vertical={false} stroke={GRID_STROKE} />
              <XAxis dataKey="name" tick={TICK} axisLine={false} tickLine={false} />
              <YAxis tick={TICK} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="Completion"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={{ r: 4, fill: "var(--chart-1)", strokeWidth: 0 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold">Team Productivity</h2>
        {productivityData.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No team data available</p>
        ) : (
          <ChartContainer
            config={{
              Completed: { label: "Completed", color: "var(--chart-2)" },
              "In Progress": { label: "In Progress", color: "var(--chart-1)" },
              Pending: { label: "Pending", color: "var(--muted-foreground)" },
            }}
            className="aspect-auto w-full"
            style={{ height: Math.max(160, productivityData.length * 48) }}
          >
            <BarChart
              data={productivityData}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 4, bottom: 0 }}
              barCategoryGap="30%"
            >
              <CartesianGrid horizontal={false} stroke={GRID_STROKE} />
              <XAxis type="number" tick={TICK} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={TICK} axisLine={false} tickLine={false} width={72} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="Completed" stackId="a" fill="var(--chart-2)" />
              <Bar dataKey="In Progress" stackId="a" fill="var(--chart-1)" />
              <Bar dataKey="Pending" stackId="a" fill="var(--muted-foreground)" opacity={0.4} radius={[0, 3, 3, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </div>
    </div>
  )
}
