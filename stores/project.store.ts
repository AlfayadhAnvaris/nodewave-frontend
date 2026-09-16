import { create } from "zustand"
import { api } from "../lib/api"
import type { CreateProjectFormData } from "../schemas/project.schema"
import type { PaginatedProjectsResponse, Project, ProjectMember, ProjectStatus } from "../types/project"

interface ProjectState {
  projects: Project[]
  activeProject: Project | null
  members: ProjectMember[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  search: string
  statusFilter: ProjectStatus | ""
  isLoading: boolean
  error: string | null

  setSearch: (search: string) => void
  setStatusFilter: (status: ProjectStatus | "") => void
  setPage: (page: number) => void

  fetchProjects: () => Promise<void>
  fetchProjectById: (id: string) => Promise<void>
  createProject: (data: CreateProjectFormData) => Promise<Project>
  updateProject: (id: string, data: Partial<CreateProjectFormData>) => Promise<void>
  deleteProject: (id: string) => Promise<void>

  fetchMembers: (projectId: string) => Promise<void>
  addMember: (projectId: string, userId: string) => Promise<void>
  removeMember: (projectId: string, userId: string) => Promise<void>
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  activeProject: null,
  members: [],
  meta: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
  search: "",
  statusFilter: "",
  isLoading: false,
  error: null,

  setSearch: (search: string) => {
    set((state) => ({ search, meta: { ...state.meta, page: 1 } }))
    get().fetchProjects()
  },

  setStatusFilter: (statusFilter: ProjectStatus | "") => {
    set((state) => ({ statusFilter, meta: { ...state.meta, page: 1 } }))
    get().fetchProjects()
  },

  setPage: (page: number) => {
    set((state) => ({ meta: { ...state.meta, page } }))
    get().fetchProjects()
  },

  fetchProjects: async () => {
    set({ isLoading: true, error: null })
    try {
      const { meta, search, statusFilter } = get()
      const res = await api.get<PaginatedProjectsResponse>("/projects", {
        params: {
          page: meta.page,
          limit: meta.limit,
          search: search || undefined,
          status: statusFilter || undefined,
        },
      })
      set({
        projects: res.data.data,
        meta: res.data.meta,
        isLoading: false,
      })
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error || "Failed to fetch projects"
        : "Failed to fetch projects"
      set({ error: msg, isLoading: false })
    }
  },

  fetchProjectById: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.get<Project>(`/projects/${id}`)
      set({ activeProject: res.data, isLoading: false })
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error || "Failed to fetch project detail"
        : "Failed to fetch project detail"
      set({ error: msg, isLoading: false })
    }
  },

  createProject: async (data: CreateProjectFormData) => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.post<Project>("/projects", data)
      set({ isLoading: false })
      await get().fetchProjects()
      return res.data
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error || "Failed to create project"
        : "Failed to create project"
      set({ error: msg, isLoading: false })
      throw new Error(msg)
    }
  },

  updateProject: async (id: string, data: Partial<CreateProjectFormData>) => {
    set({ isLoading: true, error: null })
    try {
      await api.patch<Project>(`/projects/${id}`, data)
      set({ isLoading: false })
      await get().fetchProjectById(id)
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error || "Failed to update project"
        : "Failed to update project"
      set({ error: msg, isLoading: false })
      throw new Error(msg)
    }
  },

  deleteProject: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await api.delete(`/projects/${id}`)
      set({ isLoading: false, activeProject: null })
      await get().fetchProjects()
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error || "Failed to delete project"
        : "Failed to delete project"
      set({ error: msg, isLoading: false })
      throw new Error(msg)
    }
  },

  fetchMembers: async (projectId: string) => {
    try {
      const res = await api.get<ProjectMember[]>(`/projects/${projectId}/members`)
      set({ members: res.data })
    } catch (_err) {
      set({ members: [] })
    }
  },

  addMember: async (projectId: string, userId: string) => {
    try {
      await api.post(`/projects/${projectId}/members`, { userId })
      await get().fetchMembers(projectId)
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error || "Failed to add member"
        : "Failed to add member"
      throw new Error(msg)
    }
  },

  removeMember: async (projectId: string, userId: string) => {
    try {
      await api.delete(`/projects/${projectId}/members/${userId}`)
      await get().fetchMembers(projectId)
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error || "Failed to remove member"
        : "Failed to remove member"
      throw new Error(msg)
    }
  },
}))
