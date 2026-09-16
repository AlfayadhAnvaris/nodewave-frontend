"use client"

import { useEffect, useState } from "react"
import { api } from "../lib/api"
import { useAuthStore } from "../stores/auth.store"
import type { Task } from "../types/task"

interface DependencyItem {
  id: string
  task_id: string
  depends_on_task_id: string
  depends_on_task: {
    id: string
    title: string
    status: string
    department: string
  }
}

interface Props {
  task: Task | null
  availableTasks: Task[]
  isOpen: boolean
  onClose: () => void
  onDependencyChanged: () => void
}

export function TaskDependenciesModal({
  task,
  availableTasks,
  isOpen,
  onClose,
  onDependencyChanged,
}: Props) {
  const { user } = useAuthStore()
  const [dependencies, setDependencies] = useState<DependencyItem[]>([])
  const [selectedPrereqId, setSelectedPrereqId] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const isPM = user?.role === "PM"

  useEffect(() => {
    if (task && isOpen) {
      setIsLoading(true)
      api
        .get<DependencyItem[]>(`/tasks/${task.id}/dependencies`)
        .then((res) => setDependencies(res.data))
        .catch(() => setDependencies([]))
        .finally(() => setIsLoading(false))
    }
  }, [task, isOpen])

  if (!isOpen || !task) return null

  const candidateTasks = availableTasks.filter(
    (t) =>
      t.id !== task.id &&
      !dependencies.some((d) => d.depends_on_task_id === t.id),
  )

  const handleAddDependency = async () => {
    if (!selectedPrereqId) return
    setErrorMessage(null)
    try {
      await api.post(`/tasks/${task.id}/dependencies`, {
        dependsOnTaskId: selectedPrereqId,
      })
      const res = await api.get<DependencyItem[]>(`/tasks/${task.id}/dependencies`)
      setDependencies(res.data)
      setSelectedPrereqId("")
      onDependencyChanged()
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } }
        setErrorMessage(axiosErr.response?.data?.error || "Failed to add dependency")
      } else {
        setErrorMessage("Failed to add dependency")
      }
    }
  }

  const handleRemoveDependency = async (dependencyId: string) => {
    setErrorMessage(null)
    try {
      await api.delete(`/tasks/${task.id}/dependencies/${dependencyId}`)
      const res = await api.get<DependencyItem[]>(`/tasks/${task.id}/dependencies`)
      setDependencies(res.data)
      onDependencyChanged()
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } }
        setErrorMessage(axiosErr.response?.data?.error || "Failed to remove dependency")
      } else {
        setErrorMessage("Failed to remove dependency")
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-100">Task Dependencies</h3>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-sm">&quot;{task.title}&quot;</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {errorMessage && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            {errorMessage}
          </div>
        )}

        {isPM && (
          <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
            <label htmlFor="prereq-select" className="block text-xs font-semibold text-slate-300">
              Add Prerequisite Task (Task &quot;{task.title}&quot; will depend on this)
            </label>
            <div className="flex gap-2">
              <select
                id="prereq-select"
                value={selectedPrereqId}
                onChange={(e) => setSelectedPrereqId(e.target.value)}
                className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-100 focus:outline-none"
              >
                <option value="">Select Prerequisite Task...</option>
                {candidateTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.department} - {t.status})
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!selectedPrereqId}
                onClick={handleAddDependency}
                className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-40"
              >
                Add
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Current Prerequisites ({dependencies.length})
          </h4>

          {isLoading ? (
            <p className="text-xs text-slate-500 py-4 text-center">Loading dependencies...</p>
          ) : dependencies.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">No prerequisite dependencies set.</p>
          ) : (
            <div className="space-y-2">
              {dependencies.map((dep) => (
                <div
                  key={dep.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/80"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{dep.depends_on_task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300">
                        {dep.depends_on_task.department}
                      </span>
                      <span
                        className={`text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase ${
                          dep.depends_on_task.status === "DONE"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {dep.depends_on_task.status}
                      </span>
                    </div>
                  </div>

                  {isPM && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDependency(dep.id)}
                      className="text-xs text-red-400 hover:text-red-300 font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-4 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
