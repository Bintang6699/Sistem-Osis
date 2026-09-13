'use server'

import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { format } from 'date-fns'

export async function getExpenseTransactions(params?: {
  search?: string
  dateFrom?: string
  dateTo?: string
  category?: string
  limit?: number
  page?: number
}) {
  const supabase = await createClient()
  const page = params?.page ?? 1
  const limit = params?.limit ?? 20
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('expense_transactions')
    .select(`
      *,
      categories(id, name, color),
      expense_items(*)
    `, { count: 'exact' })
    .order('expense_date', { ascending: false })
    .range(from, to)

  if (params?.search) {
    query = query.or(`transaction_number.ilike.%${params.search}%,purpose.ilike.%${params.search}%,paid_by.ilike.%${params.search}%`)
  }
  if (params?.dateFrom) {
    query = query.gte('expense_date', params.dateFrom)
  }
  if (params?.dateTo) {
    query = query.lte('expense_date', params.dateTo)
  }
  if (params?.category) {
    query = query.eq('category_id', params.category)
  }

  const { data, error, count } = await query
  if (error) throw new Error(error.message)
  return { data: data ?? [], count: count ?? 0 }
}

export async function getExpenseTransactionById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('expense_transactions')
    .select(`
      *,
      categories(id, name, color),
      expense_items(*)
    `)
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

// Generate next transaction number
async function generateTxNumber(supabase: Awaited<ReturnType<typeof createClient>>): Promise<string> {
  const today = format(new Date(), 'yyyyMMdd')
  const prefix = `TRX-${today}-`

  const { data } = await supabase
    .from('expense_transactions')
    .select('transaction_number')
    .ilike('transaction_number', `${prefix}%`)
    .order('transaction_number', { ascending: false })
    .limit(1)

  const lastNumber = data?.[0]?.transaction_number
  const lastSeq = lastNumber ? parseInt(lastNumber.split('-')[2]) : 0
  const nextSeq = String(lastSeq + 1).padStart(3, '0')
  return `${prefix}${nextSeq}`
}

export async function createExpenseTransaction(formData: {
  expense_date: string
  category_id?: string
  purpose: string
  paid_by: string
  description?: string
  items: Array<{
    item_name: string
    quantity: number
    unit_price: number
  }>
}) {
  const supabase = await createClient()
  const session = await getSession()

  const transaction_number = await generateTxNumber(supabase)

  const totalAmount = formData.items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  )

  const { data: expense, error: expenseError } = await supabase
    .from('expense_transactions')
    .insert({
      transaction_number,
      expense_date: formData.expense_date,
      category_id: formData.category_id,
      purpose: formData.purpose,
      amount: totalAmount,
      paid_by: formData.paid_by,
      description: formData.description,
      recorded_by: session?.id ?? null,
    })
    .select('id')
    .single()

  if (expenseError) throw new Error(expenseError.message)

  // Insert expense items
  if (formData.items.length > 0) {
    const { error: itemsError } = await supabase.from('expense_items').insert(
      formData.items.map((item) => ({
        expense_transaction_id: expense.id,
        item_name: item.item_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }))
    )
    if (itemsError) throw new Error(itemsError.message)
  }

  revalidatePath('/kas-keluar')
  revalidatePath('/dashboard')
  revalidatePath('/transaksi')
  return { success: true, transaction_number }
}

export async function updateExpenseTransaction(
  id: string,
  formData: {
    expense_date?: string
    category_id?: string
    purpose?: string
    paid_by?: string
    description?: string
    items?: Array<{
      item_name: string
      quantity: number
      unit_price: number
    }>
  }
) {
  const supabase = await createClient()

  const totalAmount = formData.items
    ? formData.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
    : undefined

  const { error } = await supabase
    .from('expense_transactions')
    .update({
      expense_date: formData.expense_date,
      category_id: formData.category_id,
      purpose: formData.purpose,
      paid_by: formData.paid_by,
      description: formData.description,
      amount: totalAmount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw new Error(error.message)

  // Re-sync items if provided
  if (formData.items) {
    await supabase.from('expense_items').delete().eq('expense_transaction_id', id)
    if (formData.items.length > 0) {
      const { error: itemsError } = await supabase.from('expense_items').insert(
        formData.items.map((item) => ({
          expense_transaction_id: id,
          item_name: item.item_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
        }))
      )
      if (itemsError) throw new Error(itemsError.message)
    }
  }

  revalidatePath('/kas-keluar')
  revalidatePath('/dashboard')
  revalidatePath('/transaksi')
  return { success: true }
}

export async function deleteExpenseTransaction(id: string) {
  const supabase = await createClient()

  await supabase.from('expense_items').delete().eq('expense_transaction_id', id)

  const { error } = await supabase
    .from('expense_transactions')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/kas-keluar')
  revalidatePath('/dashboard')
  revalidatePath('/transaksi')
  return { success: true }
}

// Get expense summary stats
export async function getExpenseStats(dateFrom?: string, dateTo?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('expense_transactions')
    .select('amount, expense_date, category_id, categories(name, color)')

  if (dateFrom) query = query.gte('expense_date', dateFrom)
  if (dateTo) query = query.lte('expense_date', dateTo)

  const { data, error } = await query
  if (error) throw new Error(error.message)

  const total = data?.reduce((sum, t) => sum + t.amount, 0) ?? 0
  return { total, count: data?.length ?? 0, transactions: data ?? [] }
}
