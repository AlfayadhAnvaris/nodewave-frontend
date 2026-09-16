import { z } from "zod"

export const createTaskSchema = z.object({
  title: z.string().min(2, "Task title must be at least 2 characters"),
  description: z.string().optional(),
  assigneeId: z.string().optional().nullable(),
  department: z.enum(["PRODUCT", "UI_UX", "FRONTEND", "BACKEND", "CLIENT"]),
  clientVisible: z.boolean(),
})

export const updateTaskSchema = z.object({
  title: z.string().min(2, "Task title must be at least 2 characters").optional(),
  description: z.string().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  department: z.enum(["PRODUCT", "UI_UX", "FRONTEND", "BACKEND", "CLIENT"]).optional(),
  status: z.enum(["TODO", "BLOCKED", "IN_PROGRESS", "DONE"]).optional(),
  clientVisible: z.boolean().optional(),
})

export type CreateTaskFormData = z.infer<typeof createTaskSchema>
export type UpdateTaskFormData = z.infer<typeof updateTaskSchema>
