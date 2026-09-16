"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "../stores/auth.store"

export function NavHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="text-xl font-bold text-indigo-400">
          NodeWave
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              pathname === "/dashboard"
                ? "bg-slate-800 text-indigo-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/projects"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              pathname.startsWith("/projects")
                ? "bg-slate-800 text-indigo-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Projects
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-200">{user?.name}</p>
          <p className="text-xs text-slate-400">
            {user?.role} • {user?.department}
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
