import axios from "axios"

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BE_URL || "https://nodewave-backend-k79c.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    }
    const message = error.response?.data?.error || error.message || "An unexpected error occurred"
    error.message = message
    return Promise.reject(error)
  },
)
