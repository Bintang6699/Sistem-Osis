'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  Users,
  BarChart2,
  Settings,
  LogOut,
  X,
  Landmark,
} from 'lucide-react'
import { cn, getInitials, ROLE_LABELS } from '@/lib/utils'
import { logout } from '@/lib/actions/auth.actions'
import { Profile } from '@/types/database.types'
import toast from 'react-hot-toast'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/kas-masuk', label: 'Kas Masuk', icon: TrendingUp },
  { href: '/kas-keluar', label: 'Kas Keluar', icon: TrendingDown },
  { href: '/transaksi', label: 'Riwayat Transaksi', icon: ArrowLeftRight },
  { href: '/anggota', label: 'Anggota', icon: Users },
  { href: '/laporan', label: 'Laporan', icon: BarChart2 },
  { href: '/pengaturan', label: 'Pengaturan', icon: Settings },
]

interface SidebarProps {
  profile: Profile | null
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ profile, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  const handleLogout = async () => {
    toast.loading('Keluar...')
    await logout()
  }

  const content = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/20">
            <Landmark className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Keuangan OSIS</p>
            <p className="text-xs text-slate-400">Financial Management</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 pb-4">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Menu Utama
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'sidebar-link',
                isActive && 'sidebar-link-active'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-600" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Info */}
      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-3 rounded-xl p-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-sm font-semibold text-white shadow-sm">
            {profile?.name ? getInitials(profile.name) : 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">
              {profile?.name ?? 'Pengguna'}
            </p>
            <p className="text-xs text-slate-400">
              {profile?.role ? ROLE_LABELS[profile.role] : 'Viewer'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
            title="Keluar"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-shrink-0 lg:flex-col lg:border-r lg:border-slate-100 lg:bg-white">
        {content}
      </aside>

      {/* Mobile drawer */}
      {isOpen !== undefined && (
        <>
          {isOpen && (
            <div
              className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
              onClick={onClose}
            />
          )}
          <aside
            className={cn(
              'fixed inset-y-0 left-0 z-50 w-72 transform bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden',
              isOpen ? 'translate-x-0' : '-translate-x-full'
            )}
          >
            {content}
          </aside>
        </>
      )}
    </>
  )
}
