'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, Pencil, Trash2, Tag, User, Lock, Mail,
  AlertTriangle, RefreshCw, Shield, UserX, KeyRound,
  CheckCircle2, Eye, EyeOff
} from 'lucide-react'
import { Category, Profile } from '@/types/database.types'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import {
  createCategory, updateCategory, deleteCategory, resetAllTransactions
} from '@/lib/actions/dashboard.actions'
import { deleteAllMembers } from '@/lib/actions/members.actions'
import { updateProfile } from '@/lib/actions/auth.actions'
import toast from 'react-hot-toast'

interface PengaturanClientProps {
  categories: Category[]
  profile: Profile
}

function SectionCard({
  icon: Icon,
  title,
  subtitle,
  color = 'indigo',
  children,
}: {
  icon: React.ElementType
  title: string
  subtitle: string
  color?: string
  children: React.ReactNode
}) {
  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    slate: 'bg-slate-100 text-slate-600',
  }
  return (
    <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${colorMap[color] ?? colorMap.indigo}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800">{title}</h2>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

export function PengaturanClient({ categories, profile }: PengaturanClientProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  /* ── PASSWORD GATE ── */
  const [unlocked, setUnlocked] = useState(false)
  const [gateInput, setGateInput] = useState('')
  const [gateError, setGateError] = useState(false)
  const [showGatePass, setShowGatePass] = useState(false)

  const handleGateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (gateInput === 'sadommaju669901') {
      setUnlocked(true)
      setGateError(false)
    } else {
      setGateError(true)
      setGateInput('')
    }
  }

  // Category
  const [showCatForm, setShowCatForm] = useState(false)
  const [editCat, setEditCat] = useState<Partial<Category> | null>(null)
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null)
  const [deleteCatName, setDeleteCatName] = useState('')
  const [isCatSubmitting, setIsCatSubmitting] = useState(false)

  // Profile
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false)
  const [showProfileSaved, setShowProfileSaved] = useState(false)

  // Password
  const [isPassSubmitting, setIsPassSubmitting] = useState(false)
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [passSuccess, setPassSuccess] = useState(false)

  // Email
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState(false)

  // Reset
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  // Delete All Members
  const [showDeleteMembersConfirm, setShowDeleteMembersConfirm] = useState(false)
  const [isDeletingMembers, setIsDeletingMembers] = useState(false)

  const incomes = categories.filter(c => c.type === 'income')
  const expenses = categories.filter(c => c.type === 'expense')

  /* ── PASSWORD GATE SCREEN ── */
  if (!unlocked) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-sm">
          <div className="rounded-3xl bg-white border border-slate-100 shadow-xl p-8">
            <div className="flex flex-col items-center text-center mb-7">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-200">
                <KeyRound className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-black text-slate-800">Akses Pengaturan</h2>
              <p className="text-sm text-slate-500 mt-1.5">Masukkan password admin untuk melanjutkan</p>
            </div>
            <form onSubmit={handleGateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Password Admin</label>
                <div className="relative">
                  <input
                    type={showGatePass ? 'text' : 'password'}
                    value={gateInput}
                    onChange={e => { setGateInput(e.target.value); setGateError(false) }}
                    placeholder="••••••••••••"
                    autoFocus
                    className={`input-base pr-10 ${gateError ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
                  />
                  <button type="button" onClick={() => setShowGatePass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showGatePass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {gateError && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Password salah. Coba lagi.
                  </p>
                )}
              </div>
              <button type="submit" className="btn-primary w-full py-2.5">
                <Shield className="h-4 w-4" /> Buka Pengaturan
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  /* ── PROFILE SUBMIT ── */
  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsProfileSubmitting(true)
    const fd = new FormData(e.currentTarget)
    try {
      await updateProfile({ name: fd.get('name') as string })
      toast.success('Nama berhasil diperbarui')
      setShowProfileSaved(true)
      setTimeout(() => setShowProfileSaved(false), 3000)
      router.refresh()
    } catch {
      toast.error('Gagal memperbarui nama')
    } finally {
      setIsProfileSubmitting(false)
    }
  }

  /* ── EMAIL SUBMIT ── */
  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsEmailSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const newEmail = fd.get('new_email') as string
    try {
      await updateProfile({ name: profile.name, email: newEmail })
      toast.success('Email berhasil diperbarui. Silakan login ulang.')
      setEmailSuccess(true)
      router.refresh()
    } catch {
      toast.error('Gagal memperbarui email')
    } finally {
      setIsEmailSubmitting(false)
    }
  }

  /* ── PASSWORD SUBMIT ── */
  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPassSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const newPass = fd.get('new_password') as string
    const confirmPass = fd.get('confirm_password') as string
    if (newPass !== confirmPass) {
      toast.error('Password baru tidak cocok!')
      setIsPassSubmitting(false)
      return
    }
    if (newPass.length < 6) {
      toast.error('Password minimal 6 karakter')
      setIsPassSubmitting(false)
      return
    }
    try {
      await updateProfile({ name: profile.name, password: newPass })
      toast.success('Password berhasil diubah')
      setPassSuccess(true)
      setTimeout(() => setPassSuccess(false), 3000)
      ;(e.target as HTMLFormElement).reset()
    } catch {
      toast.error('Gagal mengubah password')
    } finally {
      setIsPassSubmitting(false)
    }
  }

  /* ── CATEGORY ── */
  const handleCategorySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsCatSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const data = {
      name: fd.get('name') as string,
      type: fd.get('type') as 'income' | 'expense',
      color: (fd.get('color') as string) || '#6366f1',
    }
    try {
      if (editCat?.id) {
        await updateCategory(editCat.id, data)
        toast.success('Kategori berhasil diperbarui')
      } else {
        await createCategory(data)
        toast.success('Kategori berhasil ditambahkan')
      }
      setShowCatForm(false)
      setEditCat(null)
      startTransition(() => router.refresh())
    } catch {
      toast.error('Gagal menyimpan kategori')
    } finally {
      setIsCatSubmitting(false)
    }
  }

  const handleDeleteCategory = async () => {
    if (!deleteCatId) return
    try {
      await deleteCategory(deleteCatId)
      toast.success('Kategori berhasil dihapus')
      setDeleteCatId(null)
      startTransition(() => router.refresh())
    } catch {
      toast.error('Gagal menghapus. Kategori masih digunakan oleh transaksi.')
    }
  }

  /* ── DELETE ALL MEMBERS ── */
  const handleDeleteAllMembers = async () => {
    setIsDeletingMembers(true)
    try {
      await deleteAllMembers()
      toast.success('Semua data anggota berhasil dihapus!')
      setShowDeleteMembersConfirm(false)
      startTransition(() => router.refresh())
    } catch {
      toast.error('Gagal menghapus anggota. Coba lagi.')
    } finally {
      setIsDeletingMembers(false)
    }
  }

  /* ── RESET DATA ── */
  const handleResetData = async () => {
    setIsResetting(true)
    try {
      await resetAllTransactions()
      toast.success('Semua data transaksi berhasil direset!')
      setShowResetConfirm(false)
      startTransition(() => router.refresh())
    } catch {
      toast.error('Gagal mereset data. Coba lagi.')
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="space-y-5 max-w-3xl">

      {/* ── PROFIL ── */}
      <SectionCard icon={User} title="Profil Pengguna" subtitle="Ubah nama tampilan akun Anda" color="indigo">
        <form onSubmit={handleProfileSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Nama Lengkap</label>
            <input type="text" name="name" defaultValue={profile.name} required className="input-base" placeholder="Nama Lengkap" />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={isProfileSubmitting} className="btn-primary h-[42px] shrink-0">
              {isProfileSubmitting ? 'Menyimpan...' : showProfileSaved ? (<><CheckCircle2 className="h-4 w-4" /> Tersimpan</>) : 'Simpan Nama'}
            </button>
          </div>
        </form>
        <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 flex items-center gap-3">
          <Shield className="h-4 w-4 text-slate-400 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-slate-600">Peran: <span className="uppercase font-black text-indigo-600">{profile.role}</span></p>
            <p className="text-[11px] text-slate-400 mt-0.5">Peran tidak dapat diubah melalui pengaturan ini.</p>
          </div>
        </div>
      </SectionCard>

      {/* ── EMAIL ── */}
      <SectionCard icon={Mail} title="Ubah Email Login" subtitle="Email digunakan untuk masuk ke sistem" color="emerald">
        {emailSuccess ? (
          <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-semibold text-emerald-700">Email berhasil diperbarui menjadi email baru. Silakan login ulang.</p>
          </div>
        ) : (
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Email Saat Ini</label>
              <input type="email" className="input-base bg-slate-50 text-slate-400 cursor-not-allowed" value={profile.email} disabled />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Email Baru <span className="text-red-400">*</span></label>
              <input type="email" name="new_email" className="input-base" placeholder="email-baru@domain.com" required />
            </div>
            <button type="submit" disabled={isEmailSubmitting} className="btn-primary">
              {isEmailSubmitting ? 'Memperbarui...' : 'Perbarui Email'}
            </button>
          </form>
        )}
      </SectionCard>

      {/* ── PASSWORD ── */}
      <SectionCard icon={Lock} title="Ubah Password" subtitle="Gunakan password yang kuat dan mudah diingat" color="amber">
        {passSuccess ? (
          <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-semibold text-emerald-700">Password berhasil diubah!</p>
          </div>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Password Baru <span className="text-red-400">*</span></label>
              <div className="relative">
                <input type={showNew ? 'text' : 'password'} name="new_password" className="input-base pr-10" placeholder="Min. 6 karakter" required minLength={6} />
                <button type="button" onClick={() => setShowNew(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Konfirmasi Password <span className="text-red-400">*</span></label>
              <div className="relative">
                <input type={showOld ? 'text' : 'password'} name="confirm_password" className="input-base pr-10" placeholder="Ulangi password baru" required />
                <button type="button" onClick={() => setShowOld(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isPassSubmitting} className="btn-primary">
              {isPassSubmitting ? 'Menyimpan...' : 'Ubah Password'}
            </button>
          </form>
        )}
      </SectionCard>

      {/* ── KATEGORI ── */}
      <SectionCard icon={Tag} title="Kategori Transaksi" subtitle="Kelola kategori untuk kas masuk dan kas keluar" color="slate">
        <div className="flex justify-end mb-4">
          <button onClick={() => { setEditCat(null); setShowCatForm(true) }} className="btn-primary text-xs h-8 px-3">
            <Plus className="h-3.5 w-3.5" /> Tambah Kategori
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Kas Masuk
            </h3>
            <div className="space-y-2">
              {incomes.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: cat.color || '#6366f1' }} />
                    <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditCat(cat); setShowCatForm(true) }} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-white"><Pencil className="h-3 w-3" /></button>
                    <button onClick={() => { setDeleteCatId(cat.id); setDeleteCatName(cat.name) }} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-white"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </div>
              ))}
              {incomes.length === 0 && <p className="text-xs text-slate-400 py-2">Belum ada kategori pemasukan.</p>}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-500 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Kas Keluar
            </h3>
            <div className="space-y-2">
              {expenses.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: cat.color || '#ef4444' }} />
                    <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditCat(cat); setShowCatForm(true) }} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-white"><Pencil className="h-3 w-3" /></button>
                    <button onClick={() => { setDeleteCatId(cat.id); setDeleteCatName(cat.name) }} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-white"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </div>
              ))}
              {expenses.length === 0 && <p className="text-xs text-slate-400 py-2">Belum ada kategori pengeluaran.</p>}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── RESET DATA ── */}
      <SectionCard icon={AlertTriangle} title="Zona Berbahaya" subtitle="Tindakan berikut bersifat permanen dan tidak dapat dibatalkan" color="red">
        <div className="space-y-3">
          {/* Hapus semua anggota */}
          <div className="rounded-xl border border-red-100 bg-red-50/50 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <UserX className="h-4 w-4 text-red-500 shrink-0" />
                <p className="text-sm font-bold text-red-700">Hapus Semua Data Anggota</p>
              </div>
              <p className="text-xs text-red-500 leading-relaxed">
                Menghapus <strong>seluruh data anggota</strong> secara permanen. Data transaksi dan kategori <strong>tidak</strong> akan terhapus.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteMembersConfirm(true)}
              className="shrink-0 flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 active:scale-95 transition-all shadow-md shadow-red-200"
            >
              <UserX className="h-4 w-4" /> Hapus Semua Anggota
            </button>
          </div>

          {/* Reset transaksi */}
          <div className="rounded-xl border border-red-100 bg-red-50/50 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <RefreshCw className="h-4 w-4 text-red-500 shrink-0" />
                <p className="text-sm font-bold text-red-700">Reset Semua Data Transaksi</p>
              </div>
              <p className="text-xs text-red-500 leading-relaxed">
                Menghapus <strong>seluruh data</strong> kas masuk, kas keluar, dan detail item pengeluaran secara permanen.
                Data anggota dan kategori <strong>tidak</strong> akan terhapus.
              </p>
            </div>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="shrink-0 flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 active:scale-95 transition-all shadow-md shadow-red-200"
            >
              <RefreshCw className="h-4 w-4" /> Reset Data
            </button>
          </div>
        </div>
      </SectionCard>

      {/* ── CATEGORY MODAL ── */}
      <Modal isOpen={showCatForm} onClose={() => { setShowCatForm(false); setEditCat(null) }} title={editCat ? 'Edit Kategori' : 'Tambah Kategori'} size="sm">
        <form onSubmit={handleCategorySubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Nama Kategori</label>
            <input type="text" name="name" className="input-base" defaultValue={editCat?.name} required placeholder="mis. Iuran Bulanan" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Jenis</label>
            <select name="type" className="input-base" defaultValue={editCat?.type || 'income'} required>
              <option value="income">Kas Masuk</option>
              <option value="expense">Kas Keluar</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Warna Penanda</label>
            <div className="flex gap-3 items-center">
              <input type="color" name="color" className="h-10 w-14 rounded-lg cursor-pointer border-0 p-0.5" defaultValue={editCat?.color || '#6366f1'} />
              <span className="text-xs text-slate-400">Klik untuk memilih warna</span>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={() => setShowCatForm(false)} className="btn-secondary">Batal</button>
            <button type="submit" disabled={isCatSubmitting} className="btn-primary">
              {isCatSubmitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── CONFIRM DELETE CAT ── */}
      <ConfirmDialog
        isOpen={!!deleteCatId}
        onClose={() => setDeleteCatId(null)}
        onConfirm={handleDeleteCategory}
        title="Hapus Kategori"
        message={`Yakin hapus kategori "${deleteCatName}"? Transaksi yang sudah menggunakan kategori ini tidak akan terhapus.`}
      />

      {/* ── CONFIRM RESET ── */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetData}
        title="⚠️ Reset Semua Data Transaksi"
        message="Tindakan ini akan menghapus SEMUA data kas masuk dan kas keluar secara permanen. Data anggota dan kategori tetap aman. Yakin ingin melanjutkan?"
        isLoading={isResetting}
      />

      {/* ── CONFIRM DELETE ALL MEMBERS ── */}
      <ConfirmDialog
        isOpen={showDeleteMembersConfirm}
        onClose={() => setShowDeleteMembersConfirm(false)}
        onConfirm={handleDeleteAllMembers}
        title="⚠️ Hapus Semua Data Anggota"
        message="Tindakan ini akan menghapus SELURUH data anggota secara permanen. Data transaksi dan kategori tetap aman. Yakin ingin melanjutkan?"
        isLoading={isDeletingMembers}
      />
    </div>
  )
}
