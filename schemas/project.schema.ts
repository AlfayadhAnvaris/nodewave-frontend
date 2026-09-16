import { z } from "zod"

export const createProjectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters"),
  description: z.string().optional(),
  status: z.enum(["PLANNING", "ACTIVE", "COMPLETED", "ARCHIVED"]).optional(),
})

export const addMemberSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
})

export type CreateProjectFormData = z.infer<typeof createProjectSchema>
export type AddMemberFormData = z.infer<typeof addMemberSchema>
