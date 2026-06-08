import { z } from "zod"

export const taskSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  projectId: z.string().min(1, "Project is required"),
  assignedToId: z.string().optional(),
  dueDate: z
    .string()
    .optional()
    .refine(
      (v) => !v || new Date(v) > new Date(),
      "Please select a valid deadline"
    ),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]).optional(),
})

export type TaskInput = z.infer<typeof taskSchema>
