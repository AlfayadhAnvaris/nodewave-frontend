"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { type RegisterFormData, registerSchema } from "../../schemas/auth.schema"
import { useAuthStore } from "../../stores/auth.store"

export default function RegisterPage() {
  const router = useRouter()
  const { register: registerAuth } = useAuthStore()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "PM",
      department: "PRODUCT",
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      await registerAuth(data)
      router.push("/dashboard")
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } }
        setErrorMessage(axiosErr.response?.data?.error || "Registration failed")
      } else {
        setErrorMessage("An unexpected error occurred")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-100">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-indigo-400">NodeWave</h1>
          <p className="mt-1 text-sm text-slate-400">Register New Account & Company</p>
        </div>

        {errorMessage && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="reg-name"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
            >
              Full Name
            </label>
            <input
              id="reg-name"
              type="text"
              {...register("name")}
              className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              placeholder="John Doe"
            />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
          </div>

          <div>
            <label
              htmlFor="reg-email"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
            >
              Email Address
            </label>
            <input
              id="reg-email"
              type="email"
              {...register("email")}
              className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              placeholder="john@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
          </div>

          <div>
            <label
              htmlFor="reg-password"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
            >
              Password
            </label>
            <input
              id="reg-password"
              type="password"
              {...register("password")}
              className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
          </div>

          <div>
            <label
              htmlFor="reg-company"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
            >
              Company Name
            </label>
            <input
              id="reg-company"
              type="text"
              {...register("companyName")}
              className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              placeholder="Acme Corp"
            />
            {errors.companyName && <p className="mt-1 text-xs text-red-400">{errors.companyName.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="reg-role"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Role
              </label>
              <select
                id="reg-role"
                {...register("role")}
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              >
                <option value="PM">PM</option>
                <option value="INTERNAL">INTERNAL</option>
                <option value="CLIENT">CLIENT</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="reg-department"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Department
              </label>
              <select
                id="reg-department"
                {...register("department")}
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              >
                <option value="PRODUCT">PRODUCT</option>
                <option value="UI_UX">UI_UX</option>
                <option value="FRONTEND">FRONTEND</option>
                <option value="BACKEND">BACKEND</option>
                <option value="CLIENT">CLIENT</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? "Registering..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-indigo-400 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
