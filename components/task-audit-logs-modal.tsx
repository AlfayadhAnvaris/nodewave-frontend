"use client"

import { useEffect, useState } from "react"
import { api } from "../lib/api"
import { formatDate } from "../lib/formatters"
import type { Task } from "../types/task"

interface AuditLog {
  id: string
  task_id: string
  user_id: string
  changed_column: string
  old_value: string | null
  new_value: string | null
  created_at: string
  user: {
    name: string
    email: string
    role: string
  }
}

interface TaskAuditLogsModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
}

export function TaskAuditLogsModal({ task, isOpen, onClose }: TaskAuditLogsModalProps) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && task) {
      setIsLoading(true)
      setError(null)
      api
        .get<AuditLog[]>(`/tasks/${task.id}/audit-logs`)
        .then((res) => setLogs(res.data))
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : "Failed to load audit logs"
          setError(msg)
        })
        .finally(() => setIsLoading(false))
    }
  }, [isOpen, task])

  if (!isOpen || !task) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Task Audit Timeline</h2>
            <p className="text-xs font-medium text-slate-500">Immutable history for "{task.title}"</p>
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

        {isLoading ? (
          <div className="text-xs font-semibold text-slate-400 py-6 text-center">Loading audit history...</div>
        ) : logs.length === 0 ? (
          <div className="text-xs font-medium text-slate-400 py-6 text-center">No audit logs recorded for this task.</div>
        ) : (
          <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-1.5"
              >
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-900">{log.user.name} ({log.user.role})</span>
                  <span className="text-slate-400 font-medium">{formatDate(log.created_at)}</span>
                </div>
                <div className="text-xs text-slate-700 font-medium">
                  Changed <span className="font-bold text-blue-600">{log.changed_column}</span> from{" "}
                  <span className="line-through text-slate-400">{log.old_value || "null"}</span> to{" "}
                  <span className="font-bold text-emerald-600">{log.new_value || "null"}</span>
                </div>
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
