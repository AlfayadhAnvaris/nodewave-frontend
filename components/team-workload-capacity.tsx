"use client"

import React from "react"
import { AlertTriangle, CheckCircle2, UserCheck, Users } from "lucide-react"
import type { Task } from "../types/task"
import type { ProjectMember } from "../types/project"

interface TeamWorkloadCapacityProps {
  tasks: Task[]
  members?: ProjectMember[]
}

export default function TeamWorkloadCapacity({ tasks, members = [] }: TeamWorkloadCapacityProps) {
  // Aggregate workload per member
  const memberWorkload = React.useMemo(() => {
    const map: Record<
      string,
      {
        name: string
        email: string
        department: string
        role: string
        totalTasks: number
        activeTasks: number
        doneTasks: number
        blockedTasks: number
      }
    > = {}

    // First initialize from project members
    members.forEach((m) => {
      map[m.user_id] = {
        name: m.user.name,
        email: m.user.email,
        department: m.user.department,
        role: m.user.role,
        totalTasks: 0,
        activeTasks: 0,
        doneTasks: 0,
        blockedTasks: 0,
      }
    })

    // Aggregate from task assignments
    tasks.forEach((t) => {
      if (!t.assignee_id) return
      if (!map[t.assignee_id]) {
        map[t.assignee_id] = {
          name: t.assignee?.name || "Team Member",
          email: t.assignee?.email || "",
          department: t.department || "GENERAL",
          role: "MEMBER",
          totalTasks: 0,
          activeTasks: 0,
          doneTasks: 0,
          blockedTasks: 0,
        }
      }

      const item = map[t.assignee_id]
      item.totalTasks += 1
      if (t.status === "DONE") {
        item.doneTasks += 1
      } else {
        item.activeTasks += 1
        if (t.status === "BLOCKED") item.blockedTasks += 1
      }
    })

    return Object.values(map)
  }, [tasks, members])

  const MAX_CAPACITY = 4

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 space-y-4 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Team Workload & Capacity</h3>
            <p className="text-[11px] font-medium text-slate-500">
              Active task allocations per team member (Max recommended: {MAX_CAPACITY} active tasks)
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
          {memberWorkload.length} Team Members
        </span>
      </div>

      {memberWorkload.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">No team member task allocations yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {memberWorkload.map((m) => {
            const isOverloaded = m.activeTasks > MAX_CAPACITY
            const capacityPct = Math.min(Math.round((m.activeTasks / MAX_CAPACITY) * 100), 100)

            return (
              <div
                key={m.email || m.name}
                className={`rounded-xl border p-4 space-y-3 transition duration-150 ${
                  isOverloaded
                    ? "border-rose-200 bg-rose-50/40"
                    : "border-slate-200/80 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 shrink-0">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{m.name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold truncate">
                        {m.department} • {m.role}
                      </p>
                    </div>
                  </div>

                  {isOverloaded ? (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1 shrink-0">
                      <AlertTriangle className="w-3 h-3 text-rose-600" /> Overload
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1 shrink-0">
                      <UserCheck className="w-3 h-3 text-emerald-600" /> Optimal
                    </span>
                  )}
                </div>

                {/* Progress capacity bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-600">
                    <span>Active Load</span>
                    <span className={isOverloaded ? "text-rose-600 font-bold" : "text-slate-700"}>
                      {m.activeTasks} / {MAX_CAPACITY} tasks
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${capacityPct}%` }}
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOverloaded ? "bg-rose-500" : m.activeTasks >= 3 ? "bg-amber-500" : "bg-blue-600"
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold pt-1 border-t border-slate-100">
                  <span className="flex items-center gap-1 text-emerald-600">
                    <CheckCircle2 className="w-3 h-3" /> {m.doneTasks} Completed
                  </span>
                  <span>{m.totalTasks} Total Assigned</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
