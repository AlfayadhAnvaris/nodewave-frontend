import { create } from "zustand"
import { api } from "../lib/api"
import type { CreateTaskFormData, UpdateTaskFormData } from "../schemas/task.schema"
import type { Task, TaskStatus } from "../types/task"

interface TaskState {
  tasks: Task[]
  selectedTask: Task | null
  statusFilter: TaskStatus | ""
  departmentFilter: string
  search: string
  isLoading: boolean
  error: string | null

  setStatusFilter: (status: TaskStatus | "") => void
  setDepartmentFilter: (dept: string) => void
  setSearch: (search: string) => void

  fetchProjectTasks: (projectId: string) => Promise<void>
  fetchTaskById: (id: string) => Promise<void>
  createTask: (projectId: string, data: CreateTaskFormData) => Promise<Task>
  updateTask: (id: string, data: UpdateTaskFormData) => Promise<Task>
  deleteTask: (id: string) => Promise<void>
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  selectedTask: null,
  statusFilter: "",
  departmentFilter: "",
  search: "",
  isLoading: false,
  error: null,

  setStatusFilter: (statusFilter: TaskStatus | "") => set({ statusFilter }),
  setDepartmentFilter: (departmentFilter: string) => set({ departmentFilter }),
  setSearch: (search: string) => set({ search }),

  fetchProjectTasks: async (projectId: string) => {
    set({ isLoading: true, error: null })
    try {
      const { statusFilter, departmentFilter, search } = get()
      const res = await api.get<Task[]>(`/projects/${projectId}/tasks`, {
        params: {
          status: statusFilter || undefined,
          department: departmentFilter || undefined,
          search: search || undefined,
        },
      })
      set({ tasks: res.data, isLoading: false })
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error || "Failed to fetch tasks"
        : "Failed to fetch tasks"
      set({ error: msg, isLoading: false })
    }
  },

  fetchTaskById: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.get<Task>(`/tasks/${id}`)
      set({ selectedTask: res.data, isLoading: false })
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error || "Failed to fetch task"
        : "Failed to fetch task"
      set({ error: msg, isLoading: false })
    }
  },

  createTask: async (projectId: string, data: CreateTaskFormData) => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.post<Task>(`/projects/${projectId}/tasks`, data)
      set({ isLoading: false })
      await get().fetchProjectTasks(projectId)
      return res.data
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error || "Failed to create task"
        : "Failed to create task"
      set({ error: msg, isLoading: false })
      throw new Error(msg)
    }
  },

  updateTask: async (id: string, data: UpdateTaskFormData) => {
    try {
      const res = await api.patch<Task>(`/tasks/${id}`, data)
      const updated = res.data
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
        selectedTask: state.selectedTask?.id === id ? updated : state.selectedTask,
      }))
      return updated
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error || "Failed to update task"
        : "Failed to update task"
      throw new Error(msg)
    }
  },

  deleteTask: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const task = get().tasks.find((t) => t.id === id)
      await api.delete(`/tasks/${id}`)
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
        selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
        isLoading: false,
      }))
      if (task) {
        await get().fetchProjectTasks(task.project_id)
      }
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error || "Failed to delete task"
        : "Failed to delete task"
      set({ error: msg, isLoading: false })
      throw new Error(msg)
    }
  },
}))
