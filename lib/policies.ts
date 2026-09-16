import type { User } from "../types/auth"
import type { Task } from "../types/task"

export function canCreateProject(user: User | null): boolean {
  return user?.role === "PM"
}

export function canCreateTask(user: User | null): boolean {
  return user?.role === "PM"
}

export function canEditTaskDescription(user: User | null): boolean {
  return user?.role === "PM"
}

export function canMoveToDone(user: User | null, task: Task): boolean {
  if (!user || user.role === "PM") return false
  if (task.assignee_id && task.assignee_id !== user.id) return false
  return true
}

export function canManageMembers(user: User | null): boolean {
  return user?.role === "PM"
}

export function canDeleteTask(user: User | null): boolean {
  return user?.role === "PM"
}
