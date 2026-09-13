'use client'

import { useState, useTransition } from 'react'
import { Printer, Calendar as CalendarIcon, Download } from 'lucide-react'
import { formatRupiah, formatDateShort, cn } from '@/lib/utils'
import { getReportTransactions } from '@/lib/actions/report.actions'
import { TrendingUp, TrendingDown } from 'lucide-react'
import toast from 'react-hot-toast'

import { exportToExcel, exportToWord } from '@/lib/exportUtils'

interface LaporanClientProps {
  initialData: Awaited<ReturnType<typeof getReportTransactions>>
}

export function LaporanClient({ initialData }: LaporanClientProps) {
  const [data, setData] = useState(initialData)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleFilter = () => {
    startTransition(async () => {
      try {
        const result = await getReportTransactions(dateFrom || undefined, dateTo || undefined)
        setData(result)
        toast.success('Laporan diperbarui')
      } catch {
        toast.error('Gagal mengambil laporan')
      }
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExportExcel = () => {
    exportToExcel(data.transactions, data.summary);
  }

  const handleExportWord = async () => {
    await exportToWord(data.transactions, data.summary);
  }

  const { summary, transactions } = data

  return (
    <div className="space-y-6">
      {/* Filter bar - hidden on print */}
      <div className="print:hidden card p-4 flex flex-wrap items-end gap-2">
        <div>
          <label className="label text-xs">Dari Tanggal</label>
          <input 
            type="date" 
            className="input py-2" 
            value={dateFrom} 
            onChange={(e) => setDateFrom(e.target.value)} 
          />
        </div>
        <div>
          <label className="label text-xs">Sampai Tanggal</label>
          <input 
            type="date" 
            className="input py-2" 
            value={dateTo} 
            onChange={(e) => setDateTo(e.target.value)} 
          />
        </div>
        <button onClick={handleFilter} disabled={isPending} className="btn-primary py-2 h-[42px] mr-2">
          {isPending ? 'Memuat...' : 'Filter'}
        </button>
        <div className="flex-1"></div>
        <button onClick={handleExportExcel} className="btn-secondary py-2 h-[42px]">
          <Download className="h-4 w-4" />
          Excel
        </button>
        <button onClick={handleExportWord} className="btn-secondary py-2 h-[42px]">
          <Download className="h-4 w-4" />
          Word
        </button>
        <button onClick={handlePrint} className="btn-secondary py-2 h-[42px]">
          <Printer className="h-4 w-4" />
          PDF / Cetak
        </button>
      </div>

      {/* Report Header for Print */}
      <div className="hidden print:block text-center mb-8 border-b-2 border-black pb-4">
        <h1 className="text-2xl font-bold text-black uppercase tracking-wider">Laporan Keuangan OSIS</h1>
        <h2 className="text-xl font-bold text-black">SMP 01 DOMPU</h2>
        <p className="text-sm mt-2 text-gray-700">
          Periode: {dateFrom ? formatDateShort(dateFrom) : 'Awal'} - {dateTo ? formatDateShort(dateTo) : 'Sekarang'}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-5 bg-white print:border-black print:border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-50 print:bg-transparent">
              <TrendingUp className="h-5 w-5 text-emerald-600 print:text-black" />
            </div>
            <p className="text-sm font-medium text-slate-500 print:text-black">Total Pemasukan</p>
          </div>
          <p className="text-2xl font-bold text-slate-900 print:text-black">{formatRupiah(summary.totalIncome)}</p>
          <p className="text-xs text-slate-400 mt-1 print:hidden">{summary.incomeCount} transaksi</p>
        </div>
        <div className="card p-5 bg-white print:border-black print:border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-red-50 print:bg-transparent">
              <TrendingDown className="h-5 w-5 text-red-500 print:text-black" />
            </div>
            <p className="text-sm font-medium text-slate-500 print:text-black">Total Pengeluaran</p>
          </div>
          <p className="text-2xl font-bold text-slate-900 print:text-black">{formatRupiah(summary.totalExpense)}</p>
          <p className="text-xs text-slate-400 mt-1 print:hidden">{summary.expenseCount} transaksi</p>
        </div>
        <div className="card p-5 bg-indigo-600 text-white print:bg-white print:text-black print:border-black print:border">
          <p className="text-sm font-medium text-indigo-100 print:text-black mb-2">Saldo Akhir</p>
          <p className="text-3xl font-bold">{formatRupiah(summary.balance)}</p>
          <p className="text-xs text-indigo-200 mt-1 print:hidden">Berdasarkan filter saat ini</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card overflow-hidden print:shadow-none print:border print:border-black">
        <div className="p-5 border-b border-slate-100 print:border-black bg-slate-50 print:bg-transparent">
          <h3 className="font-semibold text-slate-900 print:text-black">Detail Transaksi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 print:border-black">
                <th className="table-header print:text-black font-bold">Tanggal</th>
                <th className="table-header print:text-black font-bold">Keterangan</th>
                <th className="table-header print:text-black font-bold">Kategori</th>
                <th className="table-header print:text-black font-bold text-right">Kas Masuk</th>
                <th className="table-header print:text-black font-bold text-right">Kas Keluar</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Tidak ada transaksi pada periode ini.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-slate-100 print:border-black last:border-0">
                    <td className="table-cell text-slate-600 print:text-black text-sm">
                      {formatDateShort(tx.date)}
                    </td>
                    <td className="table-cell print:text-black">
                      <p className="font-medium text-slate-900 print:text-black">{tx.label}</p>
                      <p className="text-xs text-slate-500 print:text-black">{tx.sublabel}</p>
                    </td>
                    <td className="table-cell text-slate-600 print:text-black text-sm">
                      {tx.category}
                    </td>
                    <td className="table-cell text-right font-medium text-emerald-600 print:text-black">
                      {tx.type === 'income' ? formatRupiah(tx.amount) : '-'}
                    </td>
                    <td className="table-cell text-right font-medium text-red-500 print:text-black">
                      {tx.type === 'expense' ? formatRupiah(tx.amount) : '-'}
                    </td>
                  </tr>
                ))
              )}
              {/* Grand Total Row for Print */}
              <tr className="hidden print:table-row font-bold border-t-2 border-black">
                <td colSpan={3} className="py-3 px-4 text-right">TOTAL</td>
                <td className="py-3 px-4 text-right">{formatRupiah(summary.totalIncome)}</td>
                <td className="py-3 px-4 text-right">{formatRupiah(summary.totalExpense)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Signature Section for Print */}
      <div className="hidden print:flex mt-16 justify-between px-10">
        <div className="text-center">
          <p className="mb-20">Mengetahui,<br/>Pembina OSIS</p>
          <p className="font-bold underline">_________________________</p>
          <p>NIP.</p>
        </div>
        <div className="text-center">
          <p className="mb-20">Dompu, {new Date().toLocaleDateString('id-ID')}<br/>Bendahara OSIS</p>
          <p className="font-bold underline">_________________________</p>
          <p>NIS.</p>
        </div>
      </div>
    </div>
  )
}
