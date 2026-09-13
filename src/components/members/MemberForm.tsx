'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { createMember, updateMember } from '@/lib/actions/members.actions'
import { Member } from '@/types/database.types'
import { CLASS_LIST } from '@/lib/utils'
import toast from 'react-hot-toast'

interface MemberFormProps {
  isOpen: boolean
  onClose: () => void
  editData?: Partial<Member> | null
}

export function MemberForm({ isOpen, onClose, editData }: MemberFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      nis: (formData.get('nis') as string) || undefined,
      class: formData.get('class') as string,
      phone: (formData.get('phone') as string) || undefined,
      status: formData.get('status') as Member['status'],
      jabatan: formData.get('jabatan') as string || null,
      tipe_keanggotaan: formData.get('tipe_keanggotaan') as string || 'Anggota Biasa',
    }

    try {
      if (editData?.id) {
        await updateMember(editData.id, data)
        toast.success('Anggota berhasil diperbarui')
      } else {
        await createMember(data)
        toast.success('Anggota berhasil ditambahkan')
      }
      onClose()
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editData ? 'Edit Anggota' : 'Tambah Anggota Baru'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <div>
          <label htmlFor="name" className="mb-1 block text-xs font-medium text-slate-600">Nama Lengkap *</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={editData?.name}
            className="input-base"
            placeholder="Contoh: Budi Santoso"
          />
        </div>

        <div>
          <label htmlFor="nis" className="mb-1 block text-xs font-medium text-slate-600">NIS (Opsional)</label>
          <input
            id="nis"
            name="nis"
            type="text"
            defaultValue={editData?.nis ?? ''}
            className="input-base"
            placeholder="Nomor Induk Siswa"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="class" className="mb-1 block text-xs font-medium text-slate-600">Kelas *</label>
            <select
              id="class"
              name="class"
              required
              defaultValue={editData?.class ?? ''}
              className="input-base"
            >
              <option value="" disabled>Pilih Kelas</option>
              {CLASS_LIST.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status" className="mb-1 block text-xs font-medium text-slate-600">Status *</label>
            <select
              id="status"
              name="status"
              required
              defaultValue={editData?.status ?? 'Aktif'}
              className="input-base"
            >
              <option value="Aktif">Aktif</option>
              <option value="Tidak Aktif">Tidak Aktif</option>
              <option value="Alumni">Alumni</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="jabatan" className="mb-1 block text-xs font-medium text-slate-600">Jabatan (Opsional)</label>
            <input
              id="jabatan"
              name="jabatan"
              type="text"
              defaultValue={editData?.jabatan ?? ''}
              className="input-base"
              placeholder="Contoh: Ketua, Wakil Ketua, dll"
            />
          </div>
          <div>
            <label htmlFor="tipe_keanggotaan" className="mb-1 block text-xs font-medium text-slate-600">Tipe Keanggotaan *</label>
            <select
              id="tipe_keanggotaan"
              name="tipe_keanggotaan"
              required
              defaultValue={editData?.tipe_keanggotaan ?? 'Anggota Biasa'}
              className="input-base"
            >
              <option value="Tim Inti">Tim Inti</option>
              <option value="Anggota Biasa">Anggota Biasa</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="mb-1 block text-xs font-medium text-slate-600">No. Telepon / WA (Opsional)</label>
          <input
            id="phone"
            name="phone"
            type="text"
            defaultValue={editData?.phone ?? ''}
            className="input-base"
            placeholder="Contoh: 08123456789"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={isSubmitting}
          >
            Batal
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
