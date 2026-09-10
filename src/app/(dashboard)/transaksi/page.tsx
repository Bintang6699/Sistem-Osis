import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatRupiah, formatDate } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

export const metadata: Metadata = { title: 'Riwayat Transaksi' }

export default async function TransaksiPage() {
  const supabase = await createClient()

  const [incomeRes, expenseRes] = await Promise.all([
    supabase
      .from('income_transactions')
      .select('id, payer_name, payer_class, amount, payment_date, period, payment_method, status, description, categories(name, color), profiles!income_transactions_recorded_by_fkey(name)')
      .order('payment_date', { ascending: false })
      .limit(100),
    supabase
      .from('expense_transactions')
      .select('id, transaction_number, purpose, amount, expense_date, description, paid_by, categories(name, color), profiles!expense_transactions_recorded_by_fkey(name)')
      .order('expense_date', { ascending: false })
      .limit(100),
  ])

  type IncomeRow = NonNullable<typeof incomeRes.data>[0]
  type ExpenseRow = NonNullable<typeof expenseRes.data>[0]

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

  // Group by date
  const grouped: Record<string, typeof combined> = {}
  for (const tx of combined) {
    const key = formatDate(tx.date, 'd MMMM yyyy')
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(tx)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {combined.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-20 text-center">
          <TrendingUp className="mb-3 h-10 w-10 text-slate-300" />
          <h3 className="text-base font-semibold text-slate-900">Belum ada transaksi</h3>
          <p className="mt-1 text-sm text-slate-400">
            Mulai catat pemasukan atau pengeluaran OSIS.
          </p>
        </div>
      ) : (
        Object.entries(grouped).map(([date, txs]) => (
          <div key={date}>
            <div className="mb-3 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-xs font-semibold text-slate-400">{date}</span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            <div className="space-y-2">
              {txs.map((tx) => (
                <div
                  key={tx.id}
                  className="card flex items-center gap-4 p-4 transition-shadow hover:shadow-md"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
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
                    <div className="flex items-start gap-2">
                      <p className="truncate text-sm font-semibold text-slate-900">{tx.label}</p>
                      {tx.category && (
                        <span
                          className="badge shrink-0 text-white text-[11px]"
                          style={{ backgroundColor: tx.categoryColor ?? '#94a3b8' }}
                        >
                          {tx.category}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{tx.sublabel}</p>
                    {tx.description && (
                      <p className="mt-0.5 text-xs text-slate-500">{tx.description}</p>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <p
                      className={`text-base font-bold ${
                        tx.type === 'income' ? 'text-emerald-600' : 'text-red-500'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}{formatRupiah(tx.amount)}
                    </p>
                    {tx.type === 'income' && (tx as typeof income[0]).status && (
                      <span className="text-[11px] text-slate-400">
                        {(tx as typeof income[0]).status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
