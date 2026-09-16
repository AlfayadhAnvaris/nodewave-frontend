import type { Department } from "./auth"

export type TaskStatus = "TODO" | "BLOCKED" | "IN_PROGRESS" | "DONE"

export interface TaskAssignee {
  id: string
  name: string
  email: string
  avatar_url: string | null
}

export interface Task {
  id: string
  project_id: string
  assignee_id: string | null
  title: string
  description: string | null
  status: TaskStatus
  department: Department
  client_visible: boolean
  version: number
  created_at: string
  updated_at: string
  assignee?: TaskAssignee | null
}
