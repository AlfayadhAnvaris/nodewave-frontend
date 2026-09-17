"use client"

import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react"
import { type Toast, useToastStore } from "../stores/toast.store"

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast: Toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start justify-between gap-3 p-4 rounded-2xl border shadow-lg backdrop-blur-md animate-in slide-in-from-top-2 fade-in duration-200 ${
            toast.type === "success"
              ? "bg-emerald-50/95 border-emerald-200 text-emerald-900"
              : toast.type === "error"
                ? "bg-rose-50/95 border-rose-200 text-rose-900"
                : toast.type === "warning"
                  ? "bg-amber-50/95 border-amber-200 text-amber-900"
                  : "bg-blue-50/95 border-blue-200 text-blue-900"
          }`}
        >
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 shrink-0">
              {toast.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              {toast.type === "error" && <AlertCircle className="w-4 h-4 text-rose-600" />}
              {toast.type === "warning" && <AlertTriangle className="w-4 h-4 text-amber-600" />}
              {toast.type === "info" && <Info className="w-4 h-4 text-blue-600" />}
            </span>
            <div>
              <h4 className="text-xs font-bold leading-none">{toast.title}</h4>
              <p className="text-[11px] font-medium leading-relaxed opacity-90 mt-1">{toast.message}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg transition"
            aria-label="Dismiss toast"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
