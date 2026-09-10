'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { formatRupiah, formatDate, formatDateShort } from '@/lib/utils'
import { Printer, Download, Share2, Receipt, X } from 'lucide-react'
import { ExpenseTransactionWithDetails } from '@/types/database.types'
import toast from 'react-hot-toast'

interface ReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: ExpenseTransactionWithDetails | null
}

export function ReceiptModal({ isOpen, onClose, transaction }: ReceiptModalProps) {
  if (!transaction) return null

  const handlePrint = () => {
    window.print()
  }

  const handleShare = async () => {
    const text = `*STRUK OSIS - ${transaction.transaction_number}*\n\n` +
      `Tanggal: ${formatDate(transaction.expense_date)}\n` +
      `Keperluan: ${transaction.purpose}\n` +
      `Total: ${formatRupiah(transaction.amount)}\n` +
      `Dibayar oleh: ${transaction.paid_by}`
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Teks struk disalin ke clipboard')
    } catch {
      toast.error('Gagal menyalin')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-6">
        {/* Receipt card */}
        <div className="receipt-content rounded-xl border border-slate-200 bg-slate-50 p-5 font-mono text-sm">
          {/* Header */}
          <div className="mb-4 text-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              ─── STRUK PENGELUARAN ───
            </p>
            <p className="mt-1 text-base font-bold text-slate-900">OSIS</p>
            <p className="text-xs text-slate-500">Sistem Informasi Keuangan OSIS</p>
          </div>

          <div className="mb-4 space-y-1 border-t border-dashed border-slate-300 pt-4 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">No. Transaksi</span>
              <span className="font-semibold text-slate-900">{transaction.transaction_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tanggal</span>
              <span className="text-slate-700">{formatDate(transaction.expense_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Keperluan</span>
              <span className="max-w-[55%] text-right text-slate-700">{transaction.purpose}</span>
            </div>
            {transaction.categories && (
              <div className="flex justify-between">
                <span className="text-slate-500">Kategori</span>
                <span className="text-slate-700">{transaction.categories.name}</span>
              </div>
            )}
          </div>

          {/* Items */}
          {transaction.expense_items && transaction.expense_items.length > 0 && (
            <div className="mb-4 border-t border-dashed border-slate-300 pt-4">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Detail Belanja
              </p>
              <div className="space-y-2.5">
                {transaction.expense_items.map((item, idx) => (
                  <div key={item.id ?? idx} className="text-xs">
                    <div className="mb-0.5 font-medium text-slate-800">{item.item_name}</div>
                    <div className="flex justify-between text-slate-500">
                      <span>
                        {item.quantity} × {formatRupiah(item.unit_price)}
                      </span>
                      <span className="font-semibold text-slate-700">
                        {formatRupiah(item.subtotal)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total */}
          <div className="border-t border-dashed border-slate-300 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">TOTAL</span>
              <span className="text-lg font-bold text-indigo-600">
                {formatRupiah(transaction.amount)}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 border-t border-dashed border-slate-300 pt-4 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Dibayar oleh</span>
              <span className="text-slate-700">{transaction.paid_by}</span>
            </div>
            {transaction.profiles && (
              <div className="flex justify-between">
                <span className="text-slate-500">Dicatat oleh</span>
                <span className="text-slate-700">{transaction.profiles.name}</span>
              </div>
            )}
            {transaction.description && (
              <div className="flex justify-between">
                <span className="text-slate-500">Keterangan</span>
                <span className="max-w-[55%] text-right text-slate-700">{transaction.description}</span>
              </div>
            )}
          </div>

          <div className="mt-4 text-center">
            <p className="text-[10px] text-slate-400">
              ─── Terima Kasih ───
            </p>
            <p className="mt-0.5 text-[10px] text-slate-400">
              Dicetak: {formatDate(new Date())}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={handlePrint} className="btn-secondary flex-1">
            <Printer className="h-4 w-4" />
            Cetak
          </button>
          <button onClick={handleShare} className="btn-secondary flex-1">
            <Share2 className="h-4 w-4" />
            Salin
          </button>
          <button onClick={onClose} className="btn-ghost flex-1">
            <X className="h-4 w-4" />
            Tutup
          </button>
        </div>

        {/* Receipt image if available */}
        {transaction.receipt_url && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-slate-500">Bukti Transaksi</p>
            <img
              src={transaction.receipt_url}
              alt="Bukti transaksi"
              className="w-full rounded-lg object-contain border border-slate-200"
              style={{ maxHeight: 200 }}
            />
          </div>
        )}
      </div>
    </Modal>
  )
}
