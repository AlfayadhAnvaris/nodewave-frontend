"use client"

import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Download,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { AppLayout } from "../../components/layout/app-layout"
import { ProjectAnalyticsChart } from "../../components/project-analytics-chart"
import RolePerformanceMonitor from "../../components/role-performance-monitor"
import TeamWorkloadCapacity from "../../components/team-workload-capacity"
import WorkspaceActivityFeed from "../../components/workspace-activity-feed"
import { exportPerformanceReportToCSV } from "../../lib/export-utils"
import { formatDate } from "../../lib/formatters"
import { useAuthStore } from "../../stores/auth.store"
import { useProjectStore } from "../../stores/project.store"
import { useTaskStore } from "../../stores/task.store"

type DashboardTab = "overview" | "workload" | "analytics"

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { projects, fetchProjects } = useProjectStore()
  const { tasks, fetchProjectTasks } = useTaskStore()
  const [periodFilter, setPeriodFilter] = useState("Sep 2026")
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview")
  const [isActivityFeedOpen, setIsActivityFeedOpen] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  useEffect(() => {
    if (projects.length > 0) {
      fetchProjectTasks(projects[0].id)
    }
  }, [projects, fetchProjectTasks])

  // Computed metrics for dashboard summary cards
  const totalProjects = projects.length
  const activeProjects = projects.filter((p) => p.status === "ACTIVE").length
  const completedProjects = projects.filter((p) => p.status === "COMPLETED").length

  const totalTasks = tasks.length
  const doneTasks = tasks.filter((t) => t.status === "DONE").length
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS").length
  const blockedTasks = tasks.filter((t) => t.status === "BLOCKED").length
  const overdueTasks = tasks.filter(
    (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "DONE"
  ).length

  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Welcome Header & Action Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 p-6 rounded-3xl border border-slate-200/60 shadow-xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Good morning, {user?.name || "User"}
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Workspace activity and operational performance for {user?.department || "General"} team.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs font-bold text-slate-700 focus:border-blue-600 focus:bg-white focus:outline-none transition"
            >
              <option value="Sep 2026">September 2026</option>
              <option value="Aug 2026">August 2026</option>
              <option value="Jul 2026">July 2026</option>
            </select>

            <button
              type="button"
              onClick={() => setIsActivityFeedOpen(true)}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 shadow-xs flex items-center gap-1.5"
              title="Open Live Activity Feed"
            >
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span>Activity Feed</span>
            </button>

            <button
              type="button"
              onClick={() => exportPerformanceReportToCSV(tasks, projects, periodFilter)}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 shadow-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export CSV</span>
            </button>

            <Link
              href="/projects"
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700 shadow-sm shadow-blue-600/20 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>View Projects</span>
            </Link>
          </div>
        </div>

        {/* Top 4 KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Projects */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-5 space-y-3 shadow-xs hover:border-slate-300 transition duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Projects</span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/60">
                <FolderKanban className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{totalProjects}</p>
              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                <span className="text-emerald-600 font-bold">{activeProjects} Active</span> • {completedProjects} Completed
              </p>
            </div>
          </div>

          {/* Card 2: Total Tasks */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-5 space-y-3 shadow-xs hover:border-slate-300 transition duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Tasks</span>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100/60">
                <ListTodo className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{totalTasks}</p>
              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                <span className="text-blue-600 font-bold">{inProgressTasks} In Progress</span> • {doneTasks} Done
              </p>
            </div>
          </div>

          {/* Card 3: Completion Rate */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-5 space-y-3 shadow-xs hover:border-slate-300 transition duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completion Rate</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/60">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-black text-slate-900 tracking-tight">{completionRate}%</p>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100/60 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Target 85%
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-2">
                <div
                  style={{ width: `${completionRate}%` }}
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* Card 4: Action Alerts */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-5 space-y-3 shadow-xs hover:border-slate-300 transition duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Needs Attention</span>
              <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100/60">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{overdueTasks + blockedTasks}</p>
              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                <span className="text-rose-600 font-bold">{overdueTasks} Overdue</span> • {blockedTasks} Blocked
              </p>
            </div>
          </div>
        </div>

        {/* Minimalist Tab Navigation System */}
        <div className="border-b border-slate-200/80 flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === "overview"
                ? "border-blue-600 text-blue-600 font-extrabold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("workload")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === "workload"
                ? "border-blue-600 text-blue-600 font-extrabold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Team Workload</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === "analytics"
                ? "border-blue-600 text-blue-600 font-extrabold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </button>
        </div>

        {/* Tab 1: Overview (Recent Project Cards) */}
        {activeTab === "overview" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recent Project Workspace</h2>
                <p className="text-[11px] font-medium text-slate-500">Quick access to active workspace projects</p>
              </div>
              <Link href="/projects" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                <span>View All Projects</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {projects.length === 0 ? (
              <div className="rounded-2xl border border-slate-200/60 bg-white p-8 text-center text-slate-400 font-medium">
                No active projects found in workspace.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.slice(0, 6).map((p) => (
                  <div
                    key={p.id}
                    className="rounded-2xl border border-slate-200/60 bg-white p-5 space-y-4 shadow-xs hover:shadow-md hover:border-slate-300 transition duration-200 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold text-slate-900 truncate" title={p.name}>
                          {p.name}
                        </h3>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            p.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100/60"
                              : p.status === "COMPLETED"
                                ? "bg-blue-50 text-blue-700 border border-blue-100/60"
                                : "bg-slate-100 text-slate-600 border border-slate-200/60"
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-2">
                        {p.description || "No project description provided."}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(p.created_at)}</span>
                      </div>

                      <Link
                        href={`/projects/${p.id}`}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                      >
                        <span>Open Project</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Team Workload (Department Metrics & Workload Allocation) */}
        {activeTab === "workload" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <RolePerformanceMonitor tasks={tasks} projects={projects} periodFilter={periodFilter} />
            <TeamWorkloadCapacity tasks={tasks} />
          </div>
        )}

        {/* Tab 3: Analytics (Task Velocity & Throughput Charts) */}
        {activeTab === "analytics" && (
          <div className="animate-in fade-in duration-150">
            <ProjectAnalyticsChart tasks={tasks} />
          </div>
        )}
      </div>

      {/* Slide-over Activity Feed Drawer */}
      <WorkspaceActivityFeed
        isDrawer
        isOpen={isActivityFeedOpen}
        onClose={() => setIsActivityFeedOpen(false)}
        tasks={tasks}
      />
    </AppLayout>
  )
}
