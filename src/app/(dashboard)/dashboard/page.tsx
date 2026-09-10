import type { Metadata } from 'next'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  CalendarDays,
  Activity,
} from 'lucide-react'
import { getDashboardStats, getMonthlyChartData, getCategoryDistribution, getRecentTransactions } from '@/lib/actions/dashboard.actions'
import { formatRupiah, formatDate } from '@/lib/utils'
import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { IncomeExpenseChart, CategoryPieChart } from '@/components/dashboard/Charts'
import { startOfMonth, endOfMonth, format, startOfWeek, endOfWeek } from 'date-fns'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default async function DashboardPage() {
  const now = new Date()
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')
  const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd')

  const [allStats, monthStats, weekStats, chartData, categoryData, recentTxs] =
    await Promise.all([
      getDashboardStats(),
      getDashboardStats(monthStart, monthEnd),
      getDashboardStats(weekStart, weekEnd),
      getMonthlyChartData(),
      getCategoryDistribution(monthStart, monthEnd),
      getRecentTransactions(8),
    ])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <DashboardCard
          title="Saldo Saat Ini"
          value={formatRupiah(allStats.balance)}
          subtitle="Total kas OSIS"
          icon={Wallet}
          variant="primary"
        />
        <DashboardCard
          title="Total Pemasukan"
          value={formatRupiah(allStats.totalIncome)}
          subtitle={`${allStats.incomeCount} transaksi`}
          icon={TrendingUp}
          variant="income"
        />
        <DashboardCard
          title="Total Pengeluaran"
          value={formatRupiah(allStats.totalExpense)}
          subtitle={`${allStats.expenseCount} transaksi`}
          icon={TrendingDown}
          variant="expense"
        />
        <DashboardCard
          title="Kas Bulan Ini"
          value={formatRupiah(monthStats.totalIncome)}
          subtitle={format(now, 'MMMM yyyy')}
          icon={CalendarDays}
          variant="income"
        />
        <DashboardCard
          title="Pengeluaran Bulan Ini"
          value={formatRupiah(monthStats.totalExpense)}
          subtitle={format(now, 'MMMM yyyy')}
          icon={TrendingDown}
          variant="expense"
        />
        <DashboardCard
          title="Jumlah Transaksi"
          value={`${allStats.totalTransactions}`}
          subtitle="Seluruh transaksi tercatat"
          icon={ArrowLeftRight}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="card p-5 lg:col-span-3">
          <h3 className="mb-1 text-sm font-semibold text-slate-900">Pemasukan vs Pengeluaran</h3>
          <p className="mb-4 text-xs text-slate-400">6 bulan terakhir</p>
          <IncomeExpenseChart data={chartData} />
        </div>

        <div className="card p-5 lg:col-span-2">
          <h3 className="mb-1 text-sm font-semibold text-slate-900">Distribusi Pengeluaran</h3>
          <p className="mb-4 text-xs text-slate-400">Bulan ini berdasarkan kategori</p>
          <CategoryPieChart data={categoryData} />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Transaksi Terbaru</h3>
            <p className="text-xs text-slate-400">Aktivitas keuangan terkini</p>
          </div>
          <a href="/transaksi" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
            Lihat semua →
          </a>
        </div>

        {recentTxs.length === 0 ? (
          <div className="flex items-center justify-center py-10 text-sm text-slate-400">
            Belum ada transaksi. Mulai catat kas OSIS sekarang.
          </div>
        ) : (
          <div className="space-y-1">
            {recentTxs.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    tx.type === 'income' ? 'bg-emerald-50' : 'bg-red-50'
                  }`}
                >
                  {tx.type === 'income' ? (
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{tx.label}</p>
                  <p className="text-xs text-slate-400">{tx.sublabel}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className={`text-sm font-semibold ${
                      tx.type === 'income' ? 'text-emerald-600' : 'text-red-500'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}{formatRupiah(tx.amount)}
                  </p>
                  <p className="text-xs text-slate-400">{formatDate(tx.date, 'd MMM')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
