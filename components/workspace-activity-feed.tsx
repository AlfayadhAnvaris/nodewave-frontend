"use client"

import React from "react"
import { Activity, CheckCircle2, Clock, FilePlus, UserPlus, X } from "lucide-react"
import { formatDate } from "../lib/formatters"
import type { Task } from "../types/task"

interface ActivityItem {
  id: string
  user: string
  action: string
  target: string
  time: string
  type: "task_done" | "task_created" | "member_added"
}

interface WorkspaceActivityFeedProps {
  tasks?: Task[]
  isDrawer?: boolean
  isOpen?: boolean
  onClose?: () => void
}

export default function WorkspaceActivityFeed({
  tasks = [],
  isDrawer = false,
  isOpen = false,
  onClose,
}: WorkspaceActivityFeedProps) {
  const activities: ActivityItem[] = React.useMemo(() => {
    const list: ActivityItem[] = []

    tasks.slice(0, 8).forEach((t) => {
      if (t.status === "DONE") {
        list.push({
          id: `done-${t.id}`,
          user: t.assignee?.name || "Team Member",
          action: "marked task as DONE",
          target: t.title,
          time: t.updated_at || t.created_at,
          type: "task_done",
        })
      } else {
        list.push({
          id: `created-${t.id}`,
          user: t.assignee?.name || "Project Manager",
          action: "created task",
          target: t.title,
          time: t.created_at,
          type: "task_created",
        })
      }
    })

    if (list.length === 0) {
      list.push(
        {
          id: "demo-1",
          user: "Alex PM",
          action: "created project",
          target: "Q4 Website Redesign SaaS",
          time: new Date().toISOString(),
          type: "task_created",
        },
        {
          id: "demo-2",
          user: "Sarah Lead",
          action: "joined project team",
          target: "UI/UX Department",
          time: new Date(Date.now() - 3600000 * 2).toISOString(),
          type: "member_added",
        }
      )
    }

    return list.slice(0, 10)
  }, [tasks])

  const feedContent = (
    <div className="space-y-4">
      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
        {activities.map((act) => {
          return (
            <div key={act.id} className="relative flex items-start gap-3 text-xs">
              <div
                className={`absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full text-white text-[10px] ring-4 ring-white ${
                  act.type === "task_done"
                    ? "bg-emerald-500"
                    : act.type === "member_added"
                      ? "bg-indigo-500"
                      : "bg-blue-600"
                }`}
              >
                {act.type === "task_done" ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : act.type === "member_added" ? (
                  <UserPlus className="w-3 h-3" />
                ) : (
                  <FilePlus className="w-3 h-3" />
                )}
              </div>

              <div className="flex-1 space-y-0.5">
                <p className="text-slate-800 font-medium">
                  <span className="font-bold text-slate-900">{act.user}</span> {act.action}{" "}
                  <span className="font-bold text-blue-600">"{act.target}"</span>
                </p>
                <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {formatDate(act.time)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  if (isDrawer) {
    if (!isOpen) return null

    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop overlay */}
        <button
          type="button"
          aria-label="Close activity feed backdrop"
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs transition-opacity duration-200"
        />

        {/* Slide-over Drawer Panel */}
        <aside className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-white border-l border-slate-200/80 p-6 shadow-2xl flex flex-col justify-between space-y-6 animate-in slide-in-from-right duration-200">
            <div className="space-y-6 overflow-y-auto pr-1">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Workspace Activity Feed</h2>
                    <p className="text-[11px] font-medium text-slate-500">Live timeline audit log of team actions</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {feedContent}
            </div>
          </div>
        </aside>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-slate-200/60 bg-white p-6 space-y-4 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Workspace Activity Feed</h3>
            <p className="text-[11px] font-medium text-slate-500">Real-time audit log of team actions</p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
          Live Feed
        </span>
      </div>

      {feedContent}
    </div>
  )
}
