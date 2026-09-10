'use client'

import { AlertTriangle } from 'lucide-react'
import { Modal } from './Modal'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  isLoading?: boolean
  variant?: 'danger' | 'warning'
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi',
  message,
  confirmLabel = 'Ya, Hapus',
  cancelLabel = 'Batal',
  isLoading = false,
  variant = 'danger',
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              variant === 'danger' ? 'bg-red-50' : 'bg-yellow-50'
            }`}
          >
            <AlertTriangle
              className={`h-5 w-5 ${
                variant === 'danger' ? 'text-red-500' : 'text-yellow-500'
              }`}
            />
          </div>
          <div>
            <h3 className="mb-1 text-base font-semibold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary" disabled={isLoading}>
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={variant === 'danger' ? 'btn-danger' : 'btn-primary'}
          >
            {isLoading ? 'Memproses...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
