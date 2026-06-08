"use client"

import {
  TASK_DEADLINE_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_SORT_LABELS,
  TASK_STATUS_LABELS,
} from "@/lib/filter-labels"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { Pagination } from "@/components/shared/pagination"
import { TableSkeleton } from "@/components/shared/skeletons"
import { SearchInput } from "@/components/shared/search-input"
import { TaskDetailSheet } from "@/components/tasks/task-detail-sheet"
import { TaskForm } from "@/components/tasks/task-form"
import { TaskPriorityBadge } from "@/components/tasks/task-priority-badge"
import { TaskStatusBadge } from "@/components/tasks/task-status-badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useDebounce } from "@/hooks/use-debounce"
import { useHasPermission } from "@/hooks/use-has-permission"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"
import type { RootState } from "@/store"
import { Spinner } from "@/components/ui/spinner"
import { toastError, toastSuccess } from "@/lib/toast"
import { cn, formatDate, isOverdue } from "@/lib/utils"
import { useGetProjectsQuery } from "@/store/api/projects-api"
import {
  useDeleteTaskMutation,
  useGetTasksQuery,
  useUpdateTaskStatusMutation,
} from "@/store/api/tasks-api"
import { useGetUsersQuery } from "@/store/api/users-api"
import { resetTaskFilters, setTaskFilter } from "@/store/slices/filter.slice"
import type { Task, TaskStatus } from "@/types"
import { CheckSquare, MoreHorizontal, Plus, SlidersHorizontal } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"

interface PageUi {
  formOpen: boolean
  editTask: Task | undefined
  deleteId: string | null
  detailTaskId: string | null
  page: number
}

export function TasksView() {
  const dispatch = useAppDispatch()
  const filters = useAppSelector((s: RootState) => s.filters.tasks)
  const searchParams = useSearchParams()
  const [search, setSearch] = useState("")
  const [ui, setUi] = useState<PageUi>({
    formOpen: false,
    editTask: undefined,
    deleteId: null,
    detailTaskId: null,
    page: 1,
  })

  const applied = useRef(false)
  useEffect(() => {
    if (applied.current) return
    applied.current = true
    const status = searchParams.get("status") ?? ""
    const deadlineStatus = searchParams.get("deadlineStatus") ?? ""
    if (status || deadlineStatus) {
      dispatch(setTaskFilter({ status, deadlineStatus, priority: "", assignedToId: "" }))
    }
  }, [searchParams, dispatch])

  const debouncedSearch = useDebounce(search, 300)
  const canManage = useHasPermission("ADMIN", "PROJECT_MANAGER")

  const { data, isLoading, isFetching } = useGetTasksQuery({
    search: debouncedSearch || undefined,
    status: filters.status || undefined,
    priority: filters.priority || undefined,
    assignedToId: filters.assignedToId || undefined,
    projectId: filters.projectId || undefined,
    deadlineStatus: filters.deadlineStatus || undefined,
    sort: filters.sort,
    page: ui.page,
    limit: 15,
  })

  const { data: projects } = useGetProjectsQuery({ limit: 100 })
  const { data: users = [] } = useGetUsersQuery({})
  const [updateStatus] = useUpdateTaskStatusMutation()
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation()

  const openCreate = () =>
    setUi((prev) => ({ ...prev, formOpen: true, editTask: undefined }))
  const openEdit = (t: Task) =>
    setUi((prev) => ({ ...prev, formOpen: true, editTask: t }))
  const closeForm = () => setUi((prev) => ({ ...prev, formOpen: false }))

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    try {
      await updateStatus({ id, status }).unwrap()
      toastSuccess(`Task marked as ${status.toLowerCase().replace("_", " ")}`)
    } catch (err) {
      toastError(err, "Failed to update status")
    }
  }

  const handleDelete = async () => {
    if (!ui.deleteId) return
    try {
      await deleteTask(ui.deleteId).unwrap()
      toastSuccess("Task deleted")
    } catch (err) {
      toastError(err, "Failed to delete task")
    } finally {
      setUi((prev) => ({ ...prev, deleteId: null }))
    }
  }

  const activeFilterCount = [
    filters.status,
    filters.priority,
    filters.assignedToId,
    filters.deadlineStatus,
    filters.projectId,
    filters.sort !== "createdAt_desc" ? filters.sort : "",
  ].filter(Boolean).length

  const [filterOpen, setFilterOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search tasks..."
          className="flex-1 sm:w-64 sm:flex-none"
        />

        {/* Filter modal trigger */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFilterOpen(true)}
          className="relative"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 sm:mr-1.5" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>

        {(isFetching || search !== debouncedSearch) && (
          <Spinner className="h-4 w-4 text-primary" />
        )}

        {canManage && (
          <Button onClick={openCreate} className="ml-auto">
            <Plus className="h-3.5 w-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">New task</span>
          </Button>
        )}
      </div>

      {/* Filter modal */}
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filter Tasks</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select
                value={filters.status || "ALL"}
                onValueChange={(v) => dispatch(setTaskFilter({ status: v === "ALL" ? "" : (v ?? "") }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>{TASK_STATUS_LABELS[filters.status || "ALL"]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  <SelectItem value="TODO">Todo</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Priority</Label>
              <Select
                value={filters.priority || "ALL"}
                onValueChange={(v) => dispatch(setTaskFilter({ priority: v === "ALL" ? "" : (v ?? "") }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>{TASK_PRIORITY_LABELS[filters.priority || "ALL"]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All priorities</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Assigned to</Label>
              <Select
                value={filters.assignedToId || "ALL"}
                onValueChange={(v) => dispatch(setTaskFilter({ assignedToId: v === "ALL" ? "" : (v ?? "") }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {filters.assignedToId
                      ? (users.find((u) => u.id === filters.assignedToId)?.name ?? "Member")
                      : "All members"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All members</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Deadline</Label>
              <Select
                value={filters.deadlineStatus || "ALL"}
                onValueChange={(v) => dispatch(setTaskFilter({ deadlineStatus: v === "ALL" ? "" : (v ?? "") }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>{TASK_DEADLINE_LABELS[filters.deadlineStatus || "ALL"]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All deadlines</SelectItem>
                  <SelectItem value="upcoming">Due this week</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Project</Label>
              <Select
                value={filters.projectId || "ALL"}
                onValueChange={(v) => dispatch(setTaskFilter({ projectId: v === "ALL" ? "" : (v ?? "") }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {filters.projectId
                      ? (projects?.items.find((p) => p.id === filters.projectId)?.name ?? "Project")
                      : "All projects"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All projects</SelectItem>
                  {(projects?.items ?? []).map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Sort by</Label>
              <Select
                value={filters.sort}
                onValueChange={(v) => dispatch(setTaskFilter({ sort: v ?? "" }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>{TASK_SORT_LABELS[filters.sort]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt_desc">Latest created</SelectItem>
                  <SelectItem value="dueDate_asc">Nearest deadline</SelectItem>
                  <SelectItem value="priority_desc">Highest priority</SelectItem>
                  <SelectItem value="updatedAt_desc">Recently updated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(resetTaskFilters())}
                disabled={activeFilterCount === 0}
              >
                Clear all
              </Button>
              <Button size="sm" onClick={() => setFilterOpen(false)}>
                Apply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : (data?.items ?? []).length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks found"
          description="Adjust your filters or create a new task."
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border bg-card sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    Task
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    Project
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    Assignee
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    Priority
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    Due
                  </th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {data?.items.map((task) => (
                  <tr
                    key={task.id}
                    className={cn("group transition-colors hover:bg-muted/30", isFetching && "animate-pulse")}
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          setUi((prev) => ({
                            ...prev,
                            detailTaskId: task.id,
                          }))
                        }
                        className="text-left font-medium hover:underline"
                      >
                        {task.title}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/projects/${task.projectId}`}
                        className="text-muted-foreground hover:text-foreground hover:underline"
                      >
                        {task.project.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {task.assignedTo?.name ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <TaskPriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <TaskStatusBadge status={task.status} />
                    </td>
                    <td
                      className={`px-4 py-3 text-xs ${task.dueDate &&
                        isOverdue(task.dueDate) &&
                        task.status !== "COMPLETED"
                        ? "text-destructive"
                        : "text-muted-foreground"
                        }`}
                    >
                      {task.dueDate ? formatDate(task.dueDate, "MMM d") : "-"}
                    </td>
                    <td className="px-2 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-accent">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {task.status !== "IN_PROGRESS" &&
                            task.status !== "COMPLETED" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(task.id, "IN_PROGRESS")
                                }
                              >
                                Start
                              </DropdownMenuItem>
                            )}
                          {task.status !== "COMPLETED" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(task.id, "COMPLETED")
                              }
                            >
                              Complete
                            </DropdownMenuItem>
                          )}
                          {canManage && (
                            <>
                              <DropdownMenuItem onClick={() => openEdit(task)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() =>
                                  setUi((prev) => ({
                                    ...prev,
                                    deleteId: task.id,
                                  }))
                                }
                              >
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2 sm:hidden">
            {data?.items.map((task) => (
              <div
                key={task.id}
                className={cn("group rounded-xl border bg-card p-3 shadow-sm", isFetching && "animate-pulse")}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    onClick={() =>
                      setUi((prev) => ({ ...prev, detailTaskId: task.id }))
                    }
                    className="text-left text-sm leading-snug font-medium hover:underline"
                  >
                    {task.title}
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-accent">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {task.status !== "IN_PROGRESS" &&
                        task.status !== "COMPLETED" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(task.id, "IN_PROGRESS")
                            }
                          >
                            Start
                          </DropdownMenuItem>
                        )}
                      {task.status !== "COMPLETED" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(task.id, "COMPLETED")
                          }
                        >
                          Complete
                        </DropdownMenuItem>
                      )}
                      {canManage && (
                        <>
                          <DropdownMenuItem onClick={() => openEdit(task)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() =>
                              setUi((prev) => ({
                                ...prev,
                                deleteId: task.id,
                              }))
                            }
                          >
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {task.project.name}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <TaskPriorityBadge priority={task.priority} />
                  <TaskStatusBadge status={task.status} />
                  {task.dueDate && (
                    <span
                      className={`text-xs ${isOverdue(task.dueDate) && task.status !== "COMPLETED"
                        ? "text-destructive"
                        : "text-muted-foreground"
                        }`}
                    >
                      {formatDate(task.dueDate, "MMM d")}
                    </span>
                  )}
                </div>
                {task.assignedTo && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {task.assignedTo.name}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Pagination
              page={ui.page}
              total={data?.total ?? 0}
              limit={15}
              onChange={(p) => setUi((prev) => ({ ...prev, page: p }))}
            />
          </div>
        </>
      )}

      <Dialog open={ui.formOpen} onOpenChange={(o) => !o && closeForm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ui.editTask ? "Edit task" : "New task"}</DialogTitle>
          </DialogHeader>
          <TaskForm
            task={ui.editTask}
            projects={projects?.items}
            onSuccess={closeForm}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!ui.deleteId}
        onOpenChange={(o) =>
          !o && setUi((prev) => ({ ...prev, deleteId: null }))
        }
        title="Delete task"
        description="This will permanently delete the task."
        confirmLabel="Delete"
        destructive
        loading={isDeleting}
        onConfirm={handleDelete}
      />

      <TaskDetailSheet
        taskId={ui.detailTaskId}
        onClose={() => setUi((prev) => ({ ...prev, detailTaskId: null }))}
      />
    </div>
  )
}
