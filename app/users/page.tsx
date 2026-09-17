"use client"

import { Filter, Mail, Plus, Search, Shield, UserPlus, Users, X } from "lucide-react"
import { useState } from "react"
import { InviteUserModal } from "../../components/invite-user-modal"
import { AppLayout } from "../../components/layout/app-layout"
import { EmptyState } from "../../components/ui/empty-state"
import { FilterDrawer } from "../../components/ui/filter-drawer"
import { useAuthStore } from "../../stores/auth.store"
import { useToastStore } from "../../stores/toast.store"
import type { Department, Role } from "../../types/auth"

interface ManagedUser {
  id: string
  name: string
  email: string
  role: Role
  department: Department
  status: "ACTIVE" | "PENDING"
  joined_at: string
}

const INITIAL_USERS: ManagedUser[] = [
  {
    id: "usr-1",
    name: "Alex ProjectManager",
    email: "pm@example.com",
    role: "PM",
    department: "PRODUCT",
    status: "ACTIVE",
    joined_at: "2026-08-01",
  },
  {
    id: "usr-2",
    name: "Sarah Jenkins",
    email: "frontend@example.com",
    role: "INTERNAL",
    department: "FRONTEND",
    status: "ACTIVE",
    joined_at: "2026-08-10",
  },
  {
    id: "usr-3",
    name: "David Chen",
    email: "backend@example.com",
    role: "INTERNAL",
    department: "BACKEND",
    status: "ACTIVE",
    joined_at: "2026-08-15",
  },
  {
    id: "usr-4",
    name: "Elena Rostova",
    email: "design@example.com",
    role: "INTERNAL",
    department: "UI_UX",
    status: "ACTIVE",
    joined_at: "2026-08-20",
  },
  {
    id: "usr-5",
    name: "Enterprise Client",
    email: "client@example.com",
    role: "CLIENT",
    department: "CLIENT",
    status: "ACTIVE",
    joined_at: "2026-09-01",
  },
]

export default function UsersManagementPage() {
  const { user: currentUser } = useAuthStore()
  const { addToast } = useToastStore()
  const [usersList, setUsersList] = useState<ManagedUser[]>(INITIAL_USERS)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("")
  const [deptFilter, setDeptFilter] = useState<string>("")
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  const isPM = currentUser?.role === "PM"

  const handleUserInvited = (newUser: { name: string; email: string; role: Role; department: Department }) => {
    const item: ManagedUser = {
      id: `usr-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      status: "PENDING",
      joined_at: new Date().toISOString().split("T")[0],
    }
    setUsersList((prev) => [item, ...prev])
  }

  const handleToggleStatus = (id: string) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const nextStatus = u.status === "ACTIVE" ? "PENDING" : "ACTIVE"
          addToast({
            title: "User Status Updated",
            message: `${u.name} is now ${nextStatus}.`,
            type: "info",
          })
          return { ...u, status: nextStatus }
        }
        return u
      })
    )
  }

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = !roleFilter || u.role === roleFilter
    const matchesDept = !deptFilter || u.department === deptFilter
    return matchesSearch && matchesRole && matchesDept
  })

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              <span>User & Role Management</span>
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Directory of workspace members, role permissions, and team allocations
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="md:hidden rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 flex items-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            {isPM && (
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(true)}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700 shadow-sm shadow-blue-600/20 flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Invite User</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="hidden md:flex flex-row items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user directory by name or email..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-8 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-2.5 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs font-bold text-slate-700 focus:border-blue-600 focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="PM">PM (Project Manager)</option>
            <option value="INTERNAL">INTERNAL (Team Member)</option>
            <option value="CLIENT">CLIENT (Guest)</option>
          </select>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs font-bold text-slate-700 focus:border-blue-600 focus:outline-none"
          >
            <option value="">All Departments</option>
            <option value="PRODUCT">PRODUCT</option>
            <option value="UI_UX">UI_UX</option>
            <option value="FRONTEND">FRONTEND</option>
            <option value="BACKEND">BACKEND</option>
            <option value="CLIENT">CLIENT</option>
          </select>

          {(search || roleFilter || deptFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearch("")
                setRoleFilter("")
                setDeptFilter("")
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>

        <FilterDrawer
          isOpen={isMobileFilterOpen}
          onClose={() => setIsMobileFilterOpen(false)}
          onReset={() => {
            setSearch("")
            setRoleFilter("")
            setDeptFilter("")
          }}
        >
          <div className="space-y-3">
            <div>
              <label htmlFor="user-search-mobile" className="block text-xs font-bold text-slate-700 mb-1">Search User</label>
              <input
                id="user-search-mobile"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name..."
                className="w-full rounded-xl border border-slate-200 p-2 text-xs"
              />
            </div>
          </div>
        </FilterDrawer>

        {/* Users Table / Directory */}
        {filteredUsers.length === 0 ? (
          <EmptyState
            icon={<Users className="w-6 h-6 text-blue-600" />}
            title="No users match your filters"
            description="Try clearing your active search keyword or department filters."
          />
        ) : (
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">User Details</th>
                    <th className="p-4">Workspace Role</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Joined Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{u.name}</p>
                            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" /> {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            u.role === "PM"
                              ? "bg-purple-50 text-purple-700 border border-purple-100"
                              : u.role === "CLIENT"
                                ? "bg-amber-50 text-amber-700 border border-amber-100"
                                : "bg-blue-50 text-blue-700 border border-blue-100"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                          {u.department}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                            u.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>

                      <td className="p-4 text-slate-500 font-medium">{u.joined_at}</td>

                      <td className="p-4 text-right">
                        {isPM && u.email !== currentUser?.email ? (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(u.id)}
                            className="text-xs font-bold text-blue-600 hover:underline"
                          >
                            Toggle Status
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">Self</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onUserInvited={handleUserInvited}
      />
    </AppLayout>
  )
}
