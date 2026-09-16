export type Role = "PM" | "INTERNAL" | "CLIENT"

export type Department = "PRODUCT" | "UI_UX" | "FRONTEND" | "BACKEND" | "CLIENT"

export interface User {
  id: string
  name: string
  email: string
  role: Role
  department: Department
  company_id: string
  avatar_url: string | null
  created_at: string
}

export interface AuthResponse {
  user: User
  token: string
}
