'use client'

import { useState } from 'react'
import Image from 'next/image'
import { login } from '@/lib/actions/auth.actions'
import {
  Eye, EyeOff, AlertCircle, TrendingUp, TrendingDown,
  Users, BarChart3, Shield, ArrowRight
} from 'lucide-react'

const features = [
  { icon: TrendingUp, label: 'Catat Kas Masuk', desc: 'Rekam iuran & pemasukan anggota OSIS' },
  { icon: TrendingDown, label: 'Catat Kas Keluar', desc: 'Kelola pengeluaran & nota belanja' },
  { icon: Users, label: 'Data Anggota', desc: 'Kelola data siswa dan jabatan pengurus' },
  { icon: BarChart3, label: 'Laporan Keuangan', desc: 'Grafik dan ringkasan keuangan OSIS' },
]

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
    <div className="flex min-h-screen bg-slate-50">

      {/* ── LEFT PANEL: About ── */}
      <div className="hidden lg:flex lg:w-[55%] flex-col relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px),
                              radial-gradient(circle at 75% 75%, white 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logos */}
          <div className="flex items-center gap-4 mb-auto">
            <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center overflow-hidden p-1.5 shrink-0">
              <Image src="/LOGO/LOGOSMP1DOMPU.png" alt="Logo SMP 1 Dompu" width={48} height={48} className="object-contain" />
            </div>
            <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center overflow-hidden p-1.5 shrink-0">
              <Image src="/LOGO/LOGOKKN.png" alt="Logo KKN" width={48} height={48} className="object-contain" />
            </div>
            <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center overflow-hidden p-1.5 shrink-0">
              <Image src="/LOGO/LOGOSTKIP.png" alt="Logo STKIP" width={48} height={48} className="object-contain" />
            </div>
          </div>

          {/* Main copy */}
          <div className="mt-16 mb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 mb-6">
              <Shield className="h-3.5 w-3.5 text-indigo-300" />
              <span className="text-xs font-semibold text-indigo-200 tracking-wider uppercase">Sistem Keuangan Digital</span>
            </div>
            <h1 className="text-4xl font-black text-white leading-tight mb-4">
              Sistem Informasi<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200">
                Keuangan OSIS
              </span>
            </h1>
            <p className="text-indigo-200 text-base leading-relaxed max-w-md">
              Platform digital untuk mengelola keuangan OSIS secara transparan, akurat, dan mudah diakses oleh seluruh pengurus.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3 mb-10">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-4 hover:bg-white/15 transition-all">
                <div className="h-9 w-9 rounded-xl bg-white/15 flex items-center justify-center mb-3">
                  <Icon className="h-4.5 w-4.5 text-white" />
                </div>
                <p className="text-sm font-bold text-white mb-0.5">{label}</p>
                <p className="text-xs text-indigo-300 leading-snug">{desc}</p>
              </div>
            ))}
          </div>

          {/* About / Footer */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
            <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2">Tentang Proyek</p>
            <p className="text-sm text-white/80 leading-relaxed">
              Aplikasi ini dikembangkan oleh <span className="font-bold text-white">Mahasiswa KKN STKIP Dompu</span> sebagai
              wujud pengabdian kepada masyarakat di <span className="font-bold text-white">SMP Negeri 1 Dompu</span>.
              Bertujuan memodernisasi pencatatan keuangan OSIS agar lebih transparan dan terorganisir.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-indigo-300">
              <span>© {new Date().getFullYear()} KKN STKIP Dompu</span>
              <span>·</span>
              <span>SMPN 1 Dompu</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Login Form ── */}
      <div className="flex w-full lg:w-[45%] flex-col items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">

          {/* Mobile logos */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-white shadow-md border border-slate-100 flex items-center justify-center overflow-hidden p-1 shrink-0">
              <Image src="/LOGO/LOGOSMP1DOMPU.png" alt="SMPN 1 Dompu" width={40} height={40} className="object-contain" />
            </div>
            <div className="h-12 w-12 rounded-xl bg-white shadow-md border border-slate-100 flex items-center justify-center overflow-hidden p-1 shrink-0">
              <Image src="/LOGO/LOGOKKN.png" alt="KKN" width={40} height={40} className="object-contain" />
            </div>
            <div className="h-12 w-12 rounded-xl bg-white shadow-md border border-slate-100 flex items-center justify-center overflow-hidden p-1 shrink-0">
              <Image src="/LOGO/LOGOSTKIP.png" alt="STKIP" width={40} height={40} className="object-contain" />
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Selamat Datang 👋</h2>
            <p className="text-sm text-slate-500 mt-1">Masuk untuk mengelola keuangan OSIS</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 p-3.5 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-bold text-slate-600">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="email@osis.sch.id"
                autoComplete="email"
                className="input-base"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-bold text-slate-600">
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
              className="btn-primary w-full py-3 text-base font-bold rounded-xl shadow-md shadow-indigo-200 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Masuk...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Masuk <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </button>
          </form>

          {/* Footer mobile */}
          <p className="mt-8 text-center text-xs text-slate-400 lg:hidden">
            Sistem Keuangan OSIS · KKN STKIP Dompu · SMP Negeri 1 Dompu · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  )
}
