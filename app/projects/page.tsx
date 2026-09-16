"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { CreateProjectModal } from "../../components/create-project-modal"
import { NavHeader } from "../../components/nav-header"
import { useAuthStore } from "../../stores/auth.store"
import { useProjectStore } from "../../stores/project.store"
import type { ProjectStatus } from "../../types/project"

export default function ProjectsPage() {
  const { user } = useAuthStore()
  const {
    projects,
    meta,
    search,
    statusFilter,
    isLoading,
    error,
    fetchProjects,
    setSearch,
    setStatusFilter,
    setPage,
  } = useProjectStore()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const isPM = user?.role === "PM"

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <NavHeader />

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">Projects Overview</h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage and track projects for {user?.role} scope
            </p>
          </div>

          {isPM && (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-500 shadow-lg shadow-indigo-600/20"
            >
              + Create New Project
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name or description..."
            className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | "")}
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="PLANNING">PLANNING</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-400">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/30 p-12 text-center">
            <p className="text-sm font-medium text-slate-300">No projects found</p>
            <p className="text-xs text-slate-500 mt-1">
              {search || statusFilter ? "Try clearing your filters" : "Get started by creating a project"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((proj) => (
              <Link
                key={proj.id}
                href={`/projects/${proj.id}`}
                className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition hover:border-indigo-500/50 hover:bg-slate-900/80 shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-400 transition truncate">
                    {proj.name}
                  </h3>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                      proj.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : proj.status === "COMPLETED"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {proj.status}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-400 line-clamp-2">
                  {proj.description || "No description provided."}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                  <span>ID: {proj.id.substring(0, 8)}...</span>
                  <span>{new Date(proj.created_at).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Showing Page {meta.page} of {meta.totalPages} ({meta.total} Projects)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={meta.page <= 1}
                onClick={() => setPage(meta.page - 1)}
                className="rounded-lg border border-slate-800 px-3 py-1 text-xs text-slate-300 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={meta.page >= meta.totalPages}
                onClick={() => setPage(meta.page + 1)}
                className="rounded-lg border border-slate-800 px-3 py-1 text-xs text-slate-300 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  )
}
