'use client'

import { useState } from 'react'
import { login } from '@/lib/actions/auth.actions'
import { Landmark, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/25">
            <Landmark className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Keuangan OSIS</h1>
          <p className="mt-1 text-sm text-slate-500">Sistem Informasi Keuangan OSIS</p>
        </div>

        {/* Card */}
        <div className="card p-6 shadow-xl shadow-slate-200/60">
          <h2 className="mb-6 text-base font-semibold text-slate-900">Masuk ke akun Anda</h2>

          {error && (
            <div className="mb-4 flex items-start gap-3 rounded-xl bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-slate-600">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="bendahara@osis.sch.id"
                autoComplete="email"
                className="input-base"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-slate-600">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="input-base pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Masuk...
                </span>
              ) : (
                'Masuk'
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Sistem Informasi Keuangan OSIS · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
