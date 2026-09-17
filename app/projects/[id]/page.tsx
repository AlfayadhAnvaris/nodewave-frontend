"use client"

import {
  Filter,
  GitCommit,
  History,
  Kanban,
  Paperclip,
  Plus,
  Search,
  Table,
  TrendingUp,
  X,
} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AddMemberModal } from "../../../components/add-member-modal"
import { CreateTaskModal } from "../../../components/create-task-modal"
import { AppLayout } from "../../../components/layout/app-layout"
import { ProjectAnalyticsChart } from "../../../components/project-analytics-chart"
import { TaskAttachmentsModal } from "../../../components/task-attachments-modal"
import { TaskAuditLogsModal } from "../../../components/task-audit-logs-modal"
import { TaskDependenciesModal } from "../../../components/task-dependencies-modal"
import { ConfirmationModal } from "../../../components/ui/confirmation-modal"
import { EmptyState } from "../../../components/ui/empty-state"
import { FilterDrawer } from "../../../components/ui/filter-drawer"
import { CardSkeleton } from "../../../components/ui/skeleton-loader"
import { canMoveToDone } from "../../../lib/policies"
import { useAuthStore } from "../../../stores/auth.store"
import { useProjectStore } from "../../../stores/project.store"
import { useTaskStore } from "../../../stores/task.store"
import { useToastStore } from "../../../stores/toast.store"
import type { Task, TaskStatus } from "../../../types/task"

const BOARD_COLUMNS: { id: TaskStatus; label: string; color: string; badgeColor: string }[] = [
  { id: "TODO", label: "To Do", color: "border-slate-200/90 bg-slate-100/70 text-slate-900", badgeColor: "bg-slate-200 text-slate-700" },
  { id: "BLOCKED", label: "Blocked", color: "border-rose-200/90 bg-rose-50/70 text-rose-950", badgeColor: "bg-rose-100 text-rose-800 border border-rose-200" },
  { id: "IN_PROGRESS", label: "In Progress", color: "border-amber-200/90 bg-amber-50/70 text-amber-950", badgeColor: "bg-amber-100 text-amber-800 border border-amber-200" },
  { id: "DONE", label: "Done", color: "border-emerald-200/90 bg-emerald-50/70 text-emerald-950", badgeColor: "bg-emerald-100 text-emerald-800 border border-emerald-200" },
]

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const { user } = useAuthStore()
  const { addToast } = useToastStore()

  const {
    activeProject,
    members,
    isLoading: isProjectLoading,
    error: projectError,
    fetchProjectById,
    fetchMembers,
    removeMember,
    deleteProject,
  } = useProjectStore()

  const {
    tasks,
    error: taskError,
    fetchProjectTasks,
    updateTask,
    deleteTask,
    search,
    setSearch,
    departmentFilter,
    setDepartmentFilter,
    statusFilter,
    setStatusFilter,
  } = useTaskStore()

  const [viewMode, setViewMode] = useState<"board" | "table">("board")
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false)
  const [isConfirmDeleteProjOpen, setIsConfirmDeleteProjOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  const [selectedTaskForDeps, setSelectedTaskForDeps] = useState<Task | null>(null)
  const [selectedTaskForAudit, setSelectedTaskForAudit] = useState<Task | null>(null)
  const [selectedTaskForAttachments, setSelectedTaskForAttachments] = useState<Task | null>(null)
  const [showMemberDrawer, setShowMemberDrawer] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [dragOverColumnId, setDragOverColumnId] = useState<TaskStatus | null>(null)

  const isPM = user?.role === "PM"

  useEffect(() => {
    if (projectId) {
      fetchProjectById(projectId)
      fetchMembers(projectId)
      fetchProjectTasks(projectId)
    }
  }, [projectId, fetchProjectById, fetchMembers, fetchProjectTasks])

  const handleDeleteProjectConfirmed = async () => {
    try {
      await deleteProject(projectId)
      addToast({ title: "Project Deleted", message: "Project was soft deleted successfully.", type: "info" })
      router.push("/projects")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete project"
      addToast({ title: "Error", message: msg, type: "error" })
    }
  }

  const handleRemoveMember = async (memberUserId: string) => {
    try {
      await removeMember(projectId, memberUserId)
      addToast({ title: "Member Removed", message: "Member was removed from project.", type: "info" })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to remove member"
      addToast({ title: "Error", message: msg, type: "error" })
    }
  }

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    if (user?.role === "CLIENT") {
      addToast({ title: "Access Denied", message: "Client users are not permitted to modify task status.", type: "warning" })
      return
    }

    if (newStatus === "DONE" && !canMoveToDone(user, task)) {
      addToast({
        title: "Action Rejected",
        message: "Product Managers cannot directly complete tasks. Only assigned executors can set status to DONE.",
        type: "warning",
      })
      return
    }

    try {
      await updateTask(task.id, { status: newStatus, version: task.version })
      addToast({ title: "Task Updated", message: `Status changed to ${newStatus}`, type: "success" })
      await fetchProjectTasks(projectId)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update task status"
      addToast({ title: "Update Failed", message: msg, type: "error" })
      await fetchProjectTasks(projectId)
    }
  }

  const handleDeleteTaskConfirmed = async () => {
    if (!taskToDelete) return
    try {
      await deleteTask(taskToDelete)
      addToast({ title: "Task Deleted", message: "Task was soft deleted.", type: "info" })
      setTaskToDelete(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete task"
      addToast({ title: "Delete Failed", message: msg, type: "error" })
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/projects" className="hover:text-blue-600 transition">
              Projects
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">{activeProject?.name || "Detail"}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-xl bg-slate-200/80 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewMode("board")}
                className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 ${
                  viewMode === "board" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Board</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 ${
                  viewMode === "table" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition border flex items-center gap-1.5 ${
                showAnalytics
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{showAnalytics ? "Hide Analytics" : "Analytics"}</span>
            </button>
            {isPM && (
              <button
                type="button"
                onClick={() => setIsCreateTaskModalOpen(true)}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700 shadow-sm shadow-blue-600/20 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            )}
          </div>
        </div>

        {(projectError || taskError) && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
            {projectError || taskError}
          </div>
        )}

        {isProjectLoading && !activeProject ? (
          <CardSkeleton />
        ) : activeProject ? (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">{activeProject.name}</h1>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      activeProject.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {activeProject.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {activeProject.description || "No description provided."}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowMemberDrawer(!showMemberDrawer)}
                  className="flex -space-x-2 overflow-hidden hover:opacity-80 transition"
                  title="View members"
                >
                  {members.map((m) => (
                    <div
                      key={m.id}
                      title={`${m.user.name} (${m.user.role})`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-blue-700 ring-2 ring-white border border-slate-200"
                    >
                      {m.user.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                </button>
                {isPM && (
                  <button
                    type="button"
                    onClick={() => setIsAddMemberModalOpen(true)}
                    className="text-xs text-blue-600 hover:underline font-bold px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-100"
                  >
                    + Add Member
                  </button>
                )}
                {isPM && (
                  <button
                    type="button"
                    onClick={() => setIsConfirmDeleteProjOpen(true)}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold border border-rose-200 rounded-lg px-2.5 py-1.5 bg-rose-50"
                  >
                    Delete Project
                  </button>
                )}
              </div>
            </div>

            {showMemberDrawer && (
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Project Members ({members.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowMemberDrawer(false)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600"
                  >
                    Close
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {members.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900">{m.user.name}</p>
                        <p className="text-[10px] font-medium text-slate-500">{m.user.email}</p>
                        <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 uppercase">
                          {m.user.role} • {m.user.department}
                        </span>
                      </div>
                      {isPM && m.user_id !== user?.id && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(m.user_id)}
                          className="text-[10px] text-rose-600 hover:underline font-bold"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showAnalytics && <ProjectAnalyticsChart tasks={tasks} />}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="hidden sm:flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      fetchProjectTasks(projectId)
                    }}
                    placeholder="Search tasks..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-8 pr-7 py-1.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none transition"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("")
                        fetchProjectTasks(projectId)
                      }}
                      className="absolute right-2.5 top-2 text-xs font-bold text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <select
                  value={departmentFilter}
                  onChange={(e) => {
                    setDepartmentFilter(e.target.value)
                    fetchProjectTasks(projectId)
                  }}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs font-bold text-slate-700 focus:border-blue-600 focus:outline-none"
                >
                  <option value="">All Departments</option>
                  <option value="PRODUCT">PRODUCT</option>
                  <option value="UI_UX">UI_UX</option>
                  <option value="FRONTEND">FRONTEND</option>
                  <option value="BACKEND">BACKEND</option>
                  <option value="CLIENT">CLIENT</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as TaskStatus | "")
                    fetchProjectTasks(projectId)
                  }}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs font-bold text-slate-700 focus:border-blue-600 focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="TODO">TODO</option>
                  <option value="BLOCKED">BLOCKED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="DONE">DONE</option>
                </select>
              </div>

              <div className="sm:hidden flex items-center justify-between w-full">
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 flex items-center gap-1.5"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filter Tasks</span>
                </button>
                <span className="text-xs font-bold text-slate-500">{tasks.length} tasks</span>
              </div>

              <span className="hidden sm:block text-xs font-bold text-slate-500">
                Task Board ({tasks.length} tasks)
              </span>
            </div>

            <FilterDrawer
              isOpen={isMobileFilterOpen}
              onClose={() => setIsMobileFilterOpen(false)}
              onReset={() => {
                setSearch("")
                setDepartmentFilter("")
                setStatusFilter("")
                fetchProjectTasks(projectId)
              }}
            >
              <div className="space-y-3">
                <div>
                  <label htmlFor="mobile-task-search-input" className="block text-xs font-bold text-slate-700 mb-1">Search</label>
                  <input
                    id="mobile-task-search-input"
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      fetchProjectTasks(projectId)
                    }}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs"
                  />
                </div>
                <div>
                  <label htmlFor="mobile-dept-select" className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <select
                    id="mobile-dept-select"
                    value={departmentFilter}
                    onChange={(e) => {
                      setDepartmentFilter(e.target.value)
                      fetchProjectTasks(projectId)
                    }}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs"
                  >
                    <option value="">All Departments</option>
                    <option value="PRODUCT">PRODUCT</option>
                    <option value="UI_UX">UI_UX</option>
                    <option value="FRONTEND">FRONTEND</option>
                    <option value="BACKEND">BACKEND</option>
                    <option value="CLIENT">CLIENT</option>
                  </select>
                </div>
              </div>
            </FilterDrawer>

            {tasks.length === 0 ? (
              <EmptyState
                icon={<Kanban className="w-6 h-6 text-blue-600" />}
                title="No tasks found"
                description={
                  search || departmentFilter || statusFilter
                    ? "No tasks match your active filter criteria."
                    : "No tasks created in this project board yet."
                }
                actionLabel={isPM ? "+ Add Task" : undefined}
                onAction={isPM ? () => setIsCreateTaskModalOpen(true) : undefined}
              />
            ) : viewMode === "board" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                {BOARD_COLUMNS.map((col) => {
                  const colTasks = tasks.filter((t) => t.status === col.id)
                  const isDragTarget = dragOverColumnId === col.id

                  return (
                    <section
                      key={col.id}
                      aria-label={`${col.label} column`}
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.dataTransfer.dropEffect = "move"
                        if (dragOverColumnId !== col.id) setDragOverColumnId(col.id)
                      }}
                      onDragLeave={(e) => {
                        if (e.currentTarget.contains(e.relatedTarget as Node)) return
                        setDragOverColumnId(null)
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        setDragOverColumnId(null)
                        const taskId = e.dataTransfer.getData("text/plain") || draggedTaskId
                        if (taskId) {
                          const targetTask = tasks.find((t) => t.id === taskId)
                          if (targetTask && targetTask.status !== col.id) {
                            handleStatusChange(targetTask, col.id)
                          }
                        }
                      }}
                      className={`rounded-3xl border p-4 space-y-3 min-h-[420px] shadow-xs transition-all duration-150 ${col.color} ${
                        isDragTarget ? "border-2 border-dashed border-blue-500 bg-blue-50/40 ring-4 ring-blue-500/10" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                        <h3 className="text-xs font-black uppercase tracking-wider">{col.label}</h3>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${col.badgeColor}`}>
                          {colTasks.length}
                        </span>
                      </div>

                      {colTasks.length === 0 ? (
                        <div className="h-32 flex items-center justify-center text-[11px] font-semibold text-slate-400 border border-dashed border-slate-200/80 rounded-2xl">
                          Drag items here
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {colTasks.map((t: Task) => {
                            const isBeingDragged = draggedTaskId === t.id
                            return (
                              <article
                                key={t.id}
                                draggable={user?.role !== "CLIENT"}
                                onDragStart={(e) => {
                                  e.dataTransfer.setData("text/plain", t.id)
                                  setDraggedTaskId(t.id)
                                }}
                                onDragEnd={() => {
                                  setDraggedTaskId(null)
                                  setDragOverColumnId(null)
                                }}
                                className={`rounded-2xl border border-slate-200/80 bg-white p-4 space-y-3 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-grab active:cursor-grabbing ${
                                  isBeingDragged ? "opacity-40 scale-95 ring-2 ring-blue-500 shadow-xl" : ""
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{t.title}</h4>
                                  {t.client_visible && (
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 uppercase shrink-0">
                                      Client
                                    </span>
                                  )}
                                </div>

                                <p className="text-[11px] font-medium text-slate-500 line-clamp-2">
                                  {t.description || "No description provided."}
                                </p>

                                <div className="flex items-center flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                                    {t.department}
                                  </span>
                                  <span
                                    className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                                      t.priority === "URGENT"
                                        ? "bg-rose-50 text-rose-700 border-rose-200"
                                        : t.priority === "HIGH"
                                          ? "bg-amber-50 text-amber-700 border-amber-200"
                                          : t.priority === "LOW"
                                            ? "bg-slate-50 text-slate-600 border-slate-200"
                                            : "bg-blue-50 text-blue-700 border-blue-200"
                                    }`}
                                  >
                                    {t.priority || "MEDIUM"}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pt-2 border-t border-slate-100">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedTaskForAttachments(t)}
                                    className="hover:text-blue-600 transition flex items-center gap-1"
                                    title="Files"
                                  >
                                    <Paperclip className="w-3 h-3" />
                                    <span>Files</span>
                                  </button>

                                  <span className="text-slate-200">•</span>

                                  <button
                                    type="button"
                                    onClick={() => setSelectedTaskForAudit(t)}
                                    className="hover:text-blue-600 transition flex items-center gap-1"
                                    title="History"
                                  >
                                    <History className="w-3 h-3" />
                                    <span>Audit</span>
                                  </button>

                                  <span className="text-slate-200">•</span>

                                  <button
                                    type="button"
                                    onClick={() => setSelectedTaskForDeps(t)}
                                    className="hover:text-blue-600 transition flex items-center gap-1"
                                    title="Dependencies"
                                  >
                                    <GitCommit className="w-3 h-3" />
                                    <span>Deps</span>
                                  </button>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                  <select
                                    value={t.status}
                                    disabled={user?.role === "CLIENT"}
                                    onChange={(e) => handleStatusChange(t, e.target.value as TaskStatus)}
                                    className="text-[10px] font-bold bg-slate-50 text-slate-800 rounded-lg px-2 py-1 border border-slate-200 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                                  >
                                    <option value="TODO">TODO</option>
                                    <option value="BLOCKED">BLOCKED</option>
                                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                                    <option value="DONE" disabled={!canMoveToDone(user, t)}>
                                      DONE {!canMoveToDone(user, t) ? "(No PM)" : ""}
                                    </option>
                                  </select>

                                  {isPM && (
                                    <button
                                      type="button"
                                      onClick={() => setTaskToDelete(t.id)}
                                      className="text-[10px] font-bold text-rose-600 hover:underline"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </article>
                            )
                          })}
                        </div>
                      )}
                    </section>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Task Title</th>
                      <th className="p-4">Department</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Client Visible</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {tasks.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-4 font-bold text-slate-900">{t.title}</td>
                        <td className="p-4">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {t.department}
                          </span>
                        </td>
                        <td className="p-4">
                          <select
                            value={t.status}
                            disabled={user?.role === "CLIENT"}
                            onChange={(e) => handleStatusChange(t, e.target.value as TaskStatus)}
                            className="text-xs font-bold bg-slate-50 text-slate-800 rounded-lg px-2.5 py-1 border border-slate-200 focus:outline-none"
                          >
                            <option value="TODO">TODO</option>
                            <option value="BLOCKED">BLOCKED</option>
                            <option value="IN_PROGRESS">IN_PROGRESS</option>
                            <option value="DONE" disabled={!canMoveToDone(user, t)}>
                              DONE
                            </option>
                          </select>
                        </td>
                        <td className="p-4 text-slate-500">{t.client_visible ? "Yes" : "No"}</td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => setSelectedTaskForAttachments(t)}
                            className="text-xs font-bold text-blue-600 hover:underline"
                          >
                            Files
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedTaskForAudit(t)}
                            className="text-xs font-bold text-blue-600 hover:underline"
                          >
                            Audit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}
      </div>

      <AddMemberModal
        projectId={projectId}
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
      />

      <CreateTaskModal
        projectId={projectId}
        members={members}
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
      />

      <TaskDependenciesModal
        task={selectedTaskForDeps}
        availableTasks={tasks}
        isOpen={Boolean(selectedTaskForDeps)}
        onClose={() => setSelectedTaskForDeps(null)}
        onDependencyChanged={() => fetchProjectTasks(projectId)}
      />

      <TaskAuditLogsModal
        task={selectedTaskForAudit}
        isOpen={Boolean(selectedTaskForAudit)}
        onClose={() => setSelectedTaskForAudit(null)}
      />

      <TaskAttachmentsModal
        task={selectedTaskForAttachments}
        isOpen={Boolean(selectedTaskForAttachments)}
        onClose={() => setSelectedTaskForAttachments(null)}
      />

      <ConfirmationModal
        isOpen={isConfirmDeleteProjOpen}
        title="Delete Project?"
        message="Are you sure you want to soft delete this project? Tasks and data will be archived."
        confirmText="Delete Project"
        isDanger={true}
        onConfirm={handleDeleteProjectConfirmed}
        onClose={() => setIsConfirmDeleteProjOpen(false)}
      />

      <ConfirmationModal
        isOpen={Boolean(taskToDelete)}
        title="Delete Task?"
        message="Are you sure you want to soft delete this task? This action cannot be undone."
        confirmText="Delete Task"
        isDanger={true}
        onConfirm={handleDeleteTaskConfirmed}
        onClose={() => setTaskToDelete(null)}
      />
    </AppLayout>
  )
}
