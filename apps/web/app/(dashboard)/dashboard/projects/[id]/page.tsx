"use client"

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { DroppableColumn } from "@/components/projects/droppable-column"
import { ManageMembersDialog } from "@/components/projects/manage-members-dialog"
import { ProjectStatusBadge } from "@/components/projects/project-status-badge"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { ProjectDetailSkeleton } from "@/components/shared/skeletons"
import { DraggableTaskCard } from "@/components/tasks/draggable-task-card"
import { TaskCard } from "@/components/tasks/task-card"
import { TaskDetailSheet } from "@/components/tasks/task-detail-sheet"
import { TaskForm } from "@/components/tasks/task-form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useHasPermission } from "@/hooks/use-has-permission"
import { toastError, toastSuccess } from "@/lib/toast"
import { cn, formatDate, isOverdue } from "@/lib/utils"
import { useGetProjectQuery } from "@/store/api/projects-api"
import {
  useDeleteTaskMutation,
  useGetTasksQuery,
  useUpdateTaskStatusMutation,
} from "@/store/api/tasks-api"
import type { Task, TaskStatus } from "@/types"
import { CheckSquare, Plus, Users } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

interface PageUi {
  taskFormOpen: boolean
  editTask: Task | undefined
  deleteId: string | null
  detailTaskId: string | null
  membersOpen: boolean
}

const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: "TODO", label: "Todo" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "COMPLETED", label: "Completed" },
]

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const canManage = useHasPermission("ADMIN", "PROJECT_MANAGER")

  const { data: project, isLoading } = useGetProjectQuery(id)
  const { data: tasksData } = useGetTasksQuery({ projectId: id, limit: 100 })
  const [updateStatus] = useUpdateTaskStatusMutation()
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation()

  const [ui, setUi] = useState<PageUi>({
    taskFormOpen: false,
    editTask: undefined,
    deleteId: null,
    detailTaskId: null,
    membersOpen: false,
  })
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [mobileTab, setMobileTab] = useState<TaskStatus>("TODO")

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const openCreate = () =>
    setUi((prev) => ({ ...prev, taskFormOpen: true, editTask: undefined }))
  const openEdit = (t: Task) =>
    setUi((prev) => ({ ...prev, taskFormOpen: true, editTask: t }))
  const closeForm = () => setUi((prev) => ({ ...prev, taskFormOpen: false }))

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      await updateStatus({ id: taskId, status }).unwrap()
      toastSuccess(`Task marked as ${status.toLowerCase().replace("_", " ")}`)
    } catch (err) {
      toastError(err, "Failed to update status")
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const task = (tasksData?.items ?? []).find((t) => t.id === event.active.id)
    setActiveTask(task ?? null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)
    if (!over) return
    const newStatus = over.id as TaskStatus
    const task = (tasksData?.items ?? []).find((t) => t.id === active.id)
    if (task && task.status !== newStatus) {
      handleStatusChange(String(active.id), newStatus)
    }
  }

  const requestDelete = (tid: string) =>
    setUi((prev) => ({ ...prev, deleteId: tid }))
  const openDetail = (tid: string) =>
    setUi((prev) => ({ ...prev, detailTaskId: tid }))

  const handleDeleteTask = async () => {
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

  if (isLoading) return <ProjectDetailSkeleton />

  if (!project) {
    return (
      <EmptyState
        icon={CheckSquare}
        title="Project not found"
        action={
          <Button
            variant="link"
            onClick={() => router.push("/dashboard/projects")}
            className="h-auto p-0 text-sm"
          >
            Back to projects
          </Button>
        }
      />
    )
  }

  const tasks = tasksData?.items ?? []
  const byStatus = {
    TODO: tasks.filter((t) => t.status === "TODO"),
    IN_PROGRESS: tasks.filter((t) => t.status === "IN_PROGRESS"),
    COMPLETED: tasks.filter((t) => t.status === "COMPLETED"),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold leading-tight">{project.name}</h1>
            <ProjectStatusBadge status={project.status} />
          </div>
          {project.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {project.deadline && (
              <span
                className={
                  isOverdue(project.deadline) && project.status !== "COMPLETED"
                    ? "text-destructive"
                    : ""
                }
              >
                Due {formatDate(project.deadline)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {project.members.length} member{project.members.length === 1 ? "" : "s"}
            </span>
            <span>{tasks.length} task{tasks.length === 1 ? "" : "s"}</span>
          </div>
        </div>
        {canManage && (
          <div className="flex shrink-0 gap-2">
            <Button
              variant="outline"
              onClick={() => setUi((prev) => ({ ...prev, membersOpen: true }))}
            >
              <Users className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Members</span>
            </Button>
            <Button onClick={openCreate}>
              <Plus className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Add task</span>
            </Button>
          </div>
        )}
      </div>

      <div className="md:hidden">
        <div className="flex gap-1 rounded-lg border bg-muted/40 p-1">
          {COLUMNS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setMobileTab(key)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                mobileTab === key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                  mobileTab === key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {byStatus[key].length}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-3 space-y-2">
          {byStatus[mobileTab].length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No tasks
            </div>
          ) : (
            byStatus[mobileTab].map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                canManage={canManage}
                onStatusChange={handleStatusChange}
                onEdit={openEdit}
                onDelete={requestDelete}
                onOpen={openDetail}
              />
            ))
          )}
        </div>
      </div>

      <div className="hidden md:block">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-3 gap-4">
            {COLUMNS.map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">{label}</h3>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {byStatus[key].length}
                  </span>
                </div>
                <DroppableColumn id={key}>
                  {byStatus[key].map((task) => (
                    <DraggableTaskCard
                      key={task.id}
                      task={task}
                      isDragActive={!!activeTask}
                      canManage={canManage}
                      onStatusChange={handleStatusChange}
                      onEdit={openEdit}
                      onDelete={requestDelete}
                      onOpen={openDetail}
                    />
                  ))}
                  {byStatus[key].length === 0 && !activeTask && (
                    <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                      No tasks
                    </div>
                  )}
                </DroppableColumn>
              </div>
            ))}
          </div>

          <DragOverlay>
            {activeTask && (
              <div className="rotate-1 opacity-95 shadow-xl">
                <TaskCard
                  task={activeTask}
                  canManage={canManage}
                  onStatusChange={handleStatusChange}
                  onEdit={openEdit}
                  onDelete={requestDelete}
                  onOpen={openDetail}
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      <Dialog open={ui.taskFormOpen} onOpenChange={(o) => !o && closeForm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ui.editTask ? "Edit task" : "Add task"}</DialogTitle>
          </DialogHeader>
          <TaskForm
            task={ui.editTask}
            project={project}
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
        description="This will permanently delete the task and its comments."
        confirmLabel="Delete"
        destructive
        loading={isDeleting}
        onConfirm={handleDeleteTask}
      />

      <TaskDetailSheet
        taskId={ui.detailTaskId}
        onClose={() => setUi((prev) => ({ ...prev, detailTaskId: null }))}
      />

      <ManageMembersDialog
        open={ui.membersOpen}
        onOpenChange={(o) => setUi((prev) => ({ ...prev, membersOpen: o }))}
        project={project}
      />
    </div>
  )
}
