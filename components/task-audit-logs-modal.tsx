"use client"

import { useEffect, useState } from "react"
import { api } from "../lib/api"
import type { Task, TaskAuditLog } from "../types/task"

interface TaskAuditLogsModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
}

export function TaskAuditLogsModal({ task, isOpen, onClose }: TaskAuditLogsModalProps) {
  const [logs, setLogs] = useState<TaskAuditLog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && task) {
      setIsLoading(true)
      setError(null)
      api
        .get<TaskAuditLog[]>(`/tasks/${task.id}/audit-logs`)
        .then((res) => {
          setLogs(res.data)
          setIsLoading(false)
        })
        .catch((err: unknown) => {
          const msg =
            err && typeof err === "object" && "response" in err
              ? (err as { response?: { data?: { error?: string } } }).response?.data?.error ||
                "Failed to fetch audit logs"
              : "Failed to fetch audit logs"
          setError(msg)
          setIsLoading(false)
        })
    }
  }, [isOpen, task])

  if (!isOpen || !task) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Audit Trail History</h2>
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

        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No audit log entries recorded for this task yet.
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto space-y-4 pr-1">
            {logs.map((log) => (
              <div
                key={log.id}
                className="relative pl-6 pb-4 border-l border-slate-800 last:border-0 last:pb-0"
              >
                <div className="absolute -left-1.5 top-0.5 h-3 w-3 rounded-full bg-indigo-500 ring-4 ring-slate-900" />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-200">{log.user.name}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-300">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 mr-2">
                    {log.changed_column}
                  </span>
                  {log.changed_column === "task" ? (
                    <span className="text-emerald-400 font-medium">Created Task</span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
                      <span className="line-through text-red-400/80 bg-red-500/10 px-1.5 py-0.5 rounded">
                        {log.old_value ?? "null"}
                      </span>
                      <span>→</span>
                      <span className="text-emerald-400 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        {log.new_value ?? "null"}
                      </span>
                    </span>
                  )}
                </div>
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
