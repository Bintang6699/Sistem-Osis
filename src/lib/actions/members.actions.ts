'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getMembers(params?: {
  search?: string
  class?: string
  status?: string
  limit?: number
  page?: number
}) {
  const supabase = await createClient()
  const page = params?.page ?? 1
  const limit = params?.limit ?? 50
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('members')
    .select('*', { count: 'exact' })
    .order('class', { ascending: true })
    .order('name', { ascending: true })
    .range(from, to)

  if (params?.search) {
    query = query.or(`name.ilike.%${params.search}%,nis.ilike.%${params.search}%`)
  }
  if (params?.class) {
    query = query.eq('class', params.class)
  }
  if (params?.status) {
    query = query.eq('status', params.status)
  }

  const { data, error, count } = await query
  if (error) throw new Error(error.message)
  return { data: data ?? [], count: count ?? 0 }
}

export async function createMember(formData: {
  name: string
  nis?: string
  class: string
  status?: string
  phone?: string
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('members').insert(formData)
  if (error) throw new Error(error.message)

  revalidatePath('/anggota')
  return { success: true }
}

export async function updateMember(id: string, formData: {
  name?: string
  nis?: string
  class?: string
  status?: string
  phone?: string
}) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('members')
    .update({ ...formData, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/anggota')
  return { success: true }
}

export async function deleteMember(id: string) {
  const supabase = await createClient()
  
  // Clear references first to prevent foreign key errors
  await supabase.from('income_transactions').update({ member_id: null }).eq('member_id', id)
  
  const { error } = await supabase.from('members').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/anggota')
  return { success: true }
}

// Get payment status by class and period
export async function getMemberPaymentStatus(classFilter: string, period: string) {
  const supabase = await createClient()

  const { data: members, error: membersError } = await supabase
    .from('members')
    .select('*')
    .eq('class', classFilter)
    .eq('status', 'Aktif')
    .order('name')

  if (membersError) throw new Error(membersError.message)

  const { data: paid, error: paidError } = await supabase
    .from('income_transactions')
    .select('member_id, payer_name')
    .eq('payer_class', classFilter)
    .ilike('period', `%${period}%`)

  if (paidError) throw new Error(paidError.message)

  const paidMemberIds = new Set(paid?.map((p) => p.member_id).filter(Boolean))

  const statusList = members?.map((member) => ({
    ...member,
    hasPaid: paidMemberIds.has(member.id),
  }))

  return {
    members: statusList ?? [],
    paidCount: statusList?.filter((m) => m.hasPaid).length ?? 0,
    unpaidCount: statusList?.filter((m) => !m.hasPaid).length ?? 0,
  }
}

export async function deleteAllMembers() {
  const supabase = await createClient()

  // Clear member_id FK references first
  await supabase.from('income_transactions').update({ member_id: null }).neq('id', '00000000-0000-0000-0000-000000000000')

  const { error } = await supabase.from('members').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (error) throw new Error(error.message)

  revalidatePath('/anggota')
  revalidatePath('/dashboard')
  return { success: true }
}
