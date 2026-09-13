import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatRupiah, formatDate } from '@/lib/utils'
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react'

export const metadata: Metadata = { title: 'Riwayat Transaksi' }

export default async function TransaksiPage() {
  const supabase = await createClient()

  const [incomeRes, expenseRes] = await Promise.all([
    supabase
      .from('income_transactions')
      .select('id, payer_name, payer_class, amount, payment_date, period, payment_method, status, description, categories(name, color)')
      .order('payment_date', { ascending: false })
      .limit(100),
    supabase
      .from('expense_transactions')
      .select('id, transaction_number, purpose, amount, expense_date, description, paid_by, categories(name, color)')
      .order('expense_date', { ascending: false })
      .limit(100),
  ])

  const income = (incomeRes.data ?? []).map((t) => ({
    id: t.id,
    type: 'income' as const,
    date: t.payment_date,
    amount: t.amount,
    label: t.payer_name,
    sublabel: `${t.payer_class} · ${t.period}`,
    category: (t.categories as { name: string; color: string } | null)?.name,
    categoryColor: (t.categories as { name: string; color: string } | null)?.color,
    description: t.description,
    status: t.status,
  }))

  const expense = (expenseRes.data ?? []).map((t) => ({
    id: t.id,
    type: 'expense' as const,
    date: t.expense_date,
    amount: t.amount,
    label: t.purpose,
    sublabel: t.transaction_number,
    category: (t.categories as { name: string; color: string } | null)?.name,
    categoryColor: (t.categories as { name: string; color: string } | null)?.color,
    description: t.description,
    paidBy: t.paid_by,
  }))

  const combined = [...income, ...expense].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const totalIncome = income.reduce((s, t) => s + t.amount, 0)
  const totalExpense = expense.reduce((s, t) => s + t.amount, 0)

  // Group by date
  const grouped: Record<string, typeof combined> = {}
  for (const tx of combined) {
    const key = formatDate(tx.date, 'd MMMM yyyy')
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(tx)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Riwayat Transaksi</h1>
        <p className="text-sm text-slate-500 mt-1">Semua transaksi pemasukan dan pengeluaran OSIS</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm flex items-center gap-4">
          <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-50 flex items-center justify-center">
            <Clock className="h-5 w-5 text-slate-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Transaksi</p>
            <p className="text-2xl font-black text-slate-800 mt-0.5">{combined.length}</p>
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-emerald-100 p-5 shadow-sm flex items-center gap-4">
          <div className="h-11 w-11 shrink-0 rounded-xl bg-emerald-50 flex items-center justify-center">
            <ArrowUpRight className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Total Masuk</p>
            <p className="text-lg font-black text-emerald-700 mt-0.5">{formatRupiah(totalIncome)}</p>
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-red-100 p-5 shadow-sm flex items-center gap-4">
          <div className="h-11 w-11 shrink-0 rounded-xl bg-red-50 flex items-center justify-center">
            <ArrowDownLeft className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-red-500 uppercase tracking-wider">Total Keluar</p>
            <p className="text-lg font-black text-red-600 mt-0.5">{formatRupiah(totalExpense)}</p>
          </div>
        </div>
      </div>

      {/* Transactions */}
      {combined.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-20 text-center">
          <TrendingUp className="mb-3 h-10 w-10 text-slate-300" />
          <h3 className="text-base font-semibold text-slate-900">Belum ada transaksi</h3>
          <p className="mt-1 text-sm text-slate-400">
            Mulai catat pemasukan atau pengeluaran OSIS melalui menu Kas Masuk atau Kas Keluar.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, txs]) => (
            <div key={date}>
              <div className="mb-3 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-100" />
                <span className="text-xs font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100">{date}</span>
                <div className="h-px flex-1 bg-slate-100" />
              </div>

              <div className="space-y-2.5">
                {txs.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center gap-4 rounded-2xl bg-white border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        tx.type === 'income' ? 'bg-emerald-50' : 'bg-red-50'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-500" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-bold text-slate-800">{tx.label}</p>
                        {tx.category && (
                          <span
                            className="shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                            style={{ backgroundColor: tx.categoryColor ?? '#94a3b8' }}
                          >
                            {tx.category}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{tx.sublabel}</p>
                      {tx.description && (
                        <p className="mt-0.5 text-xs text-slate-500 truncate">{tx.description}</p>
                      )}
                    </div>

                    <div className="shrink-0 text-right">
                      <p
                        className={`text-base font-black ${
                          tx.type === 'income' ? 'text-emerald-600' : 'text-red-500'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}{formatRupiah(tx.amount)}
                      </p>
                      {tx.type === 'income' && tx.status && (
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                          {tx.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
