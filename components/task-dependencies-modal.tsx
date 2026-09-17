"use client"

import { useEffect, useState } from "react"
import { api } from "../lib/api"
import { useToastStore } from "../stores/toast.store"
import type { Task } from "../types/task"

interface DependencyItem {
  id: string
  task_id: string
  depends_on_task_id: string
  prerequisite: {
    id: string
    title: string
    status: string
    department: string
  }
}

interface TaskDependenciesModalProps {
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
}: TaskDependenciesModalProps) {
  const [dependencies, setDependencies] = useState<DependencyItem[]>([])
  const [selectedDepId, setSelectedDepId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { addToast } = useToastStore()

  useEffect(() => {
    if (isOpen && task) {
      setIsLoading(true)
      setError(null)
      api
        .get<DependencyItem[]>(`/tasks/${task.id}/dependencies`)
        .then((res) => {
          setDependencies(res.data)
        })
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : "Failed to load task dependencies"
          setError(msg)
        })
        .finally(() => setIsLoading(false))
    }
  }, [isOpen, task])

  if (!isOpen || !task) return null

  const potentialPrereqs = availableTasks.filter(
    (t) => t.id !== task.id && !dependencies.some((d) => d.depends_on_task_id === t.id)
  )

  const handleAddDependency = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDepId) return

    try {
      setError(null)
      await api.post(`/tasks/${task.id}/dependencies`, {
        depends_on_task_id: selectedDepId,
      })
      addToast({ title: "Dependency Added", message: "Prerequisite dependency created.", type: "success" })
      setSelectedDepId("")
      const res = await api.get<DependencyItem[]>(`/tasks/${task.id}/dependencies`)
      setDependencies(res.data)
      onDependencyChanged()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add dependency"
      setError(msg)
      addToast({ title: "Cycle Error", message: msg, type: "error" })
    }
  }

  const handleRemoveDependency = async (depTaskId: string) => {
    try {
      setError(null)
      await api.delete(`/tasks/${task.id}/dependencies/${depTaskId}`)
      addToast({ title: "Dependency Removed", message: "Prerequisite dependency removed.", type: "info" })
      setDependencies(dependencies.filter((d) => d.depends_on_task_id !== depTaskId))
      onDependencyChanged()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to remove dependency"
      setError(msg)
      addToast({ title: "Remove Error", message: msg, type: "error" })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Task Dependencies</h2>
            <p className="text-xs text-slate-500 font-medium">Prerequisites for "{task.title}"</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleAddDependency} className="flex gap-2">
          <select
            value={selectedDepId}
            onChange={(e) => setSelectedDepId(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 p-2 text-xs font-bold text-slate-700 focus:border-blue-600 focus:outline-none"
          >
            <option value="">Select prerequisite task...</option>
            {potentialPrereqs.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.status})
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!selectedDepId}
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            + Add
          </button>
        </form>

        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Prerequisites</h3>

          {isLoading ? (
            <div className="text-xs font-semibold text-slate-400 py-4 text-center">Loading dependencies...</div>
          ) : dependencies.length === 0 ? (
            <div className="text-xs font-medium text-slate-400 py-4 text-center">No prerequisite dependencies set.</div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {dependencies.map((dep) => (
                <div
                  key={dep.id}
                  className="flex items-center justify-between p-3 rounded-2xl border border-slate-200/80 bg-slate-50/50"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">{dep.prerequisite.title}</p>
                    <span className="text-[10px] font-bold text-slate-500">Status: {dep.prerequisite.status}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveDependency(dep.depends_on_task_id)}
                    className="text-[10px] font-bold text-rose-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
