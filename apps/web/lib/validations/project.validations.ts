import { z } from "zod"

export const projectSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  deadline: z
    .string()
    .optional()
    .refine(
      (v) => !v || new Date(v) > new Date(),
      "Deadline must be a future date"
    ),
  status: z.enum(["ACTIVE", "COMPLETED", "ON_HOLD"]).optional(),
})

export type ProjectInput = z.infer<typeof projectSchema>
