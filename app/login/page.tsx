"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { type LoginFormData, loginSchema } from "../../schemas/auth.schema"
import { useAuthStore } from "../../stores/auth.store"
import { useToastStore } from "../../stores/toast.store"

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
  const { addToast } = useToastStore()
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
      addToast({ title: "Welcome back!", message: "Successfully logged in.", type: "success" })
      router.push("/dashboard")
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error || "Invalid credentials"
        : "An unexpected error occurred"
      setErrorMessage(msg)
      addToast({ title: "Login Failed", message: msg, type: "error" })
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 text-slate-900">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50">
        <div className="text-center space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/favicon.svg" alt="NodeWave Logo" className="h-12 w-12 mx-auto mb-2 object-contain" />
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Node<span className="text-blue-600">Wave</span>
          </h1>
          <p className="text-xs font-medium text-slate-500">Sign in to your project management workspace</p>
        </div>

        {errorMessage && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              {...register("email")}
              className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition"
              placeholder="user@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs font-semibold text-rose-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              {...register("password")}
              className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-xs font-semibold text-rose-600">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/20 disabled:opacity-50 shadow-md shadow-blue-600/20"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 space-y-2">
          <p className="text-[11px] font-bold text-slate-400 text-center uppercase tracking-wider">Quick Demo Credentials:</p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => handleSelectDemo(acc.email)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:border-blue-600 hover:bg-blue-50 hover:text-blue-700"
              >
                {acc.role}
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-xs font-medium text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-bold text-indigo-600 hover:underline">
            Register Company
          </Link>
        </p>
      </div>
    </div>
  )
}
