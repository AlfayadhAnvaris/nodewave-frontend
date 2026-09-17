"use client"

import React, { useState } from "react"
import { useToastStore } from "../stores/toast.store"
import type { Department, Role } from "../types/auth"

interface InviteUserModalProps {
  isOpen: boolean
  onClose: () => void
  onUserInvited?: (user: { name: string; email: string; role: Role; department: Department }) => void
}

export function InviteUserModal({ isOpen, onClose, onUserInvited }: InviteUserModalProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<Role>("INTERNAL")
  const [department, setDepartment] = useState<Department>("FRONTEND")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { addToast } = useToastStore()

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return

    setIsSubmitting(true)
    setTimeout(() => {
      if (onUserInvited) {
        onUserInvited({ name: name.trim(), email: email.trim(), role, department })
      }
      addToast({
        title: "User Invited",
        message: `Workspace invitation sent to ${email}.`,
        type: "success",
      })
      setName("")
      setEmail("")
      setRole("INTERNAL")
      setDepartment("FRONTEND")
      setIsSubmitting(false)
      onClose()
    }, 400)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900">Invite Workspace User</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="invite-name-input" className="block text-xs font-bold text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="invite-name-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Michael Scott"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none transition"
            />
          </div>

          <div>
            <label htmlFor="invite-email-input" className="block text-xs font-bold text-slate-700 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              id="invite-email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. michael@company.com"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="invite-role-input" className="block text-xs font-bold text-slate-700 mb-1">
                Workspace Role
              </label>
              <select
                id="invite-role-input"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-bold text-slate-700 focus:border-blue-600 focus:outline-none"
              >
                <option value="INTERNAL">INTERNAL (Team Member)</option>
                <option value="PM">PM (Project Manager)</option>
                <option value="CLIENT">CLIENT (Guest Portal)</option>
              </select>
            </div>

            <div>
              <label htmlFor="invite-dept-input" className="block text-xs font-bold text-slate-700 mb-1">
                Department
              </label>
              <select
                id="invite-dept-input"
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
              disabled={isSubmitting || !name.trim() || !email.trim()}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition disabled:opacity-50 shadow-sm shadow-blue-600/20"
            >
              {isSubmitting ? "Inviting..." : "Send Invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
