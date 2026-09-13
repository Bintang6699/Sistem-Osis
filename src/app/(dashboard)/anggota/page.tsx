import type { Metadata } from 'next'
import { getMembers } from '@/lib/actions/members.actions'
import { AnggotaClient } from './AnggotaClient'

export const metadata: Metadata = {
  title: 'Anggota OSIS',
}

export default async function AnggotaPage() {
  const { data, count } = await getMembers({ limit: 500 })

  return (
    <div className="animate-fade-in">
      <AnggotaClient initialData={data} totalCount={count} />
    </div>
  )
}
