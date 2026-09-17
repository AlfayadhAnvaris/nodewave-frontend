import type { Metadata } from "next"
import { AuthGuard } from "../components/auth-guard"
import { ToastContainer } from "../components/toast-container"
import "./globals.css"

export const metadata: Metadata = {
  title: "NodeWave - Workspace & Project Management SaaS",
  description: "Modern minimalist project and task management platform",
  icons: {
    icon: "/favicon.svg",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen">
        <AuthGuard>{children}</AuthGuard>
        <ToastContainer />
      </body>
    </html>
  )
}
