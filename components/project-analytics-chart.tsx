"use client"

import { BarChart3, PieChart, TrendingUp, Zap } from "lucide-react"
import type { Task } from "../types/task"

interface ProjectAnalyticsChartProps {
  tasks: Task[]
}

const DEPT_COLORS: Record<string, { bg: string; text: string; hex: string }> = {
  PRODUCT: { bg: "bg-blue-500", text: "text-blue-600", hex: "#2563EB" },
  UI_UX: { bg: "bg-purple-500", text: "text-purple-600", hex: "#9333EA" },
  FRONTEND: { bg: "bg-emerald-500", text: "text-emerald-600", hex: "#10B981" },
  BACKEND: { bg: "bg-amber-500", text: "text-amber-600", hex: "#F59E0B" },
  CLIENT: { bg: "bg-indigo-500", text: "text-indigo-600", hex: "#6366F1" },
}

export function ProjectAnalyticsChart({ tasks }: ProjectAnalyticsChartProps) {
  const total = tasks.length
  const doneCount = tasks.filter((t) => t.status === "DONE").length
  const inProgressCount = tasks.filter((t) => t.status === "IN_PROGRESS").length
  const blockedCount = tasks.filter((t) => t.status === "BLOCKED").length
  const todoCount = tasks.filter((t) => t.status === "TODO").length

  const getPercent = (count: number) => (total > 0 ? Math.round((count / total) * 100) : 0)

  const donePct = getPercent(doneCount)
  const inProgressPct = getPercent(inProgressCount)
  const blockedPct = getPercent(blockedCount)
  const todoPct = getPercent(todoCount)

  const deptCounts: Record<string, number> = {
    PRODUCT: tasks.filter((t) => t.department === "PRODUCT").length,
    UI_UX: tasks.filter((t) => t.department === "UI_UX").length,
    FRONTEND: tasks.filter((t) => t.department === "FRONTEND").length,
    BACKEND: tasks.filter((t) => t.department === "BACKEND").length,
    CLIENT: tasks.filter((t) => t.department === "CLIENT").length,
  }

  const maxDeptCount = Math.max(...Object.values(deptCounts), 1)

  const monthlyTrends = [
    { month: "May", created: 22, completed: 18 },
    { month: "Jun", created: 30, completed: 26 },
    { month: "Jul", created: 28, completed: 25 },
    { month: "Aug", created: 36, completed: 31 },
    { month: "Sep", created: 44, completed: 40 },
  ]

  const maxTaskCount = 50

  // Donut SVG circumference math
  const strokeDasharray = 283 // 2 * pi * 45
  let strokeDashoffset = 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Task Velocity & Area Chart */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4 hover:border-slate-300 transition">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Task Velocity & Throughput</h3>
              <p className="text-[11px] font-medium text-slate-500">Monthly created vs completed tasks</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            <TrendingUp className="w-3 h-3" />
            <span>+15% Growth</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-4 text-xs font-semibold pt-1">
          <span className="flex items-center gap-1.5 text-blue-600">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600 inline-block" /> Created Tasks
          </span>
          <span className="flex items-center gap-1.5 text-emerald-600">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" /> Completed Tasks
          </span>
        </div>

        {/* Visual Bar Graph */}
        <div className="pt-2 relative">
          <div className="flex items-end justify-between h-48 border-b border-slate-100 px-4 gap-3 bg-slate-50/40 rounded-2xl p-4">
            {monthlyTrends.map((t) => {
              const createdHeight = Math.round((t.created / maxTaskCount) * 100)
              const completedHeight = Math.round((t.completed / maxTaskCount) * 100)

              return (
                <div key={t.month} className="flex-1 flex flex-col items-center gap-2 group relative">
                  <div className="w-full flex items-end justify-center gap-1.5 h-36">
                    <div
                      style={{ height: `${createdHeight}%` }}
                      className="w-4 bg-gradient-to-t from-blue-600 to-blue-500 rounded-t-lg group-hover:brightness-110 transition-all duration-200 shadow-xs"
                      title={`Created (${t.month}): ${t.created} tasks`}
                    />
                    <div
                      style={{ height: `${completedHeight}%` }}
                      className="w-4 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg group-hover:brightness-110 transition-all duration-200 shadow-xs"
                      title={`Completed (${t.month}): ${t.completed} tasks`}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-600">{t.month}</span>

                  {/* Dynamic Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-14 z-20 bg-slate-900/90 backdrop-blur-xs text-white text-[10px] font-medium rounded-xl p-2.5 shadow-xl transition duration-150 whitespace-nowrap">
                    <p className="font-bold text-slate-200 border-b border-slate-700 pb-1 mb-1">{t.month} Throughput</p>
                    <p className="text-blue-300 font-semibold">Created: {t.created} tasks</p>
                    <p className="text-emerald-300 font-semibold">Completed: {t.completed} tasks</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Chart 2: Donut & Workload Distribution */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4 hover:border-slate-300 transition flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Workload & Status Breakdown</h3>
              <p className="text-[11px] font-medium text-slate-500">Distribution across workspace departments</p>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            {donePct}% Resolved
          </span>
        </div>

        {/* Status segmented bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-bold text-slate-600">
            <span>Overall Progress</span>
            <span className="text-emerald-600">{doneCount} / {total || 1} Done</span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div style={{ width: `${donePct}%` }} className="bg-emerald-500 transition-all duration-300" title={`Done: ${donePct}%`} />
            <div style={{ width: `${inProgressPct}%` }} className="bg-amber-500 transition-all duration-300" title={`In Progress: ${inProgressPct}%`} />
            <div style={{ width: `${blockedPct}%` }} className="bg-rose-500 transition-all duration-300" title={`Blocked: ${blockedPct}%`} />
            <div style={{ width: `${todoPct}%` }} className="bg-slate-300 transition-all duration-300" title={`To Do: ${todoPct}%`} />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold pt-0.5">
            <span className="text-emerald-600">Done ({donePct}%)</span>
            <span className="text-amber-600">In Progress ({inProgressPct}%)</span>
            <span className="text-rose-600">Blocked ({blockedPct}%)</span>
            <span className="text-slate-500">To Do ({todoPct}%)</span>
          </div>
        </div>

        {/* Department Progress List */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          {Object.entries(deptCounts).map(([dept, count]) => {
            const barWidth = Math.round((count / maxDeptCount) * 100)
            const deptConfig = DEPT_COLORS[dept] || { bg: "bg-blue-500", text: "text-blue-600", hex: "#2563EB" }

            return (
              <div key={dept} className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-700">
                  <span className="font-bold flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${deptConfig.bg}`} />
                    {dept}
                  </span>
                  <span className="text-slate-500 font-bold">{count} {count === 1 ? "task" : "tasks"}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${barWidth}%` }}
                    className={`h-full ${deptConfig.bg} rounded-full transition-all duration-300`}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
