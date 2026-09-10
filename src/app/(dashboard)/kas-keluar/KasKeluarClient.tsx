'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, Receipt, Eye } from 'lucide-react'
import { ExpenseForm } from '@/components/transactions/ExpenseForm'
import { ReceiptModal } from '@/components/transactions/ReceiptModal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { TransactionDetailModal } from '@/components/transactions/TransactionDetailModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatRupiah, formatDateShort, cn } from '@/lib/utils'
import { deleteExpenseTransaction } from '@/lib/actions/expense.actions'
import { Category, ExpenseTransactionWithDetails } from '@/types/database.types'
import { TrendingDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface KasKeluarClientProps {
  initialData: ExpenseTransactionWithDetails[]
  totalCount: number
  categories: Category[]
}

export function KasKeluarClient({
  initialData,
  totalCount,
  categories,
}: KasKeluarClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [showForm, setShowForm] = useState(false)
  const [editData, setEditData] = useState<ExpenseTransactionWithDetails | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteTxNum, setDeleteTxNum] = useState('')
  const [receiptTx, setReceiptTx] = useState<ExpenseTransactionWithDetails | null>(null)
  const [detailTx, setDetailTx] = useState<ExpenseTransactionWithDetails | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await deleteExpenseTransaction(deleteId)
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
          Total <span className="font-semibold text-slate-900">{totalCount}</span> transaksi pengeluaran
        </p>
        <button
          onClick={() => { setEditData(null); setShowForm(true) }}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          Tambah Pengeluaran
        </button>
      </div>

      {/* Table */}
      {initialData.length === 0 ? (
        <EmptyState
          icon={TrendingDown}
          title="Belum ada pengeluaran"
          description="Mulai catat pengeluaran OSIS hari ini."
          action={
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Plus className="h-4 w-4" />
              Tambah Pengeluaran
            </button>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">No. Transaksi</th>
                  <th className="table-header">Tanggal</th>
                  <th className="table-header">Keperluan</th>
                  <th className="table-header">Kategori</th>
                  <th className="table-header">Total</th>
                  <th className="table-header">Dibayar Oleh</th>
                  <th className="table-header">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {initialData.map((tx) => (
                  <tr key={tx.id} className="table-row">
                    <td className="table-cell">
                      <span className="rounded-lg bg-indigo-50 px-2 py-0.5 text-xs font-mono font-medium text-indigo-700">
                        {tx.transaction_number}
                      </span>
                    </td>
                    <td className="table-cell text-slate-500">{formatDateShort(tx.expense_date)}</td>
                    <td className="table-cell font-medium text-slate-900">{tx.purpose}</td>
                    <td className="table-cell">
                      {tx.categories ? (
                        <span
                          className="badge text-white text-xs"
                          style={{ backgroundColor: tx.categories.color ?? '#94a3b8' }}
                        >
                          {tx.categories.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="table-cell font-semibold text-red-500">
                      {formatRupiah(tx.amount)}
                    </td>
                    <td className="table-cell text-slate-500">{tx.paid_by}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setDetailTx(tx)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                          title="Detail"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setReceiptTx(tx)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
                          title="Lihat Struk"
                        >
                          <Receipt className="h-3.5 w-3.5" />
                        </button>
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
                            setDeleteTxNum(tx.transaction_number)
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
      <ExpenseForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditData(null) }}
        categories={categories}
        editData={editData ? {
          id: editData.id,
          expense_date: editData.expense_date,
          category_id: editData.category_id ?? undefined,
          purpose: editData.purpose,
          paid_by: editData.paid_by,
          description: editData.description ?? undefined,
          expense_items: editData.expense_items,
        } : null}
      />

      <ReceiptModal
        isOpen={!!receiptTx}
        onClose={() => setReceiptTx(null)}
        transaction={receiptTx}
      />

      <TransactionDetailModal
        isOpen={!!detailTx}
        onClose={() => setDetailTx(null)}
        transaction={detailTx ? {
          id: detailTx.id,
          type: 'expense',
          amount: detailTx.amount,
          date: detailTx.expense_date,
          label: detailTx.purpose,
          sublabel: detailTx.transaction_number,
          category: detailTx.categories?.name,
          description: detailTx.description ?? undefined,
          paidBy: detailTx.paid_by,
          recordedBy: detailTx.profiles?.name ?? undefined,
          transactionNumber: detailTx.transaction_number,
          receiptUrl: detailTx.receipt_url ?? undefined,
        } : null}
        onViewReceipt={() => { setDetailTx(null); setReceiptTx(detailTx) }}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Transaksi"
        message={`Apakah Anda yakin ingin menghapus transaksi ${deleteTxNum}? Tindakan ini tidak dapat dibatalkan.`}
        isLoading={isDeleting}
      />
    </>
  )
}
