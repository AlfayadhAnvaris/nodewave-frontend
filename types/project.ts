import type { Department, Role } from "./auth"

export type ProjectStatus = "PLANNING" | "ACTIVE" | "COMPLETED" | "ARCHIVED"

export interface Project {
  id: string
  company_id: string
  name: string
  description: string | null
  status: ProjectStatus
  created_at: string
  updated_at: string
}

export interface ProjectMemberUser {
  id: string
  name: string
  email: string
  role: Role
  department: Department
  avatar_url: string | null
}

export interface ProjectMember {
  id: string
  project_id: string
  user_id: string
  created_at: string
  user: ProjectMemberUser
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedProjectsResponse {
  data: Project[]
  meta: PaginationMeta
}
