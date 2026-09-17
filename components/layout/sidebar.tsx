"use client"

import { FolderKanban, LayoutDashboard, Settings, Users, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthStore } from "../../stores/auth.store"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuthStore()

  const navItems = [
    { label: "Dashboard", href: "/dashboard", Icon: LayoutDashboard },
    { label: "Projects", href: "/projects", Icon: FolderKanban },
    { label: "User Management", href: "/users", Icon: Users },
  ]

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-xs lg:hidden cursor-default w-full h-full border-0 p-0"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 border-r border-slate-200 bg-white flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/favicon.svg" alt="NodeWave Logo" className="h-8 w-8 object-contain shrink-0" />
              <span className="text-lg font-extrabold text-slate-900 tracking-tight">NodeWave</span>
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-slate-600 p-1 transition"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-6">
            <div>
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Main Menu</p>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
                  const Icon = item.Icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? "bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100">
          {user && (
            <Link
              href="/profile"
              onClick={onClose}
              className={`flex items-center gap-3 p-2.5 rounded-xl border transition ${
                pathname === "/profile"
                  ? "bg-blue-50 border-blue-200 text-blue-600 font-bold"
                  : "bg-slate-50 border-slate-100 hover:bg-slate-100/80 text-slate-900"
              }`}
              title="Profile Settings"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 font-medium truncate">{user.role} • {user.department}</p>
              </div>
              <Settings className="w-4 h-4 text-slate-400 hover:text-slate-600 shrink-0" />
            </Link>
          )}
        </div>
      </aside>
    </>
  )
}
