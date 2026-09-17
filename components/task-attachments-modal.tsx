"use client"

import { FileText, X } from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "../lib/api"
import { formatDate } from "../lib/formatters"
import { useToastStore } from "../stores/toast.store"
import type { Task } from "../types/task"

interface AttachmentItem {
  id: string
  task_id: string
  uploaded_by: string
  file_name: string
  file_url: string
  created_at: string
  uploader: {
    name: string
    email: string
  }
}

interface TaskAttachmentsModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
}

export function TaskAttachmentsModal({ task, isOpen, onClose }: TaskAttachmentsModalProps) {
  const [attachments, setAttachments] = useState<AttachmentItem[]>([])
  const [fileName, setFileName] = useState("")
  const [fileUrl, setFileUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { addToast } = useToastStore()

  useEffect(() => {
    if (isOpen && task) {
      setIsLoading(true)
      setError(null)
      api
        .get<AttachmentItem[]>(`/tasks/${task.id}/attachments`)
        .then((res) => setAttachments(res.data))
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : "Failed to load attachments"
          setError(msg)
        })
        .finally(() => setIsLoading(false))
    }
  }, [isOpen, task])

  if (!isOpen || !task) return null

  const handleAddAttachment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fileName.trim() || !fileUrl.trim()) return

    try {
      setIsUploading(true)
      setError(null)
      await api.post(`/tasks/${task.id}/attachments`, {
        file_name: fileName.trim(),
        file_url: fileUrl.trim(),
      })
      addToast({ title: "Attachment Added", message: `File "${fileName}" attached successfully.`, type: "success" })
      setFileName("")
      setFileUrl("")
      const res = await api.get<AttachmentItem[]>(`/tasks/${task.id}/attachments`)
      setAttachments(res.data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload attachment"
      setError(msg)
      addToast({ title: "Upload Failed", message: msg, type: "error" })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      setError(null)
      await api.delete(`/tasks/attachments/${attachmentId}`)
      addToast({ title: "Attachment Deleted", message: "Attachment soft deleted.", type: "info" })
      setAttachments(attachments.filter((a) => a.id !== attachmentId))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete attachment"
      setError(msg)
      addToast({ title: "Delete Failed", message: msg, type: "error" })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Task Attachments</h2>
            <p className="text-xs font-medium text-slate-500">File attachments for "{task.title}"</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 transition"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleAddAttachment} className="space-y-3 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
          <h3 className="text-xs font-bold text-slate-700">Attach New File</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              required
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="File Title (e.g. Q3 Receipt)"
              className="rounded-xl border border-slate-200 bg-white p-2 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
            />
            <input
              type="url"
              required
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="File URL (https://...)"
              className="rounded-xl border border-slate-200 bg-white p-2 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUploading || !fileName.trim() || !fileUrl.trim()}
              className="rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isUploading ? "Attaching..." : "+ Attach File"}
            </button>
          </div>
        </form>

        {isLoading ? (
          <div className="text-xs font-semibold text-slate-400 py-6 text-center">Loading attachments...</div>
        ) : attachments.length === 0 ? (
          <div className="text-xs font-medium text-slate-400 py-6 text-center">No attachments added to this task yet.</div>
        ) : (
          <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 text-xs font-bold shrink-0">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <a
                      href={att.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      {att.file_name}
                    </a>
                    <p className="text-[10px] font-semibold text-slate-400">
                      Uploaded by {att.uploader.name} on {formatDate(att.created_at)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteAttachment(att.id)}
                  className="text-[10px] font-bold text-rose-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

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
