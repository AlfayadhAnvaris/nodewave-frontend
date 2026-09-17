"use client"

import { ArrowRight, Filter, FolderKanban, Plus, Search, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { CreateProjectModal } from "../../components/create-project-modal"
import { AppLayout } from "../../components/layout/app-layout"
import { EmptyState } from "../../components/ui/empty-state"
import { FilterDrawer } from "../../components/ui/filter-drawer"
import { TableSkeleton } from "../../components/ui/skeleton-loader"
import { formatDate } from "../../lib/formatters"
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
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const isPM = user?.role === "PM"

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleResetFilters = () => {
    setSearch("")
    setStatusFilter("")
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Workspace Projects</h1>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Manage, search, and track workspace projects and task milestones
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
                onClick={() => setIsCreateModalOpen(true)}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700 shadow-sm shadow-blue-600/20 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Project</span>
              </button>
            )}
          </div>
        </div>

        <div className="hidden md:flex flex-row items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search records by name or keyword..."
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | "")}
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs font-bold text-slate-700 focus:border-blue-600 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="PLANNING">PLANNING</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>

          {(search || statusFilter) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>

        <FilterDrawer
          isOpen={isMobileFilterOpen}
          onClose={() => setIsMobileFilterOpen(false)}
          onReset={handleResetFilters}
        >
          <div className="space-y-3">
            <div>
              <label htmlFor="mobile-search-input" className="block text-xs font-bold text-slate-700 mb-1">Search</label>
              <input
                id="mobile-search-input"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900"
              />
            </div>
            <div>
              <label htmlFor="mobile-status-select" className="block text-xs font-bold text-slate-700 mb-1">Status</label>
              <select
                id="mobile-status-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | "")}
                className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-700"
              >
                <option value="">All Statuses</option>
                <option value="PLANNING">PLANNING</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
          </div>
        </FilterDrawer>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : projects.length === 0 ? (
          <EmptyState
            icon={<FolderKanban className="w-6 h-6 text-blue-600" />}
            title="No projects found"
            description={
              search || statusFilter
                ? "No records match your active search filters. Try clearing filters."
                : "No projects created in your company workspace yet."
            }
            actionLabel={isPM ? "+ Add Project" : undefined}
            onAction={isPM ? () => setIsCreateModalOpen(true) : undefined}
          />
        ) : (
          <>
            <div className="hidden md:block rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Project / Record Name</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Created Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {projects.map((proj) => (
                    <tr key={proj.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4 font-bold text-slate-900">{proj.name}</td>
                      <td className="p-4 text-slate-500 max-w-xs truncate">
                        {proj.description || "No description provided."}
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            proj.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : proj.status === "COMPLETED"
                                ? "bg-blue-50 text-blue-700 border border-blue-100"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {proj.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">{formatDate(proj.created_at)}</td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/projects/${proj.id}`}
                          className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          <span>Open Details</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-4 space-y-3 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{proj.name}</h3>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        proj.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {proj.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {proj.description || "No description provided."}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-semibold">
                    <span>{formatDate(proj.created_at)}</span>
                    <Link
                      href={`/projects/${proj.id}`}
                      className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
            <span className="text-xs font-semibold text-slate-500">
              Page {meta.page} of {meta.totalPages} ({meta.total} Records)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={meta.page <= 1}
                onClick={() => setPage(meta.page - 1)}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 shadow-xs"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={meta.page >= meta.totalPages}
                onClick={() => setPage(meta.page + 1)}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 shadow-xs"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </AppLayout>
  )
}
