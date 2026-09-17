"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { type RegisterFormData, registerSchema } from "../../schemas/auth.schema"
import { useAuthStore } from "../../stores/auth.store"
import { useToastStore } from "../../stores/toast.store"

export default function RegisterPage() {
  const router = useRouter()
  const { register: registerAuth } = useAuthStore()
  const { addToast } = useToastStore()
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
      addToast({ title: "Account Created!", message: "Your company workspace is ready.", type: "success" })
      router.push("/dashboard")
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error || "Registration failed"
        : "An unexpected error occurred"
      setErrorMessage(msg)
      addToast({ title: "Registration Failed", message: msg, type: "error" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 text-slate-900">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50">
        <div className="text-center space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/favicon.svg" alt="NodeWave Logo" className="h-12 w-12 mx-auto mb-2 object-contain" />
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Create Account & Company
          </h1>
          <p className="text-xs font-medium text-slate-500">Register a new company workspace on NodeWave</p>
        </div>

        {errorMessage && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="reg-name"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              Full Name
            </label>
            <input
              id="reg-name"
              type="text"
              {...register("name")}
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-600/10 transition"
              placeholder="John Doe"
            />
            {errors.name && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.name.message}</p>}
          </div>

          <div>
            <label
              htmlFor="reg-email"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              Email Address
            </label>
            <input
              id="reg-email"
              type="email"
              {...register("email")}
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-600/10 transition"
              placeholder="john@example.com"
            />
            {errors.email && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.email.message}</p>}
          </div>

          <div>
            <label
              htmlFor="reg-password"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              Password
            </label>
            <input
              id="reg-password"
              type="password"
              {...register("password")}
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-600/10 transition"
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.password.message}</p>}
          </div>

          <div>
            <label
              htmlFor="reg-company"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              Company Name
            </label>
            <input
              id="reg-company"
              type="text"
              {...register("companyName")}
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-600/10 transition"
              placeholder="Acme Corp"
            />
            {errors.companyName && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.companyName.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="reg-role"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                Role
              </label>
              <select
                id="reg-role"
                {...register("role")}
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm font-medium text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none"
              >
                <option value="PM">PM</option>
                <option value="INTERNAL">INTERNAL</option>
                <option value="CLIENT">CLIENT</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="reg-department"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                Department
              </label>
              <select
                id="reg-department"
                {...register("department")}
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm font-medium text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none"
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
            className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-600/20 disabled:opacity-50 shadow-md shadow-indigo-600/20"
          >
            {isSubmitting ? "Registering..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-xs font-medium text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-indigo-600 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
