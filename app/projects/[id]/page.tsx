"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AddMemberModal } from "../../../components/add-member-modal"
import { CreateTaskModal } from "../../../components/create-task-modal"
import { NavHeader } from "../../../components/nav-header"
import { TaskDependenciesModal } from "../../../components/task-dependencies-modal"
import { canMoveToDone } from "../../../lib/policies"
import { useAuthStore } from "../../../stores/auth.store"
import { useProjectStore } from "../../../stores/project.store"
import { useTaskStore } from "../../../stores/task.store"
import type { Task, TaskStatus } from "../../../types/task"

const BOARD_COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: "TODO", label: "To Do", color: "border-slate-700 bg-slate-900/40 text-slate-300" },
  { id: "BLOCKED", label: "Blocked", color: "border-red-500/30 bg-red-500/5 text-red-400" },
  { id: "IN_PROGRESS", label: "In Progress", color: "border-amber-500/30 bg-amber-500/5 text-amber-400" },
  { id: "DONE", label: "Done", color: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400" },
]

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const { user } = useAuthStore()

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
  } = useTaskStore()

  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false)
  const [selectedTaskForDeps, setSelectedTaskForDeps] = useState<Task | null>(null)
  const [showMemberDrawer, setShowMemberDrawer] = useState(false)
  const isPM = user?.role === "PM"

  useEffect(() => {
    if (projectId) {
      fetchProjectById(projectId)
      fetchMembers(projectId)
      fetchProjectTasks(projectId)
    }
  }, [projectId, fetchProjectById, fetchMembers, fetchProjectTasks])

  const handleDeleteProject = async () => {
    if (window.confirm("Are you sure you want to delete (soft delete) this project?")) {
      try {
        await deleteProject(projectId)
        router.push("/projects")
      } catch (_err) {
        return
      }
    }
  }

  const handleRemoveMember = async (memberUserId: string) => {
    if (window.confirm("Remove this user from the project?")) {
      try {
        await removeMember(projectId, memberUserId)
      } catch (_err) {
        return
      }
    }
  }

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    if (newStatus === "DONE" && !canMoveToDone(user, task)) {
      alert("Product Managers are rejected from directly completing tasks. Only assigned executors can set status to DONE.")
      return
    }

    try {
      await updateTask(task.id, { status: newStatus })
      await fetchProjectTasks(projectId)
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message)
      }
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm("Soft delete this task?")) {
      try {
        await deleteTask(taskId)
      } catch (err: unknown) {
        if (err instanceof Error) {
          alert(err.message)
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <NavHeader />

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/projects" className="hover:text-indigo-400 transition">
              Projects
            </Link>
            <span>/</span>
            <span className="text-slate-200 font-medium">{activeProject?.name || "Detail"}</span>
          </div>

          <div className="flex items-center gap-3">
            {isPM && (
              <button
                type="button"
                onClick={() => setIsCreateTaskModalOpen(true)}
                className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
              >
                + Create Task
              </button>
            )}
          </div>
        </div>

        {(projectError || taskError) && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-400">
            {projectError || taskError}
          </div>
        )}

        {isProjectLoading && !activeProject ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          </div>
        ) : activeProject ? (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-100">{activeProject.name}</h1>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                      activeProject.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {activeProject.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {activeProject.description || "No description provided."}
                </p>
              </div>

              <div className="flex items-center gap-4">
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
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-indigo-300 ring-2 ring-slate-950"
                    >
                      {m.user.name.charAt(0)}
                    </div>
                  ))}
                </button>
                {isPM && (
                  <button
                    type="button"
                    onClick={() => setIsAddMemberModalOpen(true)}
                    className="text-xs text-indigo-400 hover:underline font-semibold"
                  >
                    + Add Member
                  </button>
                )}
                {isPM && (
                  <button
                    type="button"
                    onClick={handleDeleteProject}
                    className="text-xs text-red-400 hover:text-red-300 font-medium border border-red-500/20 rounded px-2 py-1"
                  >
                    Delete Project
                  </button>
                )}
              </div>
            </div>

            {showMemberDrawer && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200">Project Members ({members.length})</h3>
                  <button
                    type="button"
                    onClick={() => setShowMemberDrawer(false)}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    Close
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {members.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950"
                    >
                      <div>
                        <p className="text-xs font-semibold text-slate-200">{m.user.name}</p>
                        <p className="text-[10px] text-slate-400">{m.user.email}</p>
                        <span className="inline-block mt-1 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300">
                          {m.user.role} • {m.user.department}
                        </span>
                      </div>
                      {isPM && m.user_id !== user?.id && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(m.user_id)}
                          className="text-[10px] text-red-400 hover:text-red-300 font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    fetchProjectTasks(projectId)
                  }}
                  placeholder="Search tasks..."
                  className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none w-full sm:w-64"
                />

                <select
                  value={departmentFilter}
                  onChange={(e) => {
                    setDepartmentFilter(e.target.value)
                    fetchProjectTasks(projectId)
                  }}
                  className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">All Departments</option>
                  <option value="PRODUCT">PRODUCT</option>
                  <option value="UI_UX">UI_UX</option>
                  <option value="FRONTEND">FRONTEND</option>
                  <option value="BACKEND">BACKEND</option>
                  <option value="CLIENT">CLIENT</option>
                </select>
              </div>

              <span className="text-xs text-slate-400 font-medium">
                Task Board ({tasks.length} tasks)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
              {BOARD_COLUMNS.map((col) => {
                const colTasks = tasks.filter((t) => t.status === col.id)
                return (
                  <div
                    key={col.id}
                    className={`rounded-2xl border p-4 space-y-3 min-h-[400px] ${col.color}`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <h3 className="text-xs font-bold uppercase tracking-wider">{col.label}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {colTasks.length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {colTasks.map((t: Task) => (
                        <div
                          key={t.id}
                          className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-3 shadow-lg hover:border-slate-700 transition"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-bold text-slate-100">{t.title}</h4>
                            {t.client_visible && (
                              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                Client
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-slate-400 line-clamp-2">
                            {t.description || "No description."}
                          </p>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300">
                              {t.department}
                            </span>

                            <button
                              type="button"
                              onClick={() => setSelectedTaskForDeps(t)}
                              className="text-[10px] font-medium text-slate-400 hover:text-indigo-300 flex items-center gap-1"
                            >
                              <span>Dependencies</span>
                            </button>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <select
                              value={t.status}
                              onChange={(e) => handleStatusChange(t, e.target.value as TaskStatus)}
                              className="text-[10px] bg-slate-800 text-slate-200 rounded px-2 py-1 border border-slate-700 focus:outline-none"
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
                                onClick={() => handleDeleteTask(t.id)}
                                className="text-[10px] text-red-400 hover:text-red-300"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : null}
      </main>

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
    </div>
  )
}
