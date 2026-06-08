"use client"

import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { Spinner } from "@/components/ui/spinner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toastError, toastSuccess } from "@/lib/toast"
import { taskSchema, type TaskInput } from "@/lib/validations/task.validations"
import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
} from "@/store/api/tasks-api"
import { useGetUsersQuery } from "@/store/api/users-api"
import type { Project, Task } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"

const PRIORITY_LABELS: Record<string, string> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
}

const STATUS_LABELS: Record<string, string> = {
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
}

interface TaskFormProps {
  task?: Task
  project?: Project
  projects?: Project[]
  onSuccess: () => void
}

export function TaskForm({
  task,
  project,
  projects,
  onSuccess,
}: Readonly<TaskFormProps>) {
  const [createTask, { isLoading: creating }] = useCreateTaskMutation()
  const [updateTask, { isLoading: updating }] = useUpdateTaskMutation()
  const { data: users = [] } = useGetUsersQuery({})
  const loading = creating || updating

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description ?? "",
          projectId: task.projectId,
          assignedToId: task.assignedToId ?? "",
          dueDate: task.dueDate?.split("T")[0] ?? "",
          priority: task.priority,
          status: task.status,
        }
      : {
          projectId: project?.id ?? "",
          priority: "MEDIUM",
          status: "TODO",
        },
  })

  const onSubmit = async (data: TaskInput) => {
    try {
      const payload = {
        ...data,
        assignedToId: data.assignedToId || undefined,
        dueDate: data.dueDate || undefined,
      }
      if (task) {
        await updateTask({ id: task.id, body: payload }).unwrap()
        toastSuccess("Task updated")
      } else {
        await createTask(payload).unwrap()
        toastSuccess("Task created")
      }
      onSuccess()
    } catch (err) {
      toastError(err, "Failed to save task")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Task title</Label>
        <Input placeholder="What needs to be done?" {...register("title")} />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea
          rows={3}
          placeholder="Add details..."
          className="resize-none"
          {...register("description")}
        />
      </div>

      {!project && projects && (
        <div className="space-y-1.5">
          <Label>Project</Label>
          <Controller
            control={control}
            name="projectId"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {field.value
                      ? (projects.find((p) => p.id === field.value)?.name ?? "Select a project")
                      : "Select a project"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.projectId && (
            <p className="text-xs text-destructive">
              {errors.projectId.message}
            </p>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Assign to</Label>
        <Controller
          control={control}
          name="assignedToId"
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value ?? ""}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {field.value
                    ? (users.find((u) => u.id === field.value)?.name ?? "Unassigned")
                    : "Unassigned"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Unassigned</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label>Due date</Label>
          <Controller
            control={control}
            name="dueDate"
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                placeholder="Pick a date"
              />
            )}
          />
          {errors.dueDate && (
            <p className="text-xs text-destructive">{errors.dueDate.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Priority</Label>
          <Controller
            control={control}
            name="priority"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {field.value ? (PRIORITY_LABELS[field.value] ?? field.value) : ""}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Status</Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {field.value ? (STATUS_LABELS[field.value] ?? field.value) : ""}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">Todo</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Spinner className="mr-2 h-3.5 w-3.5" />}
          {loading ? "Saving..." : task ? "Update task" : "Create task"}
        </Button>
      </div>
    </form>
  )
}
