'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { formatRupiah, formatDate, STATUS_COLORS, cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Receipt, ExternalLink } from 'lucide-react'

interface TransactionDetailModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: {
    id: string
    type: 'income' | 'expense'
    amount: number
    date: string
    label: string
    sublabel?: string
    status?: string
    period?: string
    paymentMethod?: string
    category?: string
    categoryColor?: string
    description?: string
    paidBy?: string
    recordedBy?: string
    transactionNumber?: string
    receiptUrl?: string
  } | null
  onViewReceipt?: () => void
}

export function TransactionDetailModal({
  isOpen,
  onClose,
  transaction,
  onViewReceipt,
}: TransactionDetailModalProps) {
  if (!transaction) return null

  const isIncome = transaction.type === 'income'

  const rows = [
    transaction.transactionNumber && { label: 'No. Transaksi', value: transaction.transactionNumber },
    { label: 'Tanggal', value: formatDate(transaction.date) },
    { label: 'Jenis', value: isIncome ? 'Pemasukan' : 'Pengeluaran' },
    transaction.category && { label: 'Kategori', value: transaction.category },
    transaction.period && { label: 'Periode', value: transaction.period },
    transaction.paymentMethod && { label: 'Metode Bayar', value: transaction.paymentMethod },
    transaction.paidBy && { label: 'Dibayar oleh', value: transaction.paidBy },
    transaction.recordedBy && { label: 'Dicatat oleh', value: transaction.recordedBy },
    transaction.description && { label: 'Keterangan', value: transaction.description },
  ].filter(Boolean) as Array<{ label: string; value: string }>

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Transaksi" size="md">
      <div className="p-6">
        {/* Type indicator & amount */}
        <div
          className={cn(
            'mb-6 flex items-center gap-4 rounded-xl p-4',
            isIncome ? 'bg-emerald-50' : 'bg-red-50'
          )}
        >
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl',
              isIncome ? 'bg-emerald-100' : 'bg-red-100'
            )}
          >
            {isIncome ? (
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            ) : (
              <TrendingDown className="h-6 w-6 text-red-500" />
            )}
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">{transaction.label}</p>
            {transaction.sublabel && (
              <p className="text-sm text-slate-500">{transaction.sublabel}</p>
            )}
          </div>
          <div className="ml-auto text-right">
            <p
              className={cn(
                'text-xl font-bold',
                isIncome ? 'text-emerald-600' : 'text-red-500'
              )}
            >
              {isIncome ? '+' : '-'}{formatRupiah(transaction.amount)}
            </p>
            {transaction.status && (
              <span className={cn('badge text-xs', STATUS_COLORS[transaction.status] ?? 'bg-slate-100 text-slate-600')}>
                {transaction.status}
              </span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex items-start justify-between gap-4">
              <span className="shrink-0 text-sm text-slate-500">{label}</span>
              <span className="text-right text-sm font-medium text-slate-900">{value}</span>
            </div>
          ))}
        </div>

        {/* Receipt image */}
        {transaction.receiptUrl && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Bukti Transaksi
            </p>
            <img
              src={transaction.receiptUrl}
              alt="Bukti transaksi"
              className="w-full rounded-xl border border-slate-100 object-contain"
              style={{ maxHeight: 200 }}
            />
          </div>
        )}

        {/* Actions */}
        {!isIncome && onViewReceipt && (
          <div className="mt-5 border-t border-slate-100 pt-4">
            <button onClick={onViewReceipt} className="btn-secondary w-full">
              <Receipt className="h-4 w-4" />
              Lihat Struk
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}
