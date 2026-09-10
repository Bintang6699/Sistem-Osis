'use client'

import { useState, useTransition } from 'react'
import { Plus, Search, Filter, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { IncomeForm } from '@/components/transactions/IncomeForm'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { TransactionDetailModal } from '@/components/transactions/TransactionDetailModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatRupiah, formatDate, formatDateShort, STATUS_COLORS, CLASS_LIST, cn } from '@/lib/utils'
import { deleteIncomeTransaction } from '@/lib/actions/income.actions'
import { Member, Category, IncomeTransactionWithDetails } from '@/types/database.types'
import { TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface KasMasukClientProps {
  initialData: IncomeTransactionWithDetails[]
  totalCount: number
  members: Member[]
  categories: Category[]
}

export function KasMasukClient({
  initialData,
  totalCount,
  members,
  categories,
}: KasMasukClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

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
        <div>
          <p className="text-sm text-slate-500">
            Total <span className="font-semibold text-slate-900">{totalCount}</span> transaksi pemasukan
          </p>
        </div>
        <button
          onClick={() => { setEditData(null); setShowForm(true) }}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          Tambah Kas Masuk
        </button>
      </div>

      {/* Table */}
      {initialData.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="Belum ada kas masuk"
          description="Mulai catat pemasukan OSIS hari ini."
          action={
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Plus className="h-4 w-4" />
              Tambah Kas Masuk
            </button>
          }
        />
      ) : (
        <div className="card overflow-hidden">
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
                  <th className="table-header">Keterangan</th>
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
                    <td className="table-cell text-slate-400">{idx + 1}</td>
                    <td className="table-cell font-medium text-slate-900">{tx.payer_name}</td>
                    <td className="table-cell">
                      <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {tx.payer_class}
                      </span>
                    </td>
                    <td className="table-cell text-slate-500">{formatDateShort(tx.payment_date)}</td>
                    <td className="table-cell text-slate-500 text-xs">{tx.period}</td>
                    <td className="table-cell font-semibold text-emerald-600">
                      {formatRupiah(tx.amount)}
                    </td>
                    <td className="table-cell text-slate-500 text-xs">{tx.payment_method}</td>
                    <td className="table-cell">
                      <span className={cn('badge', STATUS_COLORS[tx.status] ?? 'bg-slate-100 text-slate-600')}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="table-cell text-slate-400 text-xs max-w-[120px] truncate">
                      {tx.description ?? '—'}
                    </td>
                    <td className="table-cell" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditData(tx); setShowForm(true) }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteId(tx.id)
                            setDeleteLabel(tx.payer_name)
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500"
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
        </div>
      )}

      {/* Modals */}
      <IncomeForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditData(null) }}
        members={members}
        categories={categories}
        editData={editData ? {
          id: editData.id,
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
        message={`Apakah Anda yakin ingin menghapus kas masuk dari ${deleteLabel}? Tindakan ini tidak dapat dibatalkan.`}
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
