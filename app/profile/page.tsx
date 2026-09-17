"use client"

import { Building2, Key, Lock, Mail, Save, Shield, User as UserIcon } from "lucide-react"
import { useState } from "react"
import { AppLayout } from "../../components/layout/app-layout"
import { useAuthStore } from "../../stores/auth.store"
import { useToastStore } from "../../stores/toast.store"
import type { Department } from "../../types/auth"

export default function ProfileSettingsPage() {
  const { user, updateProfile } = useAuthStore()
  const { addToast } = useToastStore()

  const [activeTab, setActiveTab] = useState<"personal" | "security">("personal")

  // Personal Info Form State
  const [name, setName] = useState(user?.name || "")
  const [department, setDepartment] = useState<Department>(user?.department || "FRONTEND")
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [securityError, setSecurityError] = useState<string | null>(null)

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSavingProfile(true)
    try {
      await updateProfile({ name: name.trim(), department })
      addToast({
        title: "Profile Updated",
        message: "Your profile information has been saved successfully.",
        type: "success",
      })
    } catch {
      addToast({
        title: "Update Failed",
        message: "Failed to update profile details.",
        type: "error",
      })
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault()
    setSecurityError(null)

    if (!currentPassword || !newPassword || !confirmPassword) {
      setSecurityError("Please fill in all password fields.")
      return
    }

    if (newPassword.length < 8) {
      setSecurityError("New password must be at least 8 characters long.")
      return
    }

    if (newPassword !== confirmPassword) {
      setSecurityError("New password and confirm password do not match.")
      return
    }

    setIsUpdatingPassword(true)
    setTimeout(() => {
      addToast({
        title: "Password Changed",
        message: "Your account password has been updated successfully.",
        type: "success",
      })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setIsUpdatingPassword(false)
    }, 400)
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Banner Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white font-black text-xl shadow-lg shadow-blue-600/20 shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{user?.name || "User Profile"}</h1>
              <p className="text-xs font-medium text-slate-500 mt-0.5 flex items-center gap-2">
                <span>{user?.email}</span>
                <span>•</span>
                <span className="font-bold text-blue-600 uppercase">{user?.role} Role</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("personal")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === "personal"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Personal Info
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("security")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === "security"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Security
            </button>
          </div>
        </div>

        {/* Tab 1: Personal Info Form */}
        {activeTab === "personal" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-3xl border border-slate-200/80 bg-white p-6 space-y-5 shadow-xs">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-blue-600" /> Personal Account Details
                </h2>
                <p className="text-xs text-slate-500 font-medium">Update your public display name and team department affiliation.</p>
              </div>

              <form onSubmit={handleSavePersonal} className="space-y-4">
                <div>
                  <label htmlFor="profile-name" className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none transition"
                  />
                </div>

                <div>
                  <label htmlFor="profile-email" className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address (Read-only)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      id="profile-email"
                      type="email"
                      disabled
                      value={user?.email || ""}
                      className="w-full rounded-xl border border-slate-200 bg-slate-100/70 pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="profile-dept" className="block text-xs font-bold text-slate-700 mb-1">
                    Department Affiliation
                  </label>
                  <select
                    id="profile-dept"
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

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingProfile || !name.trim()}
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition disabled:opacity-50 shadow-sm shadow-blue-600/20 flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingProfile ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Sidebar Summary Card */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 space-y-4 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" /> Account Overview
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Role Permission</span>
                  <p className="font-bold text-slate-900">{user?.role} Access Level</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Company Workspace</span>
                  <p className="font-bold text-slate-900 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" /> NodeWave Workspace
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Security & Password Form */}
        {activeTab === "security" && (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 space-y-5 shadow-xs max-w-2xl">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" /> Update Account Password
              </h2>
              <p className="text-xs text-slate-500 font-medium">Ensure your account is using a strong, unique password.</p>
            </div>

            {securityError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                {securityError}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label htmlFor="current-pass" className="block text-xs font-bold text-slate-700 mb-1">
                  Current Password <span className="text-rose-500">*</span>
                </label>
                <input
                  id="current-pass"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-medium text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none transition"
                />
              </div>

              <div>
                <label htmlFor="new-pass" className="block text-xs font-bold text-slate-700 mb-1">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <input
                  id="new-pass"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-medium text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none transition"
                />
              </div>

              <div>
                <label htmlFor="confirm-pass" className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <input
                  id="confirm-pass"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-medium text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none transition"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition disabled:opacity-50 shadow-sm shadow-blue-600/20 flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{isUpdatingPassword ? "Updating..." : "Update Password"}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
