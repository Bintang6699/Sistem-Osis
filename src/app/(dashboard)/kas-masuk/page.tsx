import type { Metadata } from 'next'
import { getIncomeTransactions } from '@/lib/actions/income.actions'
import { getMembers } from '@/lib/actions/members.actions'
import { getCategories } from '@/lib/actions/dashboard.actions'
import { KasMasukClient } from './KasMasukClient'

export const metadata: Metadata = { title: 'Kas Masuk' }

export default async function KasMasukPage() {
  const [{ data, count }, { data: members }, categories] = await Promise.all([
    getIncomeTransactions({ limit: 50 }),
    getMembers({ limit: 200 }),
    getCategories('income'),
  ])

  return (
    <KasMasukClient
      initialData={data as any}
      totalCount={count}
      members={members}
      categories={categories}
    />
  )
}
