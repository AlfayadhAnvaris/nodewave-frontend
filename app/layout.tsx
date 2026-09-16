import type { Metadata } from "next"
import { AuthGuard } from "../components/auth-guard"
import "./globals.css"

export const metadata: Metadata = {
  title: "NodeWave - Task & Project Management",
  description: "Fullstack Task and Project Management Application",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  )
}
