import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from 'date-fns'
import { id } from 'date-fns/locale'

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency to Rupiah
export function formatRupiah(amount: number, compact = false): string {
  if (compact && Math.abs(amount) >= 1_000_000) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount)
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format date to Indonesian locale
export function formatDate(date: string | Date, fmt = 'd MMMM yyyy'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, fmt, { locale: id })
}

// Format date short
export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'dd/MM/yyyy', { locale: id })
}

// Format date to local timezone WITA
export function formatDateTimeWITA(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  // e.g. "Rabu, 12 Sep 2026 14.30 WITA"
  const formatted = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Makassar',
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  }).format(d)
  return formatted.replace('.', ':') // Replace the dot in time with colon if preferred
}

// Generate transaction number: TRX-YYYYMMDD-XXX
export function generateTransactionNumber(sequence: number): string {
  const today = format(new Date(), 'yyyyMMdd')
  const seq = String(sequence).padStart(3, '0')
  return `TRX-${today}-${seq}`
}

// Get date range for filters
export type DateFilterType = 'today' | 'this_week' | 'this_month' | 'last_month' | 'this_year' | 'custom'

export function getDateRange(filter: DateFilterType, customStart?: Date, customEnd?: Date): { start: Date; end: Date } {
  const now = new Date()
  switch (filter) {
    case 'today':
      return { start: now, end: now }
    case 'this_week':
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) }
    case 'this_month':
      return { start: startOfMonth(now), end: endOfMonth(now) }
    case 'last_month':
      const lastMonth = subMonths(now, 1)
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) }
    case 'this_year':
      return { start: startOfYear(now), end: endOfYear(now) }
    case 'custom':
      return { start: customStart ?? now, end: customEnd ?? now }
    default:
      return { start: startOfMonth(now), end: endOfMonth(now) }
  }
}

// Generate period string (e.g. "Minggu ke-1 September 2026")
export function getPeriodString(date: Date): string {
  const weekOfMonth = Math.ceil(date.getDate() / 7)
  const monthYear = format(date, 'MMMM yyyy', { locale: id })
  return `Minggu ke-${weekOfMonth} ${monthYear}`
}

// Get month period string (e.g. "September 2026")
export function getMonthPeriodString(date: Date): string {
  return format(date, 'MMMM yyyy', { locale: id })
}

// Capitalize first letter
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Parse rupiah string to number
export function parseRupiah(value: string): number {
  return Number(value.replace(/[^0-9]/g, ''))
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

// Indonesian class list
export const CLASS_LIST = [
  'VII A', 'VII B', 'VII C', 'VII D', 'VII E', 'VII F', 'VII G', 'VII H', 'VII I', 'VII J', 'VII K', 'VII L',
  'VIII A', 'VIII B', 'VIII C', 'VIII D', 'VIII E', 'VIII F', 'VIII G', 'VIII H', 'VIII I', 'VIII J', 'VIII K', 'VIII L',
  'IX A', 'IX B', 'IX C', 'IX D', 'IX E', 'IX F', 'IX G', 'IX H', 'IX I', 'IX J', 'IX K', 'IX L',
]

// Payment methods
export const PAYMENT_METHODS = ['Tunai', 'Transfer', 'QRIS', 'Lainnya'] as const

// Role labels
export const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrator',
  bendahara: 'Bendahara',
  viewer: 'Viewer',
}

// Status colors
export const STATUS_COLORS: Record<string, string> = {
  Lunas: 'bg-emerald-100 text-emerald-700',
  Cicilan: 'bg-yellow-100 text-yellow-700',
  Pending: 'bg-red-100 text-red-700',
  Aktif: 'bg-emerald-100 text-emerald-700',
  'Tidak Aktif': 'bg-gray-100 text-gray-500',
  Alumni: 'bg-blue-100 text-blue-700',
}
