"use client"

import { useCallback, useEffect, useState } from "react"
import { api } from "../lib/api"
import type { TaskAttachment } from "../types/attachment"
import type { Task } from "../types/task"

interface TaskAttachmentsModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
}

export function TaskAttachmentsModal({ task, isOpen, onClose }: TaskAttachmentsModalProps) {
  const [attachments, setAttachments] = useState<TaskAttachment[]>([])
  const [fileName, setFileName] = useState("")
  const [fileUrl, setFileUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAttachments = useCallback(async () => {
    if (!task) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await api.get<TaskAttachment[]>(`/tasks/${task.id}/attachments`)
      setAttachments(res.data)
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error ||
            "Failed to fetch attachments"
          : "Failed to fetch attachments"
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [task])

  useEffect(() => {
    if (isOpen && task) {
      fetchAttachments()
      setFileName("")
      setFileUrl("")
    }
  }, [isOpen, task, fetchAttachments])

  const handleAddAttachment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!task || !fileName || !fileUrl) return
    setIsSubmitting(true)
    setError(null)
    try {
      await api.post(`/tasks/${task.id}/attachments`, {
        fileName,
        fileUrl,
      })
      setFileName("")
      setFileUrl("")
      await fetchAttachments()
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error ||
            "Failed to add attachment"
          : "Failed to add attachment"
      setError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!window.confirm("Soft delete this attachment?")) return
    try {
      await api.delete(`/tasks/attachments/${attachmentId}`)
      await fetchAttachments()
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error ||
            "Failed to delete attachment"
          : "Failed to delete attachment"
      setError(msg)
    }
  }

  if (!isOpen || !task) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Task Attachments</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Task: <span className="text-indigo-400 font-semibold">{task.title}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleAddAttachment} className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <h3 className="text-xs font-bold text-slate-200">Add New Attachment</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="File Name (e.g., design_mockup.png)"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              required
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="File URL (e.g., https://...)"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              required
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition"
          >
            {isSubmitting ? "Uploading..." : "+ Attach File"}
          </button>
        </form>

        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : attachments.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            No attachments added to this task yet.
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-950 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold">
                    📄
                  </div>
                  <div>
                    <a
                      href={att.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-indigo-400 hover:underline"
                    >
                      {att.file_name}
                    </a>
                    <p className="text-[10px] text-slate-400">
                      Uploaded by {att.uploader.name} on {new Date(att.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteAttachment(att.id)}
                  className="text-xs text-red-400 hover:text-red-300 font-medium px-2 py-1 border border-red-500/20 rounded"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
