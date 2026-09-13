import type { Metadata } from 'next'
import { getReportTransactions } from '@/lib/actions/report.actions'
import { LaporanClient } from './LaporanClient'

export const metadata: Metadata = {
  title: 'Laporan Keuangan',
}

export default async function LaporanPage() {
  // Fetch initial report without date filters (all time)
  const initialData = await getReportTransactions()

  return (
    <div className="space-y-6 animate-fade-in print:m-0 print:p-0">
      <div className="print:hidden">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Laporan Keuangan</h1>
        <p className="text-sm text-slate-500">Rekapitulasi kas masuk dan keluar. Cetak untuk laporan pertanggungjawaban.</p>
      </div>
      
      <LaporanClient initialData={initialData} />
    </div>
  )
}
