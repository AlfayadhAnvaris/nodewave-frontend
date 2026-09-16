"use client"

import { usePathname, useRouter } from "next/navigation"
import { type ReactNode, useEffect } from "react"
import { useAuthStore } from "../stores/auth.store"

const PUBLIC_ROUTES = ["/login", "/register"]

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isLoading, initAuth } = useAuthStore()

  useEffect(() => {
    initAuth()
  }, [initAuth])

  useEffect(() => {
    if (!isLoading) {
      const isPublic = PUBLIC_ROUTES.includes(pathname)
      if (!isAuthenticated && !isPublic) {
        router.push("/login")
      } else if (isAuthenticated && isPublic) {
        router.push("/dashboard")
      }
    }
  }, [isAuthenticated, isLoading, pathname, router])

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-400">Loading NodeWave Assessment...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
