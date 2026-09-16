import { create } from "zustand"
import { api } from "../lib/api"
import type { LoginFormData, RegisterFormData } from "../schemas/auth.schema"
import type { AuthResponse, User } from "../types/auth"

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: LoginFormData) => Promise<void>
  register: (data: RegisterFormData) => Promise<void>
  logout: () => Promise<void>
  initAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (data: LoginFormData) => {
    const res = await api.post<AuthResponse>("/auth/login", data)
    const { user, token } = res.data
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(user))
    set({ user, token, isAuthenticated: true, isLoading: false })
  },

  register: async (data: RegisterFormData) => {
    const res = await api.post<AuthResponse>("/auth/register", data)
    const { user, token } = res.data
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(user))
    set({ user, token, isAuthenticated: true, isLoading: false })
  },

  logout: async () => {
    try {
      await api.post("/auth/logout")
    } catch (_err) {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false })
    } finally {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      set({ user: null, token: null, isAuthenticated: false, isLoading: false })
    }
  },

  initAuth: async () => {
    if (typeof window === "undefined") {
      set({ isLoading: false })
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false })
      return
    }

    try {
      const res = await api.get<User>("/auth/me")
      set({ user: res.data, token, isAuthenticated: true, isLoading: false })
    } catch (_err) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      set({ user: null, token: null, isAuthenticated: false, isLoading: false })
    }
  },
}))
