'use client'

import { useState, useTransition, useMemo } from 'react'
import {
  Plus, Search, Pencil, Trash2, Users, Phone,
  Crown, Star, BookOpen, Wallet, LayoutGrid, List,
  ChevronDown, ChevronUp, UserCheck, UserX
} from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { deleteMember } from '@/lib/actions/members.actions'
import { Member } from '@/types/database.types'
import { MemberForm } from '@/components/members/MemberForm'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface AnggotaClientProps {
  initialData: Member[]
  totalCount: number
}

const JABATAN_RANK: Record<string, number> = {
  'ketua': 1,
  'wakil ketua': 2,
  'sekretaris': 3,
  'bendahara': 4,
  'ketua devisi': 5,
}

type SortField = 'name' | 'class' | 'jabatan' | 'status'

function getJabatanRank(jabatan?: string | null) {
  if (!jabatan) return 999
  const jLow = jabatan.toLowerCase().trim()
  
  if (JABATAN_RANK[jLow]) return JABATAN_RANK[jLow]
  
  if (jLow.includes('wakil ketua')) return JABATAN_RANK['wakil ketua']
  if (jLow.includes('ketua devisi') || jLow.includes('ketua divisi')) return JABATAN_RANK['ketua devisi']
  if (jLow.includes('ketua') && !jLow.includes('wakil') && !jLow.includes('devisi') && !jLow.includes('divisi')) return JABATAN_RANK['ketua']
  if (jLow.includes('sekretaris')) return JABATAN_RANK['sekretaris']
  if (jLow.includes('bendahara')) return JABATAN_RANK['bendahara']
  
  return 999
}

function isJabatanUtama(jabatan?: string | null) {
  return getJabatanRank(jabatan) < 999
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

function JabatanBadge({ jabatan }: { jabatan: string | null }) {
  if (!jabatan) return null
  const isUtama = isJabatanUtama(jabatan)
  if (isUtama) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase select-none border border-amber-300/60 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 text-amber-800 shadow-sm">
        <Crown className="h-2.5 w-2.5" />
        {jabatan}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide border border-slate-200 bg-slate-50 text-slate-600">
      <Star className="h-2.5 w-2.5" />
      {jabatan}
    </span>
  )
}

function StatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    'Aktif': 'bg-emerald-500',
    'Tidak Aktif': 'bg-red-500',
    'Alumni': 'bg-slate-400',
  }
  return (
    <span className={cn('inline-block h-2 w-2 rounded-full flex-shrink-0', map[status] ?? 'bg-slate-300', status === 'Aktif' && 'animate-pulse')} />
  )
}

const STATUS_PILL: Record<string, string> = {
  'Aktif': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Tidak Aktif': 'bg-red-50 text-red-600 border-red-200',
  'Alumni': 'bg-slate-100 text-slate-600 border-slate-200',
}

const AVATAR_GRAD: string[] = [
  'from-violet-500 to-indigo-500',
  'from-sky-500 to-cyan-400',
  'from-rose-500 to-pink-400',
  'from-amber-500 to-orange-400',
  'from-teal-500 to-emerald-400',
  'from-fuchsia-500 to-purple-500',
]

function avatarGrad(name: string) {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xfff
  return AVATAR_GRAD[h % AVATAR_GRAD.length]
}

export function AnggotaClient({ initialData, totalCount }: AnggotaClientProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [editData, setEditData] = useState<Partial<Member> | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteLabel, setDeleteLabel] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortAsc, setSortAsc] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'all' | 'Aktif' | 'Tidak Aktif' | 'Alumni'>('all')

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await deleteMember(deleteId)
      toast.success('Anggota berhasil dihapus')
      setDeleteId(null)
      startTransition(() => router.refresh())
    } catch {
      toast.error('Gagal menghapus anggota')
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredData = useMemo(() => {
    let d = initialData.filter(m => {
      const q = search.toLowerCase()
      const matchSearch = !q ||
        m.name.toLowerCase().includes(q) ||
        (m.nis ?? '').toLowerCase().includes(q) ||
        m.class.toLowerCase().includes(q) ||
        (m.jabatan ?? '').toLowerCase().includes(q)
      const matchStatus = filterStatus === 'all' || m.status === filterStatus
      return matchSearch && matchStatus
    })

    d = [...d].sort((a, b) => {
      let av = '', bv = ''
      if (sortField === 'name') { av = a.name; bv = b.name }
      else if (sortField === 'class') { av = a.class; bv = b.class }
      else if (sortField === 'jabatan') { av = a.jabatan ?? ''; bv = b.jabatan ?? '' }
      else if (sortField === 'status') { av = a.status; bv = b.status }
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av)
    })

    // Priority Sort (Jabatan Utama di atas, lalu urut rank: Ketua -> Wakil dst)
    d.sort((a, b) => {
      const rankA = getJabatanRank(a.jabatan)
      const rankB = getJabatanRank(b.jabatan)
      
      // Jika rank berbeda, yang lebih kecil (1, 2, dst) ada di atas
      if (rankA !== rankB) {
        return rankA - rankB
      }
      return 0
    })

    return d
  }, [initialData, search, sortField, sortAsc, filterStatus])

  const countAktif = initialData.filter(m => m.status === 'Aktif').length
  const countTimInti = initialData.filter(m => m.tipe_keanggotaan === 'Tim Inti').length

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(p => !p)
    else { setSortField(field); setSortAsc(true) }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black tracking-tight text-slate-800">Anggota OSIS</h1>
        <p className="text-sm text-slate-500">Kelola data siswa dan anggota yang terdaftar dalam kas</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 flex items-center gap-3">
          <div className="h-9 w-9 shrink-0 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Users className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</p>
            <p className="text-xl font-black text-slate-800">{totalCount}</p>
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-emerald-100 shadow-sm p-4 flex items-center gap-3">
          <div className="h-9 w-9 shrink-0 rounded-xl bg-emerald-50 flex items-center justify-center">
            <UserCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Aktif</p>
            <p className="text-xl font-black text-slate-800">{countAktif}</p>
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-amber-100 shadow-sm p-4 flex items-center gap-3">
          <div className="h-9 w-9 shrink-0 rounded-xl bg-amber-50 flex items-center justify-center">
            <Crown className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Tim Inti</p>
            <p className="text-xl font-black text-slate-800">{countTimInti}</p>
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-red-100 shadow-sm p-4 flex items-center gap-3">
          <div className="h-9 w-9 shrink-0 rounded-xl bg-red-50 flex items-center justify-center">
            <UserX className="h-4 w-4 text-red-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Tdk Aktif</p>
            <p className="text-xl font-black text-slate-800">{totalCount - countAktif}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-white border border-slate-100 shadow-sm p-4">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, NIS, kelas, jabatan..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 py-2.5 pr-3 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-1 focus:ring-indigo-300 transition-all"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Status */}
          {(['all', 'Aktif', 'Tidak Aktif', 'Alumni'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all border',
                filterStatus === s
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'
              )}
            >
              {s === 'all' ? 'Semua' : s}
            </button>
          ))}

          {/* View mode */}
          <div className="flex items-center gap-0.5 rounded-xl bg-slate-100 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn('p-1.5 rounded-lg transition-all', viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600')}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn('p-1.5 rounded-lg transition-all', viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600')}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Add button */}
          <button
            onClick={() => { setEditData(null); setShowForm(true) }}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Anggota</span>
          </button>
        </div>
      </div>

      {/* Empty */}
      {initialData.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white py-20 text-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
            <Users className="h-8 w-8 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-700">Belum ada anggota</h3>
            <p className="text-sm text-slate-400 mt-1">Tambahkan anggota OSIS pertama Anda</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition active:scale-95"
          >
            <Plus className="h-4 w-4" /> Tambah Anggota
          </button>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white py-16 gap-2">
          <Search className="h-8 w-8 text-slate-300" />
          <p className="text-sm font-semibold text-slate-500">Tidak ada hasil untuk &ldquo;{search}&rdquo;</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* === GRID VIEW === */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredData.map(m => (
            <div
              key={m.id}
              className="group relative rounded-[1.5rem] bg-white border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-xl hover:shadow-indigo-100/40 hover:-translate-y-1 transition-all duration-300"
            >
              {/* Card top accent */}
              {isJabatanUtama(m.jabatan) && (
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-[1.5rem] bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400" />
              )}

              <div className="p-5">
                {/* Avatar + actions */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      'h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-md bg-gradient-to-br',
                      avatarGrad(m.name)
                    )}>
                      {getInitials(m.name)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800 text-[14px] truncate leading-tight" title={m.name}>{m.name}</h3>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">{m.nis || '—'}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200 shrink-0">
                    <button
                      onClick={() => { setEditData(m); setShowForm(true) }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => { setDeleteId(m.id); setDeleteLabel(m.name) }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Info rows */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                      <BookOpen className="h-3 w-3" /> Kelas
                    </span>
                    <span className="font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">{m.class}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className="text-slate-400 font-semibold flex items-center gap-1.5 shrink-0">
                      <Wallet className="h-3 w-3" /> Tipe
                    </span>
                    <span className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-lg border truncate max-w-[100px] text-right',
                      m.tipe_keanggotaan === 'Tim Inti'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    )}>
                      {m.tipe_keanggotaan || 'Anggota Biasa'}
                    </span>
                  </div>

                  {m.jabatan && (
                    <div className="flex items-center justify-between text-xs gap-2">
                      <span className="text-slate-400 font-semibold shrink-0">Jabatan</span>
                      <JabatanBadge jabatan={m.jabatan} />
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <StatusDot status={m.status} />
                    <span className={cn('text-[11px] font-bold px-2 py-0.5 rounded-full border', STATUS_PILL[m.status])}>
                      {m.status}
                    </span>
                  </div>
                  {m.phone && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Phone className="h-3 w-3" />
                      <span className="truncate max-w-[90px]">{m.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* === LIST VIEW === */
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="px-5 py-3.5">
                    <button
                      onClick={() => toggleSort('name')}
                      className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-600"
                    >
                      Anggota <SortIcon field="name" />
                    </button>
                  </th>
                  <th className="px-4 py-3.5">
                    <button
                      onClick={() => toggleSort('class')}
                      className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-600"
                    >
                      Kelas <SortIcon field="class" />
                    </button>
                  </th>
                  <th className="px-4 py-3.5">
                    <button
                      onClick={() => toggleSort('jabatan')}
                      className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-600"
                    >
                      Jabatan & Tipe <SortIcon field="jabatan" />
                    </button>
                  </th>
                  <th className="px-4 py-3.5">
                    <button
                      onClick={() => toggleSort('status')}
                      className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-600"
                    >
                      Status <SortIcon field="status" />
                    </button>
                  </th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-widest text-slate-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map(m => (
                  <tr key={m.id} className="group hover:bg-indigo-50/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'h-9 w-9 shrink-0 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-sm bg-gradient-to-br',
                          avatarGrad(m.name)
                        )}>
                          {getInitials(m.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-800 text-sm truncate">{m.name}</div>
                          <div className="text-xs text-slate-400 font-medium truncate flex items-center gap-1.5">
                            {m.nis || 'Non-NIS'}
                            {m.phone && <><span className="w-1 h-1 rounded-full bg-slate-300 inline-block" /><Phone className="h-2.5 w-2.5" />{m.phone}</>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 text-xs">{m.class}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-1 items-start">
                        <JabatanBadge jabatan={m.jabatan} />
                        <span className={cn(
                          'text-[10px] font-semibold px-1.5 py-0.5 rounded border mt-0.5',
                          m.tipe_keanggotaan === 'Tim Inti'
                            ? 'bg-purple-50 text-purple-600 border-purple-200'
                            : 'bg-slate-50 text-slate-500 border-slate-200'
                        )}>
                          {m.tipe_keanggotaan || 'Anggota Biasa'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border', STATUS_PILL[m.status])}>
                        <StatusDot status={m.status} />
                        {m.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <button
                          onClick={() => { setEditData(m); setShowForm(true) }}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => { setDeleteId(m.id); setDeleteLabel(m.name) }}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer count */}
          <div className="border-t border-slate-100 px-5 py-3 bg-slate-50/50">
            <p className="text-xs text-slate-400 font-medium">
              Menampilkan <span className="font-bold text-slate-600">{filteredData.length}</span> dari <span className="font-bold text-slate-600">{totalCount}</span> anggota
            </p>
          </div>
        </div>
      )}

      {/* Form Modal */}
      <MemberForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditData(null) }}
        editData={editData}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Anggota"
        message={`Yakin ingin menghapus "${deleteLabel}"? Riwayat transaksi terkait anggota ini mungkin akan kehilangan referensi nama.`}
        isLoading={isDeleting}
      />
    </div>
  )
}
