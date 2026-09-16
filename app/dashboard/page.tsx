"use client"

import { useRouter } from "next/navigation"
import { useAuthStore } from "../../stores/auth.store"

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-indigo-400">NodeWave</h1>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">Dashboard</span>
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

      <main className="p-8 max-w-5xl mx-auto">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-100">Welcome to NodeWave Dashboard</h2>
          <p className="text-sm text-slate-400">
            Authenticated as <strong className="text-indigo-400">{user?.email}</strong>. Authentication setup is fully operational.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80">
              <span className="text-xs text-slate-400 block">User ID</span>
              <span className="text-xs font-mono font-medium text-slate-200 truncate block mt-1">{user?.id}</span>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80">
              <span className="text-xs text-slate-400 block">Company ID</span>
              <span className="text-xs font-mono font-medium text-slate-200 truncate block mt-1">{user?.company_id}</span>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80">
              <span className="text-xs text-slate-400 block">Role</span>
              <span className="text-xs font-medium text-indigo-400 block mt-1">{user?.role}</span>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80">
              <span className="text-xs text-slate-400 block">Department</span>
              <span className="text-xs font-medium text-emerald-400 block mt-1">{user?.department}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
