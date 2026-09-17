"use client"

import { useState } from "react"
import { useTaskStore } from "../stores/task.store"
import { useToastStore } from "../stores/toast.store"
import type { Department } from "../types/auth"
import type { ProjectMember } from "../types/project"

interface CreateTaskModalProps {
  projectId: string
  members: ProjectMember[]
  isOpen: boolean
  onClose: () => void
}

export function CreateTaskModal({ projectId, members, isOpen, onClose }: CreateTaskModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [department, setDepartment] = useState<Department>("FRONTEND")
  const [priority, setPriority] = useState<"URGENT" | "HIGH" | "MEDIUM" | "LOW">("MEDIUM")
  const [assigneeId, setAssigneeId] = useState("")
  const [clientVisible, setClientVisible] = useState(false)
  const { createTask, isLoading, error } = useTaskStore()
  const { addToast } = useToastStore()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      await createTask(projectId, {
        title: title.trim(),
        description: description.trim() || undefined,
        department,
        assigneeId: assigneeId || undefined,
        clientVisible,
        priority,
      } as any)
      addToast({ title: "Task Created", message: `Task "${title}" was created successfully.`, type: "success" })
      setTitle("")
      setDescription("")
      setAssigneeId("")
      setPriority("MEDIUM")
      setClientVisible(false)
      onClose()
    } catch {
      addToast({ title: "Task Creation Failed", message: "Failed to create task.", type: "error" })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900">Create New Task</h2>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="task-title-input" className="block text-xs font-bold text-slate-700 mb-1">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="task-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Audit Q3 Performance Statements"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none transition"
            />
          </div>

          <div>
            <label htmlFor="task-desc-input" className="block text-xs font-bold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              id="task-desc-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed task description..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label htmlFor="task-dept-input" className="block text-xs font-bold text-slate-700 mb-1">
                Department
              </label>
              <select
                id="task-dept-input"
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-bold text-slate-700 focus:border-blue-600 focus:outline-none"
              >
                <option value="PRODUCT">PRODUCT</option>
                <option value="UI_UX">UI_UX</option>
                <option value="FRONTEND">FRONTEND</option>
                <option value="BACKEND">BACKEND</option>
                <option value="CLIENT">CLIENT</option>
              </select>
            </div>

            <div>
              <label htmlFor="task-priority-input" className="block text-xs font-bold text-slate-700 mb-1">
                Priority SLA
              </label>
              <select
                id="task-priority-input"
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-bold text-slate-700 focus:border-blue-600 focus:outline-none"
              >
                <option value="URGENT">🔴 URGENT</option>
                <option value="HIGH">🟠 HIGH</option>
                <option value="MEDIUM">🔵 MEDIUM</option>
                <option value="LOW">⚪ LOW</option>
              </select>
            </div>

            <div>
              <label htmlFor="task-assignee-input" className="block text-xs font-bold text-slate-700 mb-1">
                Assignee
              </label>
              <select
                id="task-assignee-input"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-bold text-slate-700 focus:border-blue-600 focus:outline-none"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.user_id}>
                    {m.user.name} ({m.user.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="client_visible"
              type="checkbox"
              checked={clientVisible}
              onChange={(e) => setClientVisible(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="client_visible" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Visible to Client Portal
            </label>
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition disabled:opacity-50 shadow-sm shadow-blue-600/20"
            >
              {isLoading ? "Saving..." : "Save Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
