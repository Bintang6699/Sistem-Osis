import type { Metadata } from 'next'
import { getExpenseTransactions } from '@/lib/actions/expense.actions'
import { getCategories } from '@/lib/actions/dashboard.actions'
import { KasKeluarClient } from './KasKeluarClient'

export const metadata: Metadata = { title: 'Kas Keluar' }

export default async function KasKeluarPage() {
  const [{ data, count }, categories] = await Promise.all([
    getExpenseTransactions({ limit: 50 }),
    getCategories('expense'),
  ])

  return (
    <KasKeluarClient
      initialData={data as any}
      totalCount={count}
      categories={categories}
    />
  )
}
