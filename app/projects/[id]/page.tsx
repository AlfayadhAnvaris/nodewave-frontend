"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AddMemberModal } from "../../../components/add-member-modal"
import { NavHeader } from "../../../components/nav-header"
import { useAuthStore } from "../../../stores/auth.store"
import { useProjectStore } from "../../../stores/project.store"

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const { user } = useAuthStore()

  const {
    activeProject,
    members,
    isLoading,
    error,
    fetchProjectById,
    fetchMembers,
    removeMember,
    deleteProject,
  } = useProjectStore()

  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
  const isPM = user?.role === "PM"

  useEffect(() => {
    if (projectId) {
      fetchProjectById(projectId)
      fetchMembers(projectId)
    }
  }, [projectId, fetchProjectById, fetchMembers])

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <NavHeader />

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/projects" className="hover:text-indigo-400 transition">
            Projects
          </Link>
          <span>/</span>
          <span className="text-slate-200 font-medium">{activeProject?.name || "Detail"}</span>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-400">
            {error}
          </div>
        )}

        {isLoading && !activeProject ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          </div>
        ) : activeProject ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-100">{activeProject.name}</h1>
                    <p className="text-xs text-slate-400 font-mono mt-1">ID: {activeProject.id}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded uppercase tracking-wider ${
                      activeProject.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {activeProject.status}
                  </span>
                </div>

                <div className="border-t border-slate-800/80 pt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Description
                  </h3>
                  <p className="mt-1 text-sm text-slate-300">
                    {activeProject.description || "No description provided."}
                  </p>
                </div>

                <div className="border-t border-slate-800/80 pt-4 flex justify-between items-center text-xs text-slate-500">
                  <span>Created: {new Date(activeProject.created_at).toLocaleString()}</span>
                  {isPM && (
                    <button
                      type="button"
                      onClick={handleDeleteProject}
                      className="text-xs text-red-400 hover:text-red-300 font-medium transition"
                    >
                      Delete Project
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-100">Project Members ({members.length})</h3>
                  {isPM && (
                    <button
                      type="button"
                      onClick={() => setIsAddMemberModalOpen(true)}
                      className="text-xs text-indigo-400 hover:underline font-semibold"
                    >
                      + Add Member
                    </button>
                  )}
                </div>

                <div className="space-y-3 pt-2">
                  {members.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-800/80 bg-slate-900/80"
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
                          className="text-[10px] text-slate-500 hover:text-red-400 font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      <AddMemberModal
        projectId={projectId}
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
      />
    </div>
  )
}
