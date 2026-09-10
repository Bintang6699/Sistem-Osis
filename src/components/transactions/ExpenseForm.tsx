'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { createExpenseTransaction, updateExpenseTransaction } from '@/lib/actions/expense.actions'
import { formatRupiah } from '@/lib/utils'
import { Category } from '@/types/database.types'
import toast from 'react-hot-toast'
import { Plus, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

interface ExpenseItem {
  item_name: string
  quantity: number
  unit_price: number
}

interface ExpenseFormProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  editData?: {
    id: string
    expense_date: string
    category_id?: string
    purpose: string
    paid_by: string
    description?: string
    expense_items?: ExpenseItem[]
  } | null
}

const defaultItem = (): ExpenseItem => ({
  item_name: '',
  quantity: 1,
  unit_price: 0,
})

export function ExpenseForm({ isOpen, onClose, categories, editData }: ExpenseFormProps) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    expense_date: today,
    category_id: '',
    purpose: '',
    paid_by: '',
    description: '',
  })
  const [items, setItems] = useState<ExpenseItem[]>([defaultItem()])

  useEffect(() => {
    if (editData) {
      setForm({
        expense_date: editData.expense_date,
        category_id: editData.category_id ?? '',
        purpose: editData.purpose,
        paid_by: editData.paid_by,
        description: editData.description ?? '',
      })
      setItems(
        editData.expense_items && editData.expense_items.length > 0
          ? editData.expense_items
          : [defaultItem()]
      )
    } else {
      setForm({
        expense_date: today,
        category_id: '',
        purpose: '',
        paid_by: '',
        description: '',
      })
      setItems([defaultItem()])
    }
  }, [editData, isOpen])

  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  )

  const updateItem = (index: number, field: keyof ExpenseItem, value: string | number) => {
    setItems((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  const addItem = () => setItems((prev) => [...prev, defaultItem()])

  const removeItem = (index: number) => {
    if (items.length === 1) return
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.purpose || !form.paid_by) {
      toast.error('Lengkapi semua kolom wajib')
      return
    }
    if (items.some((item) => !item.item_name)) {
      toast.error('Nama item tidak boleh kosong')
      return
    }
    if (totalAmount <= 0) {
      toast.error('Total pengeluaran harus lebih dari 0')
      return
    }

    setLoading(true)
    try {
      const payload = {
        expense_date: form.expense_date,
        category_id: form.category_id || undefined,
        purpose: form.purpose,
        paid_by: form.paid_by,
        description: form.description || undefined,
        items: items.map((item) => ({
          ...item,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
        })),
      }

      if (editData) {
        await updateExpenseTransaction(editData.id, payload)
        toast.success('Pengeluaran berhasil diperbarui')
      } else {
        const res = await createExpenseTransaction(payload)
        toast.success(`✓ Transaksi ${res.transaction_number} berhasil disimpan`)
      }
      onClose()
    } catch (err) {
      toast.error('Gagal menyimpan pengeluaran. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editData ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Date */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Tanggal <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={form.expense_date}
              onChange={(e) => setForm((f) => ({ ...f, expense_date: e.target.value }))}
              required
              className="input-base"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Kategori</label>
            <select
              value={form.category_id}
              onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
              className="input-base"
            >
              <option value="">Pilih kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Purpose */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Keperluan <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.purpose}
              onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
              placeholder="misal: Konsumsi Rapat OSIS"
              required
              className="input-base"
            />
          </div>

          {/* Paid by */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Dibayar oleh <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.paid_by}
              onChange={(e) => setForm((f) => ({ ...f, paid_by: e.target.value }))}
              placeholder="misal: Bendahara OSIS"
              required
              className="input-base"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Keterangan</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Keterangan tambahan"
            rows={2}
            className="input-base resize-none"
          />
        </div>

        {/* Items */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Detail Item Belanja
            </label>
            <button
              type="button"
              onClick={addItem}
              className="btn-ghost text-xs py-1 px-2 h-auto text-indigo-600"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah Item
            </button>
          </div>

          <div className="rounded-xl border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="table-header">Nama Item</th>
                  <th className="table-header w-20">Qty</th>
                  <th className="table-header w-32">Harga Satuan</th>
                  <th className="table-header w-28 text-right">Subtotal</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-t border-slate-100">
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.item_name}
                        onChange={(e) => updateItem(idx, 'item_name', e.target.value)}
                        placeholder="Nama item"
                        className="input-base py-1.5 text-xs"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                        min={1}
                        className="input-base py-1.5 text-center text-xs"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => updateItem(idx, 'unit_price', Number(e.target.value))}
                        min={0}
                        className="input-base py-1.5 text-xs"
                      />
                    </td>
                    <td className="px-3 py-2 text-right text-xs font-medium text-slate-900">
                      {formatRupiah(item.quantity * item.unit_price)}
                    </td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        disabled={items.length === 1}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
            <span className="text-sm font-semibold text-slate-700">Total Pengeluaran</span>
            <span className="text-lg font-bold text-indigo-600">{formatRupiah(totalAmount)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
            Batal
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Menyimpan...' : editData ? 'Perbarui' : 'Simpan'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
