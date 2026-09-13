'use server'

import { createClient } from '@/lib/supabase/server'

export async function getReportTransactions(dateFrom?: string, dateTo?: string) {
  const supabase = await createClient()

  let incomeQuery = supabase
    .from('income_transactions')
    .select('id, payer_name, payer_class, amount, payment_date, period, payment_method, categories(name)')
    .order('payment_date', { ascending: true })

  if (dateFrom) incomeQuery = incomeQuery.gte('payment_date', dateFrom)
  if (dateTo) incomeQuery = incomeQuery.lte('payment_date', dateTo)

  let expenseQuery = supabase
    .from('expense_transactions')
    .select('id, transaction_number, purpose, amount, expense_date, paid_by, categories(name)')
    .order('expense_date', { ascending: true })

  if (dateFrom) expenseQuery = expenseQuery.gte('expense_date', dateFrom)
  if (dateTo) expenseQuery = expenseQuery.lte('expense_date', dateTo)

  const [incomeRes, expenseRes] = await Promise.all([incomeQuery, expenseQuery])

  const income = (incomeRes.data ?? []).map((t) => ({
    id: t.id,
    type: 'income' as const,
    date: t.payment_date,
    label: t.payer_name,
    sublabel: t.payer_class,
    amount: t.amount,
    category: (t.categories as any)?.name ?? 'Tanpa Kategori',
    method: t.payment_method,
    period: t.period
  }))

  const expense = (expenseRes.data ?? []).map((t) => ({
    id: t.id,
    type: 'expense' as const,
    date: t.expense_date,
    label: t.purpose,
    sublabel: t.transaction_number,
    amount: t.amount,
    category: (t.categories as any)?.name ?? 'Tanpa Kategori',
    paidBy: t.paid_by
  }))

  const allTransactions = [...income, ...expense].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const totalIncome = income.reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = expense.reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpense

  return {
    transactions: allTransactions,
    summary: {
      totalIncome,
      totalExpense,
      balance,
      incomeCount: income.length,
      expenseCount: expense.length
    }
  }
}
