import { create } from "zustand"

export interface NotificationItem {
  id: string
  title: string
  message: string
  time: string
  type: "overdue" | "assignment" | "blocked"
  read: boolean
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "Task Overdue Alert",
    message: "Task 'Database Migration Script' passed due date and needs attention.",
    time: "10m ago",
    type: "overdue",
    read: false,
  },
  {
    id: "2",
    title: "New Task Assignment",
    message: "You were assigned to 'Audit Q4 Workspace Performance'.",
    time: "1h ago",
    type: "assignment",
    read: false,
  },
  {
    id: "3",
    title: "Task Blocked Notification",
    message: "Task 'UI Component Design' has been flagged as BLOCKED.",
    time: "3h ago",
    type: "blocked",
    read: true,
  },
]

interface NotificationStore {
  notifications: NotificationItem[]
  initNotifications: () => void
  markAllAsRead: () => void
  toggleRead: (id: string) => void
  addNotification: (item: Omit<NotificationItem, "id" | "time" | "read">) => void
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: DEFAULT_NOTIFICATIONS,

  initNotifications: () => {
    if (typeof window === "undefined") return
    const stored = localStorage.getItem("nodewave_notifications")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          set({ notifications: parsed })
        }
      } catch (_e) {
        // Fallback to default
      }
    } else {
      localStorage.setItem("nodewave_notifications", JSON.stringify(DEFAULT_NOTIFICATIONS))
    }
  },

  markAllAsRead: () => {
    const updated = get().notifications.map((n) => ({ ...n, read: true }))
    if (typeof window !== "undefined") {
      localStorage.setItem("nodewave_notifications", JSON.stringify(updated))
    }
    set({ notifications: updated })
  },

  toggleRead: (id: string) => {
    const updated = get().notifications.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    if (typeof window !== "undefined") {
      localStorage.setItem("nodewave_notifications", JSON.stringify(updated))
    }
    set({ notifications: updated })
  },

  addNotification: (item) => {
    const newItem: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}`,
      time: "Just now",
      read: false,
    }
    const updated = [newItem, ...get().notifications]
    if (typeof window !== "undefined") {
      localStorage.setItem("nodewave_notifications", JSON.stringify(updated))
    }
    set({ notifications: updated })
  },
}))
