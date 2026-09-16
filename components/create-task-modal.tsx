"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { type CreateTaskFormData, createTaskSchema } from "../schemas/task.schema"
import { useTaskStore } from "../stores/task.store"
import type { ProjectMember } from "../types/project"

interface Props {
  projectId: string
  members: ProjectMember[]
  isOpen: boolean
  onClose: () => void
}

export function CreateTaskModal({ projectId, members, isOpen, onClose }: Props) {
  const { createTask } = useTaskStore()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      department: "FRONTEND",
      clientVisible: false,
    },
  })

  if (!isOpen) return null

  const onSubmit = async (data: CreateTaskFormData) => {
    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      await createTask(projectId, data)
      reset()
      onClose()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage("Failed to create task")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-lg font-bold text-slate-100">Create New Task</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label htmlFor="task-title" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Task Title
            </label>
            <input
              id="task-title"
              type="text"
              {...register("title")}
              className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              placeholder="e.g., Implement Auth Middleware"
            />
            {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
          </div>

          <div>
            <label htmlFor="task-desc" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Description
            </label>
            <textarea
              id="task-desc"
              rows={3}
              {...register("description")}
              className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              placeholder="Task details and scope..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-dept" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Department
              </label>
              <select
                id="task-dept"
                {...register("department")}
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              >
                <option value="PRODUCT">PRODUCT</option>
                <option value="UI_UX">UI_UX</option>
                <option value="FRONTEND">FRONTEND</option>
                <option value="BACKEND">BACKEND</option>
                <option value="CLIENT">CLIENT</option>
              </select>
            </div>

            <div>
              <label htmlFor="task-assignee" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Assignee
              </label>
              <select
                id="task-assignee"
                {...register("assigneeId")}
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user.id} value={m.user.id}>
                    {m.user.name} ({m.user.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              id="task-client-visible"
              type="checkbox"
              {...register("clientVisible")}
              className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="task-client-visible" className="text-xs font-medium text-slate-300">
              Visible to Client Guest
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
