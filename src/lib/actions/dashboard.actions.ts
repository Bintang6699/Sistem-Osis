'use server'

import { createClient } from '@/lib/supabase/server'

export async function getDashboardStats(dateFrom?: string, dateTo?: string) {
  const supabase = await createClient()

  // Total income
  let incomeQuery = supabase
    .from('income_transactions')
    .select('amount, payment_date')
  if (dateFrom) incomeQuery = incomeQuery.gte('payment_date', dateFrom)
  if (dateTo) incomeQuery = incomeQuery.lte('payment_date', dateTo)
  const { data: incomeData } = await incomeQuery

  // Total expense
  let expenseQuery = supabase
    .from('expense_transactions')
    .select('amount, expense_date')
  if (dateFrom) expenseQuery = expenseQuery.gte('expense_date', dateFrom)
  if (dateTo) expenseQuery = expenseQuery.lte('expense_date', dateTo)
  const { data: expenseData } = await expenseQuery

  const totalIncome = incomeData?.reduce((s, t) => s + t.amount, 0) ?? 0
  const totalExpense = expenseData?.reduce((s, t) => s + t.amount, 0) ?? 0
  const balance = totalIncome - totalExpense

  return {
    totalIncome,
    totalExpense,
    balance,
    incomeCount: incomeData?.length ?? 0,
    expenseCount: expenseData?.length ?? 0,
    totalTransactions: (incomeData?.length ?? 0) + (expenseData?.length ?? 0),
  }
}

// Get monthly chart data (last 6 months)
export async function getMonthlyChartData() {
  const supabase = await createClient()
  const now = new Date()
  const months: Array<{ label: string; year: number; month: number }> = []

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      label: d.toLocaleString('id-ID', { month: 'short' }),
      year: d.getFullYear(),
      month: d.getMonth() + 1,
    })
  }

  const { data: incomeAll } = await supabase
    .from('income_transactions')
    .select('amount, payment_date')
    .gte('payment_date', `${months[0].year}-${String(months[0].month).padStart(2, '0')}-01`)

  const { data: expenseAll } = await supabase
    .from('expense_transactions')
    .select('amount, expense_date')
    .gte('expense_date', `${months[0].year}-${String(months[0].month).padStart(2, '0')}-01`)

  return months.map((m) => {
    const monthStr = String(m.month).padStart(2, '0')
    const prefix = `${m.year}-${monthStr}`

    const income = incomeAll
      ?.filter((t) => t.payment_date.startsWith(prefix))
      .reduce((s, t) => s + t.amount, 0) ?? 0

    const expense = expenseAll
      ?.filter((t) => t.expense_date.startsWith(prefix))
      .reduce((s, t) => s + t.amount, 0) ?? 0

    return { label: m.label, income, expense }
  })
}

// Get expense category distribution
export async function getCategoryDistribution(dateFrom?: string, dateTo?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('expense_transactions')
    .select('amount, categories(name, color)')
  if (dateFrom) query = query.gte('expense_date', dateFrom)
  if (dateTo) query = query.lte('expense_date', dateTo)

  const { data } = await query

  const distribution: Record<string, { name: string; color: string; amount: number }> = {}

  data?.forEach((t) => {
    const cat = (t.categories as { name: string; color: string } | null)
    const key = cat?.name ?? 'Lainnya'
    if (!distribution[key]) {
      distribution[key] = { name: key, color: cat?.color ?? '#94a3b8', amount: 0 }
    }
    distribution[key].amount += t.amount
  })

  return Object.values(distribution).sort((a, b) => b.amount - a.amount)
}

// Get recent transactions (combined)
export async function getRecentTransactions(limit = 10) {
  const supabase = await createClient()

  const [incomeRes, expenseRes] = await Promise.all([
    supabase
      .from('income_transactions')
      .select('id, payer_name, payer_class, amount, payment_date, period, categories(name, color)')
      .order('payment_date', { ascending: false })
      .limit(limit),
    supabase
      .from('expense_transactions')
      .select('id, transaction_number, purpose, amount, expense_date, categories(name, color)')
      .order('expense_date', { ascending: false })
      .limit(limit),
  ])

  const income = (incomeRes.data ?? []).map((t) => ({
    ...t,
    type: 'income' as const,
    date: t.payment_date,
    label: t.payer_name,
    sublabel: t.payer_class,
  }))

  const expense = (expenseRes.data ?? []).map((t) => ({
    ...t,
    type: 'expense' as const,
    date: t.expense_date,
    label: t.purpose,
    sublabel: t.transaction_number,
  }))

  return [...income, ...expense]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}

export async function getCategories(type?: 'income' | 'expense') {
  const supabase = await createClient()
  let query = supabase.from('categories').select('*').order('name')
  if (type) query = query.eq('type', type)
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}
