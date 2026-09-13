import type { Metadata } from 'next'
import { getCategories } from '@/lib/actions/dashboard.actions'
import { getSession } from '@/lib/session'
import { PengaturanClient } from './PengaturanClient'

export const metadata: Metadata = { title: 'Pengaturan' }

export default async function PengaturanPage() {
  const session = await getSession()
  const categories = await getCategories()

  const profile = session
    ? {
        id: session.id,
        name: session.name,
        email: session.email,
        role: session.role,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    : null

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-800">Pengaturan</h1>
        <p className="text-sm text-slate-500 mt-1">Kelola akun, keamanan, kategori, dan data aplikasi.</p>
      </div>
      {profile ? (
        <PengaturanClient categories={categories} profile={profile} />
      ) : (
        <p className="text-sm text-red-500">Gagal memuat sesi pengguna.</p>
      )}
    </div>
  )
}
