"use client"

import { useEffect, useState } from "react"
import { api } from "../lib/api"
import { useProjectStore } from "../stores/project.store"
import { useToastStore } from "../stores/toast.store"

interface CompanyUser {
  id: string
  name: string
  email: string
  role: string
  department: string
}

interface AddMemberModalProps {
  projectId: string
  isOpen: boolean
  onClose: () => void
}

export function AddMemberModal({ projectId, isOpen, onClose }: AddMemberModalProps) {
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([])
  const [selectedUserId, setSelectedUserId] = useState("")
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const { addMember, isLoading, error } = useProjectStore()
  const { addToast } = useToastStore()

  useEffect(() => {
    if (isOpen) {
      setIsLoadingUsers(true)
      api
        .get<CompanyUser[]>("/auth/company-users")
        .then((res) => {
          setCompanyUsers(res.data)
          if (res.data.length > 0) {
            setSelectedUserId(res.data[0].id)
          }
        })
        .catch(() => {
          addToast({ title: "Fetch Error", message: "Failed to load company users.", type: "error" })
        })
        .finally(() => setIsLoadingUsers(false))
    }
  }, [isOpen, addToast])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserId) return

    try {
      await addMember(projectId, selectedUserId)
      addToast({ title: "Member Added", message: "User added to project team successfully.", type: "success" })
      onClose()
    } catch {
      addToast({ title: "Failed to Add Member", message: "User could not be added.", type: "error" })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900">Add Team Member</h2>
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
            <label htmlFor="select-user-id" className="block text-xs font-bold text-slate-700 mb-1">
              Select Company User
            </label>
            {isLoadingUsers ? (
              <div className="p-3 text-xs font-semibold text-slate-400">Loading company users...</div>
            ) : (
              <select
                id="select-user-id"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-bold text-slate-700 focus:border-blue-600 focus:outline-none"
              >
                {companyUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.email} ({u.role} • {u.department})
                  </option>
                ))}
              </select>
            )}
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
              disabled={isLoading || !selectedUserId}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition disabled:opacity-50 shadow-sm shadow-blue-600/20"
            >
              {isLoading ? "Adding..." : "Add to Team"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
