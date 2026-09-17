"use client"

import { ChevronDown, Menu } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { useAuthStore } from "../../stores/auth.store"
import { useToastStore } from "../../stores/toast.store"
import NotificationCenter from "../notification-center"

interface TopHeaderProps {
  onMenuClick: () => void
}

export function TopHeader({ onMenuClick }: TopHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { addToast } = useToastStore()
  const [showDropdown, setShowDropdown] = useState(false)

  const getBreadcrumb = () => {
    if (pathname.startsWith("/projects/")) return "Project Detail"
    if (pathname === "/projects") return "Projects"
    if (pathname === "/dashboard") return "Dashboard Overview"
    return "Workspace"
  }

  const handleLogout = async () => {
    try {
      await logout()
      addToast({ title: "Logged Out", message: "Successfully logged out.", type: "info" })
      router.push("/login")
    } catch {
      addToast({ title: "Logout Error", message: "Failed to log out.", type: "error" })
    }
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link href="/dashboard" className="hover:text-blue-600 transition">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">{getBreadcrumb()}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <NotificationCenter />

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-none">{user?.name || "User"}</p>
              <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">{user?.role || "Role"}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-slate-200 shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                <p className="text-[10px] text-slate-500 font-medium truncate">{user?.email}</p>
              </div>
              <div className="py-1 border-b border-slate-100">
                <Link
                  href="/profile"
                  onClick={() => setShowDropdown(false)}
                  className="block px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Profile Settings
                </Link>
                <Link
                  href="/users"
                  onClick={() => setShowDropdown(false)}
                  className="block px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  User Management
                </Link>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
              >
                Logout Account
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
