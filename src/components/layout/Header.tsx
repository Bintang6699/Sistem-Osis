'use client'

import { Menu, Bell, Search } from 'lucide-react'
import { usePathname } from 'next/navigation'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/kas-masuk': 'Kas Masuk',
  '/kas-keluar': 'Kas Keluar',
  '/transaksi': 'Riwayat Transaksi',
  '/anggota': 'Data Anggota',
  '/laporan': 'Laporan Keuangan',
  '/pengaturan': 'Pengaturan',
}

const PAGE_SUBTITLES: Record<string, string> = {
  '/dashboard': 'Ringkasan keuangan OSIS hari ini',
  '/kas-masuk': 'Kelola pemasukan kas OSIS',
  '/kas-keluar': 'Kelola pengeluaran kas OSIS',
  '/transaksi': 'Semua riwayat transaksi keuangan',
  '/anggota': 'Kelola data anggota dan status pembayaran',
  '/laporan': 'Laporan dan rekap keuangan OSIS',
  '/pengaturan': 'Pengaturan aplikasi dan pengguna',
}

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname()
  const title = PAGE_TITLES[pathname] ?? 'Keuangan OSIS'
  const subtitle = PAGE_SUBTITLES[pathname] ?? ''

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-100 bg-white/80 px-4 backdrop-blur-md sm:px-6">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 lg:hidden"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Page title */}
      <div className="flex-1">
        <h1 className="text-base font-bold text-slate-900 sm:text-lg">{title}</h1>
        {subtitle && (
          <p className="hidden text-xs text-slate-400 sm:block">{subtitle}</p>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50">
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
