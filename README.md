# 🌊 NodeWave Frontend

Next.js 16 App Router frontend for the NodeWave Workspace & Project Management platform.

## Features
- **Ultra-Minimalist Dashboard**: 3-Tab layout (`Overview`, `Team Workload`, `Analytics`) + Slide-over Activity Feed Drawer.
- **Kanban Board**: Drag & Drop status updates, Priority SLA badges (`URGENT`, `HIGH`, `MEDIUM`, `LOW`), Task Audit Logs, Attachments, and Task Dependencies.
- **User Management (`/users`)**: Searchable directory, role filters, invite modal.
- **Profile Settings (`/profile`)**: Account details & security password change.
- **Persistent Notifications**: Zustand + `localStorage` synchronized Notification Center.
- **CSV Export**: Browser-based performance report & task CSV downloader.

## Quick Start
```bash
bun dev
```
Runs the development server on `http://localhost:3001`.
