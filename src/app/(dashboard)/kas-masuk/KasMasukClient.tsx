'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, TrendingUp } from 'lucide-react'
import { IncomeForm } from '@/components/transactions/IncomeForm'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { TransactionDetailModal } from '@/components/transactions/TransactionDetailModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatRupiah, formatDateTimeWITA, STATUS_COLORS, cn } from '@/lib/utils'
import { deleteIncomeTransaction } from '@/lib/actions/income.actions'
import { Member, Category, IncomeTransactionWithDetails } from '@/types/database.types'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface KasMasukClientProps {
  initialData: IncomeTransactionWithDetails[]
  totalCount: number
  members: Member[]
  categories: Category[]
}

export function KasMasukClient({ initialData, totalCount, members, categories }: KasMasukClientProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [editData, setEditData] = useState<IncomeTransactionWithDetails | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteLabel, setDeleteLabel] = useState('')
  const [detailTx, setDetailTx] = useState<IncomeTransactionWithDetails | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await deleteIncomeTransaction(deleteId)
      toast.success('Transaksi berhasil dihapus')
      setDeleteId(null)
      startTransition(() => router.refresh())
    } catch {
      toast.error('Gagal menghapus transaksi')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      {/* Top bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Total <span className="font-semibold text-slate-900">{totalCount}</span> transaksi pemasukan
        </p>
        <button onClick={() => { setEditData(null); setShowForm(true) }} className="btn-primary">
          <Plus className="h-4 w-4" /> Tambah Kas Masuk
        </button>
      </div>

      {initialData.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="Belum ada kas masuk"
          description="Mulai catat pemasukan OSIS hari ini."
          action={
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Plus className="h-4 w-4" /> Tambah Kas Masuk
            </button>
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-header">No</th>
                    <th className="table-header">Nama</th>
                    <th className="table-header">Kelas</th>
                    <th className="table-header">Tanggal</th>
                    <th className="table-header">Periode</th>
                    <th className="table-header">Nominal</th>
                    <th className="table-header">Metode</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {initialData.map((tx, idx) => (
                    <tr
                      key={tx.id}
                      className="table-row cursor-pointer"
                      onClick={() => setDetailTx(tx)}
                    >
                      <td className="table-cell text-slate-400 w-10">{idx + 1}</td>
                      <td className="table-cell font-semibold text-slate-800">{tx.payer_name}</td>
                      <td className="table-cell">
                        <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{tx.payer_class}</span>
                      </td>
                      <td className="table-cell text-slate-500 whitespace-nowrap text-xs">{formatDateTimeWITA(tx.created_at)}</td>
                      <td className="table-cell text-slate-500 text-xs whitespace-nowrap">{tx.period}</td>
                      <td className="table-cell font-bold text-emerald-600">{formatRupiah(tx.amount)}</td>
                      <td className="table-cell text-slate-500 text-xs">{tx.payment_method}</td>
                      <td className="table-cell">
                        <span className={cn('badge', STATUS_COLORS[tx.status] ?? 'bg-slate-100 text-slate-600')}>{tx.status}</span>
                      </td>
                      <td className="table-cell" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setEditData(tx); setShowForm(true) }} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600" title="Edit">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => { setDeleteId(tx.id); setDeleteLabel(tx.payer_name) }} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500" title="Hapus">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden space-y-3">
            {initialData.map((tx) => (
              <div
                key={tx.id}
                className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 cursor-pointer hover:shadow-md transition-all"
                onClick={() => setDetailTx(tx)}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{tx.payer_name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{tx.payer_class} · {tx.period}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-emerald-600 text-base">+{formatRupiah(tx.amount)}</p>
                    <span className={cn('badge text-[10px]', STATUS_COLORS[tx.status] ?? 'bg-slate-100 text-slate-600')}>{tx.status}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-600">{tx.payment_method}</span>
                    <span>{formatDateTimeWITA(tx.created_at)}</span>
                  </div>
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <button onClick={() => { setEditData(tx); setShowForm(true) }} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => { setDeleteId(tx.id); setDeleteLabel(tx.payer_name) }} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <IncomeForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditData(null) }}
        members={members}
        categories={categories}
        editData={editData ? {
          id: editData.id,
          member_id: editData.member_id,
          payer_name: editData.payer_name,
          payer_class: editData.payer_class,
          amount: editData.amount,
          payment_date: editData.payment_date,
          period: editData.period,
          payment_method: editData.payment_method,
          description: editData.description ?? undefined,
          status: editData.status,
          category_id: editData.category_id ?? undefined,
        } : null}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Transaksi"
        message={`Apakah Anda yakin ingin menghapus kas masuk dari ${deleteLabel}?`}
        isLoading={isDeleting}
      />

      <TransactionDetailModal
        isOpen={!!detailTx}
        onClose={() => setDetailTx(null)}
        transaction={detailTx ? {
          id: detailTx.id,
          type: 'income',
          amount: detailTx.amount,
          date: detailTx.payment_date,
          label: detailTx.payer_name,
          sublabel: detailTx.payer_class,
          status: detailTx.status,
          period: detailTx.period,
          paymentMethod: detailTx.payment_method,
          category: detailTx.categories?.name,
          description: detailTx.description ?? undefined,
          recordedBy: detailTx.profiles?.name ?? undefined,
          receiptUrl: detailTx.receipt_url ?? undefined,
        } : null}
      />
    </>
  )
}
