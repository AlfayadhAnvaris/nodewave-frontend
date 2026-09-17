import React from "react"
import { CheckCircle2, AlertCircle, Clock, Layers, Users, Code, Layout, ShieldCheck } from "lucide-react"
import type { Task } from "../types/task"
import type { Project } from "../types/project"

interface RolePerformanceMonitorProps {
  tasks: Task[]
  projects: Project[]
  periodFilter: string // e.g., "Sep 2026"
}

/**
 * Simple utility to parse month/year string into a Date range.
 */
function getDateRange(filter: string): { start: Date; end: Date } {
  const [monthName, yearStr] = filter.split(" ")
  const month = new Date(`${monthName} 1, ${yearStr}`).getMonth()
  const year = parseInt(yearStr, 10) || 2026
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999)
  return { start, end }
}

const DEPARTMENT_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  PRODUCT: { label: "Product & Strategy", icon: Layers, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
  UI_UX: { label: "UI / UX Design", icon: Layout, color: "text-purple-600", bg: "bg-purple-50 border-purple-100" },
  FRONTEND: { label: "Frontend Team", icon: Code, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
  BACKEND: { label: "Backend & Cloud", icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
  CLIENT: { label: "Client & Ops", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-100" },
}

/**
 * Compute statistics per department.
 */
function computeStats(tasks: Task[], periodFilter: string) {
  const { start, end } = getDateRange(periodFilter)
  const stats: Record<string, { total: number; completed: number; overdue: number; totalDuration: number; completedCount: number }> = {
    PRODUCT: { total: 0, completed: 0, overdue: 0, totalDuration: 0, completedCount: 0 },
    UI_UX: { total: 0, completed: 0, overdue: 0, totalDuration: 0, completedCount: 0 },
    FRONTEND: { total: 0, completed: 0, overdue: 0, totalDuration: 0, completedCount: 0 },
    BACKEND: { total: 0, completed: 0, overdue: 0, totalDuration: 0, completedCount: 0 },
    CLIENT: { total: 0, completed: 0, overdue: 0, totalDuration: 0, completedCount: 0 },
  }

  tasks.forEach((t) => {
    const created = new Date(t.created_at)
    // If filtering by date, check created date range. If empty task array or no filter match, fallback gracefully
    if (periodFilter && (created < start || created > end)) return

    const dept = (t.department as string) || "PRODUCT"
    if (!stats[dept]) {
      stats[dept] = { total: 0, completed: 0, overdue: 0, totalDuration: 0, completedCount: 0 }
    }
    const depStat = stats[dept]
    depStat.total += 1
    if (t.status === "DONE") {
      depStat.completed += 1
      if (t.completed_at) {
        const completed = new Date(t.completed_at)
        const duration = completed.getTime() - created.getTime()
        depStat.totalDuration += duration
        depStat.completedCount += 1
      }
    }
    if (t.due_date && new Date(t.due_date) < new Date() && t.status !== "DONE") {
      depStat.overdue += 1
    }
  })
  return stats
}

const RolePerformanceMonitor: React.FC<RolePerformanceMonitorProps> = ({ tasks, periodFilter }) => {
  const stats = React.useMemo(() => computeStats(tasks, periodFilter), [tasks, periodFilter])
  const departments = Object.keys(stats)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Role & Department Performance Cards</h2>
          <p className="text-[11px] text-slate-500 font-medium">Real-time team throughput, completion metrics, and operational health</p>
        </div>
        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          Period: {periodFilter}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {departments.map((deptKey) => {
          const config = DEPARTMENT_CONFIG[deptKey] || {
            label: deptKey,
            icon: Layers,
            color: "text-blue-600",
            bg: "bg-slate-50 border-slate-100",
          }
          const IconComponent = config.icon
          const { total, completed, overdue, totalDuration, completedCount } = stats[deptKey]
          const avgMs = completedCount > 0 ? totalDuration / completedCount : 0
          const avgDays = Math.round(avgMs / (1000 * 60 * 60 * 24))
          const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0

          return (
            <div
              key={deptKey}
              className="group rounded-2xl border border-slate-200/80 bg-white p-4 space-y-3 shadow-xs hover:shadow-md hover:border-slate-300 transition duration-200 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl border ${config.bg}`}>
                    <IconComponent className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {total} {total === 1 ? "Task" : "Tasks"}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-900 truncate">{config.label}</h3>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{deptKey}</p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-600">
                    <span>Progress</span>
                    <span className="text-blue-600">{completionPct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${completionPct}%` }}
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="font-semibold">{completed} Done</span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-700">
                  <AlertCircle className={`w-3.5 h-3.5 ${overdue > 0 ? "text-rose-500 font-bold" : "text-slate-400"} shrink-0`} />
                  <span className={overdue > 0 ? "font-bold text-rose-600" : "font-medium"}>
                    {overdue} Overdue
                  </span>
                </div>

                <div className="col-span-2 flex items-center justify-between text-[10px] text-slate-500 pt-1 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" /> Avg speed:
                  </span>
                  <span className="font-bold text-slate-700">
                    {completedCount > 0 ? `${avgDays} days` : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RolePerformanceMonitor
