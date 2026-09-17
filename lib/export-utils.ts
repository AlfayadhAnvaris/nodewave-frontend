import type { Task } from "../types/task"
import type { Project } from "../types/project"

/**
 * Triggers a browser download of a CSV file.
 */
function downloadCSV(csvContent: string, fileName: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", fileName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export tasks list to a downloadable CSV file.
 */
export function exportTasksToCSV(tasks: Task[], projectName = "Workspace") {
  if (!tasks || tasks.length === 0) return

  const headers = ["Task ID", "Title", "Status", "Priority", "Department", "Assignee", "Created Date"]
  const rows = tasks.map((t) => [
    `"${t.id}"`,
    `"${(t.title || "").replace(/"/g, '""')}"`,
    `"${t.status}"`,
    `"${t.priority || "MEDIUM"}"`,
    `"${t.department}"`,
    `"${t.assignee ? t.assignee.name : "Unassigned"}"`,
    `"${new Date(t.created_at).toLocaleDateString()}"`,
  ])

  const csvString = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
  const dateStr = new Date().toISOString().split("T")[0]
  downloadCSV(csvString, `${projectName.toLowerCase().replace(/\s+/g, "_")}_tasks_${dateStr}.csv`)
}

/**
 * Export workspace role performance summary to CSV.
 */
export function exportPerformanceReportToCSV(tasks: Task[], projects: Project[], periodFilter: string) {
  const headers = ["Department", "Total Tasks", "Completed Tasks", "Overdue Tasks", "Completion Rate (%)"]
  const depts = ["PRODUCT", "UI_UX", "FRONTEND", "BACKEND", "CLIENT"]

  const rows = depts.map((dept) => {
    const deptTasks = tasks.filter((t) => t.department === dept)
    const total = deptTasks.length
    const completed = deptTasks.filter((t) => t.status === "DONE").length
    const overdue = deptTasks.filter(
      (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "DONE"
    ).length
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0

    return [`"${dept}"`, total, completed, overdue, `"${rate}%"`]
  })

  const csvString = [
    `"NodeWave Role Performance Report - ${periodFilter}"`,
    `"Export Date", "${new Date().toLocaleString()}"`,
    "",
    headers.join(","),
    ...rows.map((r) => r.join(",")),
  ].join("\n")

  downloadCSV(csvString, `nodewave_performance_report_${periodFilter.toLowerCase().replace(/\s+/g, "_")}.csv`)
}
