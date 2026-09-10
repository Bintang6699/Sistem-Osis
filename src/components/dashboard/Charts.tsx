'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { formatRupiah } from '@/lib/utils'

interface ChartData {
  label: string
  income: number
  expense: number
}

interface IncomeExpenseChartProps {
  data: ChartData[]
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="mb-2 font-semibold text-slate-900">{label}</p>
        {payload.map((p) => (
          <div key={p.name} className="flex items-center gap-2 text-xs">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-slate-500">{p.name === 'income' ? 'Pemasukan' : 'Pengeluaran'}:</span>
            <span className="font-semibold text-slate-900">{formatRupiah(p.value)}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <defs>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatRupiah(v, true)}
          width={70}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconSize={8}
          iconType="circle"
          formatter={(value) => (
            <span style={{ fontSize: 12, color: '#64748b' }}>
              {value === 'income' ? 'Pemasukan' : 'Pengeluaran'}
            </span>
          )}
        />
        <Area
          type="monotone"
          dataKey="income"
          stroke="#22c55e"
          strokeWidth={2}
          fill="url(#incomeGrad)"
          dot={{ r: 3, fill: '#22c55e', strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#22c55e', strokeWidth: 0 }}
        />
        <Area
          type="monotone"
          dataKey="expense"
          stroke="#ef4444"
          strokeWidth={2}
          fill="url(#expenseGrad)"
          dot={{ r: 3, fill: '#ef4444', strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#ef4444', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

interface CategoryData {
  name: string
  color: string
  amount: number
}

interface CategoryPieChartProps {
  data: CategoryData[]
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const total = data.reduce((s, d) => s + d.amount, 0)

  if (data.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-slate-400">
        Belum ada data pengeluaran
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width={160} height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={70}
            paddingAngle={2}
            dataKey="amount"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: number) => [formatRupiah(v), 'Total']}
            contentStyle={{
              borderRadius: '0.5rem',
              border: '1px solid #e2e8f0',
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="min-w-0 flex-1 space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
        {data.slice(0, 6).map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="min-w-0 truncate text-xs text-slate-600">{item.name}</span>
            <span className="ml-auto shrink-0 text-xs font-medium text-slate-900">
              {total > 0 ? Math.round((item.amount / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
