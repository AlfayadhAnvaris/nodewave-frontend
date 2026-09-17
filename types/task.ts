import type { Department } from "./auth"

export type TaskStatus = "TODO" | "BLOCKED" | "IN_PROGRESS" | "DONE"
export type TaskPriority = "URGENT" | "HIGH" | "MEDIUM" | "LOW"

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
  priority?: TaskPriority
  department: Department
  client_visible: boolean
  version: number
  created_at: string
  updated_at: string
  due_date?: string | null
  completed_at?: string | null
  assignee?: TaskAssignee | null
}

export interface TaskAuditLog {
  id: string
  task_id: string
  user_id: string
  changed_column: string
  old_value: string | null
  new_value: string | null
  created_at: string
  user: {
    id: string
    name: string
    email: string
  }
}
