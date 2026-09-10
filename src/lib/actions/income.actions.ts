'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getIncomeTransactions(params?: {
  search?: string
  dateFrom?: string
  dateTo?: string
  class?: string
  period?: string
  limit?: number
  page?: number
}) {
  const supabase = await createClient()
  const page = params?.page ?? 1
  const limit = params?.limit ?? 20
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('income_transactions')
    .select(`
      *,
      members(id, name, class),
      profiles!income_transactions_recorded_by_fkey(id, name),
      categories(id, name, color)
    `, { count: 'exact' })
    .order('payment_date', { ascending: false })
    .range(from, to)

  if (params?.search) {
    query = query.or(`payer_name.ilike.%${params.search}%,description.ilike.%${params.search}%`)
  }
  if (params?.dateFrom) {
    query = query.gte('payment_date', params.dateFrom)
  }
  if (params?.dateTo) {
    query = query.lte('payment_date', params.dateTo)
  }
  if (params?.class) {
    query = query.eq('payer_class', params.class)
  }
  if (params?.period) {
    query = query.ilike('period', `%${params.period}%`)
  }

  const { data, error, count } = await query

  if (error) throw new Error(error.message)
  return { data: data ?? [], count: count ?? 0 }
}

export async function createIncomeTransaction(formData: {
  member_id?: string
  payer_name: string
  payer_class: string
  amount: number
  payment_date: string
  period: string
  payment_method: string
  description?: string
  status?: string
  category_id?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('income_transactions').insert({
    ...formData,
    recorded_by: user?.id,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/kas-masuk')
  revalidatePath('/dashboard')
  revalidatePath('/transaksi')
  return { success: true }
}

export async function updateIncomeTransaction(id: string, formData: {
  payer_name?: string
  payer_class?: string
  amount?: number
  payment_date?: string
  period?: string
  payment_method?: string
  description?: string
  status?: string
}) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('income_transactions')
    .update({ ...formData, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/kas-masuk')
  revalidatePath('/dashboard')
  revalidatePath('/transaksi')
  return { success: true }
}

export async function deleteIncomeTransaction(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('income_transactions')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/kas-masuk')
  revalidatePath('/dashboard')
  revalidatePath('/transaksi')
  return { success: true }
}

// Get income summary stats
export async function getIncomeStats(dateFrom?: string, dateTo?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('income_transactions')
    .select('amount, payment_date, period')

  if (dateFrom) query = query.gte('payment_date', dateFrom)
  if (dateTo) query = query.lte('payment_date', dateTo)

  const { data, error } = await query
  if (error) throw new Error(error.message)

  const total = data?.reduce((sum, t) => sum + t.amount, 0) ?? 0
  return { total, count: data?.length ?? 0, transactions: data ?? [] }
}
