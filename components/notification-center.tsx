"use client"

import React, { useEffect, useState } from "react"
import { AlertCircle, Bell, Check, CheckCheck, ShieldAlert } from "lucide-react"
import { useNotificationStore } from "../stores/notification.store"

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, initNotifications, markAllAsRead, toggleRead } = useNotificationStore()

  useEffect(() => {
    initNotifications()
  }, [initNotifications])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-none"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Overlay to close dropdown */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                    {unreadCount} Unread
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No notifications</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => toggleRead(n.id)}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                      n.read
                        ? "bg-slate-50/50 border-slate-100 text-slate-600 opacity-75"
                        : "bg-blue-50/30 border-blue-100/80 text-slate-900"
                    }`}
                  >
                    <div className="pt-0.5 shrink-0">
                      {n.type === "overdue" ? (
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                      ) : n.type === "blocked" ? (
                        <ShieldAlert className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Bell className="w-4 h-4 text-blue-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-baseline justify-between gap-1">
                        <p className="text-xs font-bold truncate">{n.title}</p>
                        <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                          {n.time}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium leading-snug line-clamp-2">
                        {n.message}
                      </p>
                    </div>

                    <div className="pt-0.5 shrink-0">
                      {n.read ? (
                        <Check className="w-3.5 h-3.5 text-slate-300" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-blue-600 block" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
