"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { type LoginFormData, loginSchema } from "../../schemas/auth.schema"
import { useAuthStore } from "../../stores/auth.store"

const DEMO_ACCOUNTS = [
  { role: "PM", email: "pm@example.com", label: "Product Manager" },
  { role: "UI/UX", email: "uiux@example.com", label: "UI/UX Designer" },
  { role: "Frontend", email: "frontend@example.com", label: "Frontend Engineer" },
  { role: "Backend", email: "backend@example.com", label: "Backend Engineer" },
  { role: "Client", email: "client@example.com", label: "Client Guest" },
]

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "pm@example.com",
      password: "Password123!",
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      await login(data)
      router.push("/dashboard")
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } }
        setErrorMessage(axiosErr.response?.data?.error || "Invalid credentials")
      } else {
        setErrorMessage("An unexpected error occurred")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSelectDemo = (email: string) => {
    setValue("email", email)
    setValue("password", "Password123!")
    setErrorMessage(null)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-100">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-indigo-400">NodeWave</h1>
          <p className="mt-2 text-sm text-slate-400">Task & Project Management System</p>
        </div>

        {errorMessage && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
            >
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              {...register("email")}
              className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="user@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              {...register("password")}
              className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800">
          <p className="text-xs font-medium text-slate-400 mb-2 text-center">Quick Demo Login Presets:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => handleSelectDemo(acc.email)}
                className="rounded-md border border-slate-700 bg-slate-800/60 px-2.5 py-1 text-xs text-slate-300 transition hover:border-indigo-500 hover:text-indigo-400"
              >
                {acc.role}
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-indigo-400 hover:underline">
            Register Company
          </Link>
        </p>
      </div>
    </div>
  )
}
