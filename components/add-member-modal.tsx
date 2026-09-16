"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { api } from "../lib/api"
import { type AddMemberFormData, addMemberSchema } from "../schemas/project.schema"
import { useProjectStore } from "../stores/project.store"
import type { User } from "../types/auth"

interface Props {
  projectId: string
  isOpen: boolean
  onClose: () => void
}

export function AddMemberModal({ projectId, isOpen, onClose }: Props) {
  const { addMember } = useProjectStore()
  const [companyUsers, setCompanyUsers] = useState<User[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddMemberFormData>({
    resolver: zodResolver(addMemberSchema),
  })

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get<User[]>("/auth/company-users")
      setCompanyUsers(res.data)
    } catch (_err) {
      setCompanyUsers([])
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchUsers()
    }
  }, [isOpen, fetchUsers])

  if (!isOpen) return null

  const onSubmit = async (data: AddMemberFormData) => {
    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      await addMember(projectId, data.userId)
      reset()
      onClose()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage("Failed to add member")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-lg font-bold text-slate-100">Add Project Member</h3>
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
          {companyUsers.length > 0 && (
            <div>
              <label htmlFor="company-users-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Select Company User
              </label>
              <select
                id="company-users-select"
                onChange={(e) => setValue("userId", e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">-- Choose User --</option>
                {companyUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role} - {u.department})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="member-user-id" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              User ID (UUID)
            </label>
            <input
              id="member-user-id"
              type="text"
              {...register("userId")}
              className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              placeholder="Paste user UUID or select above..."
            />
            {errors.userId && <p className="mt-1 text-xs text-red-400">{errors.userId.message}</p>}
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
              {isSubmitting ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
