'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { createIncomeTransaction, updateIncomeTransaction } from '@/lib/actions/income.actions'
import { CLASS_LIST, PAYMENT_METHODS, formatDate, getPeriodString, getMonthPeriodString } from '@/lib/utils'
import { Member, Category } from '@/types/database.types'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface IncomeFormProps {
  isOpen: boolean
  onClose: () => void
  members: Member[]
  categories: Category[]
  editData?: {
    id: string
    payer_name: string
    payer_class: string
    amount: number
    payment_date: string
    period: string
    payment_method: string
    description?: string
    status?: string
    category_id?: string
  } | null
}

export function IncomeForm({ isOpen, onClose, members, categories, editData }: IncomeFormProps) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [loading, setLoading] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [form, setForm] = useState({
    payer_name: '',
    payer_class: '',
    amount: '',
    payment_date: today,
    period: getMonthPeriodString(new Date()),
    payment_method: 'Tunai',
    description: '',
    status: 'Lunas',
    category_id: '',
  })

  useEffect(() => {
    if (editData) {
      setForm({
        payer_name: editData.payer_name,
        payer_class: editData.payer_class,
        amount: String(editData.amount),
        payment_date: editData.payment_date,
        period: editData.period,
        payment_method: editData.payment_method,
        description: editData.description ?? '',
        status: editData.status ?? 'Lunas',
        category_id: editData.category_id ?? '',
      })
    } else {
      setForm({
        payer_name: '',
        payer_class: '',
        amount: '',
        payment_date: today,
        period: getMonthPeriodString(new Date()),
        payment_method: 'Tunai',
        description: '',
        status: 'Lunas',
        category_id: '',
      })
      setSelectedMemberId('')
    }
  }, [editData, isOpen])

  const handleMemberSelect = (memberId: string) => {
    setSelectedMemberId(memberId)
    if (!memberId) {
      setForm((f) => ({ ...f, payer_name: '', payer_class: '' }))
      return
    }
    const member = members.find((m) => m.id === memberId)
    if (member) {
      setForm((f) => ({ ...f, payer_name: member.name, payer_class: member.class }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.payer_name || !form.payer_class || !form.amount || !form.period) {
      toast.error('Lengkapi semua kolom wajib')
      return
    }
    const amount = parseFloat(form.amount.replace(/[^0-9.]/g, ''))
    if (isNaN(amount) || amount <= 0) {
      toast.error('Nominal harus lebih dari 0')
      return
    }

    setLoading(true)
    try {
      const payload = {
        payer_name: form.payer_name,
        payer_class: form.payer_class,
        amount,
        payment_date: form.payment_date,
        period: form.period,
        payment_method: form.payment_method,
        description: form.description || undefined,
        status: form.status,
        category_id: form.category_id || undefined,
        member_id: selectedMemberId || undefined,
      }

      if (editData) {
        await updateIncomeTransaction(editData.id, payload)
        toast.success('Kas berhasil diperbarui')
      } else {
        await createIncomeTransaction(payload)
        toast.success('✓ Kas berhasil ditambahkan')
      }
      onClose()
    } catch (err) {
      toast.error('Gagal menyimpan kas. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (date: string) => {
    const d = new Date(date)
    setForm((f) => ({
      ...f,
      payment_date: date,
      period: getMonthPeriodString(d),
    }))
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editData ? 'Edit Kas Masuk' : 'Tambah Kas Masuk'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Member select */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Pilih Anggota (opsional)
          </label>
          <select
            value={selectedMemberId}
            onChange={(e) => handleMemberSelect(e.target.value)}
            className="input-base"
          >
            <option value="">-- Pilih dari daftar anggota --</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — {m.class}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Name */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Nama Pembayar <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.payer_name}
              onChange={(e) => setForm((f) => ({ ...f, payer_name: e.target.value }))}
              placeholder="Nama lengkap"
              required
              className="input-base"
            />
          </div>

          {/* Class */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Kelas <span className="text-red-400">*</span>
            </label>
            <select
              value={form.payer_class}
              onChange={(e) => setForm((f) => ({ ...f, payer_class: e.target.value }))}
              required
              className="input-base"
            >
              <option value="">Pilih kelas</option>
              {CLASS_LIST.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Nominal <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              placeholder="10000"
              min={1}
              required
              className="input-base"
            />
          </div>

          {/* Date */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Tanggal Bayar <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={form.payment_date}
              onChange={(e) => handleDateChange(e.target.value)}
              required
              className="input-base"
            />
          </div>

          {/* Period */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Periode <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.period}
              onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))}
              placeholder="September 2026"
              required
              className="input-base"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Metode Pembayaran
            </label>
            <select
              value={form.payment_method}
              onChange={(e) => setForm((f) => ({ ...f, payment_method: e.target.value }))}
              className="input-base"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="input-base"
            >
              <option value="Lunas">Lunas</option>
              <option value="Cicilan">Cicilan</option>
              <option value="Pending">Pending</option>
            </select>
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
        </div>

        {/* Description */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Keterangan</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Keterangan tambahan (opsional)"
            rows={2}
            className="input-base resize-none"
          />
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
