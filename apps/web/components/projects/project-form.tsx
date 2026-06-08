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
import {
  projectSchema,
  type ProjectInput,
} from "@/lib/validations/project.validations"
import {
  useCreateProjectMutation,
  useUpdateProjectMutation,
} from "@/store/api/projects-api"
import type { Project } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  ON_HOLD: "On Hold",
  COMPLETED: "Completed",
}

interface ProjectFormProps {
  project?: Project
  onSuccess: () => void
}

export function ProjectForm({
  project,
  onSuccess,
}: Readonly<ProjectFormProps>) {
  const [createProject, { isLoading: creating }] = useCreateProjectMutation()
  const [updateProject, { isLoading: updating }] = useUpdateProjectMutation()
  const loading = creating || updating

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: project
      ? {
          name: project.name,
          description: project.description ?? "",
          deadline: project.deadline?.split("T")[0] ?? "",
          status: project.status,
        }
      : { status: "ACTIVE" },
  })

  useEffect(() => {
    if (!project) reset({ status: "ACTIVE" })
  }, [project, reset])

  const onSubmit = async (data: ProjectInput) => {
    try {
      if (project) {
        await updateProject({ id: project.id, body: data }).unwrap()
        toastSuccess("Project updated")
      } else {
        await createProject(data).unwrap()
        toastSuccess("Project created")
      }
      onSuccess()
    } catch (err) {
      toastError(err, "Failed to save project")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Project name</Label>
        <Input placeholder="My Project" {...register("name")} />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea
          rows={3}
          placeholder="What is this project about?"
          className="resize-none"
          {...register("description")}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Deadline</Label>
          <Controller
            control={control}
            name="deadline"
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                placeholder="Pick a date"
              />
            )}
          />
          {errors.deadline && (
            <p className="text-xs text-destructive">
              {errors.deadline.message}
            </p>
          )}
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
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="ON_HOLD">On Hold</SelectItem>
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
          {loading ? "Saving..." : project ? "Update project" : "Create project"}
        </Button>
      </div>
    </form>
  )
}
