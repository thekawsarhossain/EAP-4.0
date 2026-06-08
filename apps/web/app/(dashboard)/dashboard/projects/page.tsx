"use client"

import { PROJECT_SORT_LABELS, PROJECT_STATUS_LABELS } from "@/lib/filter-labels"
import { ProjectForm } from "@/components/projects/project-form"
import { ProjectStatusBadge } from "@/components/projects/project-status-badge"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { Pagination } from "@/components/shared/pagination"
import { ProjectCardsSkeleton } from "@/components/shared/skeletons"
import { SearchInput } from "@/components/shared/search-input"
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
import { toastError, toastSuccess } from "@/lib/toast"
import { cn, formatDate, isOverdue } from "@/lib/utils"
import {
  useDeleteProjectMutation,
  useGetProjectsQuery,
} from "@/store/api/projects-api"
import { setProjectFilter } from "@/store/slices/filter.slice"
import type { Project } from "@/types"
import { Spinner } from "@/components/ui/spinner"
import { FolderKanban, MoreHorizontal, Plus } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface PageUi {
  formOpen: boolean
  editProject: Project | undefined
  deleteId: string | null
  page: number
}

export default function ProjectsPage() {
  const dispatch = useAppDispatch()
  const filters = useAppSelector((s: RootState) => s.filters.projects)
  const [search, setSearch] = useState("")
  const [ui, setUi] = useState<PageUi>({
    formOpen: false,
    editProject: undefined,
    deleteId: null,
    page: 1,
  })

  const debouncedSearch = useDebounce(search, 300)
  const canManage = useHasPermission("ADMIN", "PROJECT_MANAGER")

  const { data, isLoading, isFetching } = useGetProjectsQuery({
    search: debouncedSearch || undefined,
    status: filters.status || undefined,
    sort: filters.sort,
    page: ui.page,
    limit: 12,
  })

  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation()

  const openCreate = () =>
    setUi((prev) => ({ ...prev, formOpen: true, editProject: undefined }))
  const openEdit = (p: Project) =>
    setUi((prev) => ({ ...prev, formOpen: true, editProject: p }))
  const closeForm = () => setUi((prev) => ({ ...prev, formOpen: false }))
  const confirmDelete = (id: string) =>
    setUi((prev) => ({ ...prev, deleteId: id }))
  const cancelDelete = () => setUi((prev) => ({ ...prev, deleteId: null }))

  const handleDelete = async () => {
    if (!ui.deleteId) return
    try {
      await deleteProject(ui.deleteId).unwrap()
      toastSuccess("Project deleted")
    } catch (err) {
      toastError(err, "Failed to delete project")
    } finally {
      cancelDelete()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search projects..."
          className="w-full sm:w-56"
        />
        <Select
          value={filters.status || "ALL"}
          onValueChange={(v) =>
            dispatch(setProjectFilter({ status: v === "ALL" ? "" : (v ?? "") }))
          }
        >
          <SelectTrigger className="h-8 w-36">
            <SelectValue>
              {PROJECT_STATUS_LABELS[filters.status || "ALL"]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="ON_HOLD">On Hold</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.sort}
          onValueChange={(v) => dispatch(setProjectFilter({ sort: v ?? "" }))}
        >
          <SelectTrigger className="h-8 w-40">
            <SelectValue>
              {PROJECT_SORT_LABELS[filters.sort]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt_desc">Latest created</SelectItem>
            <SelectItem value="createdAt_asc">Oldest first</SelectItem>
            <SelectItem value="deadline_asc">Nearest deadline</SelectItem>
            <SelectItem value="name_asc">Name A-Z</SelectItem>
          </SelectContent>
        </Select>
        {(isFetching || search !== debouncedSearch) && (
          <Spinner className="h-4 w-4 text-primary" />
        )}
        {canManage && (
          <Button onClick={openCreate} className="ml-auto">
            <Plus className="h-3.5 w-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">New project</span>
          </Button>
        )}
      </div>

      {isLoading ? (
        <ProjectCardsSkeleton />
      ) : (data?.items ?? []).length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description="Create your first project to get started."
          action={
            canManage ? (
              <Button onClick={openCreate}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                New project
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data!.items.map((project) => (
              <div
                key={project.id}
                className={cn(
                  "group relative rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md",
                  isFetching && "animate-pulse"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/dashboard/projects/${project.id}`}
                    className="min-w-0 flex-1"
                  >
                    <h3 className="truncate font-medium hover:underline">
                      {project.name}
                    </h3>
                  </Link>
                  {canManage && (
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-accent">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(project)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => confirmDelete(project.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {project.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {project.description}
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <ProjectStatusBadge status={project.status} />
                  <span className="text-xs text-muted-foreground">
                    {project._count.tasks} task
                    {project._count.tasks === 1 ? "" : "s"}
                  </span>
                </div>

                {project.deadline && (
                  <p
                    className={`mt-2 text-xs ${isOverdue(project.deadline) &&
                      project.status !== "COMPLETED"
                      ? "text-destructive"
                      : "text-muted-foreground"
                      }`}
                  >
                    Due {formatDate(project.deadline)}
                  </p>
                )}

                <div className="mt-3 flex -space-x-1.5">
                  {project.members.slice(0, 5).map((m) => (
                    <span
                      key={m.userId}
                      className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-primary text-[9px] font-medium text-primary-foreground"
                      title={m.user.name}
                    >
                      {m.user.name.charAt(0).toUpperCase()}
                    </span>
                  ))}
                  {project.members.length > 5 && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-muted text-[9px] text-muted-foreground">
                      +{project.members.length - 5}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Pagination
              page={ui.page}
              total={data!.total}
              limit={12}
              onChange={(p) => setUi((prev) => ({ ...prev, page: p }))}
            />
          </div>
        </>
      )}

      <Dialog open={ui.formOpen} onOpenChange={(o) => !o && closeForm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {ui.editProject ? "Edit project" : "New project"}
            </DialogTitle>
          </DialogHeader>
          <ProjectForm project={ui.editProject} onSuccess={closeForm} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!ui.deleteId}
        onOpenChange={(o) => !o && cancelDelete()}
        title="Delete project"
        description="This will permanently delete the project and all its tasks."
        confirmLabel="Delete"
        destructive
        loading={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  )
}
