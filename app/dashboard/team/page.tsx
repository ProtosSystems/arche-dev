import { Subheading } from '@/components/catalyst/heading'
import { Text } from '@/components/catalyst/text'
import { TeamClient } from '@/components/dashboard/TeamClient'
import { fetchDashboardApi } from '@/lib/dashboard-api'

type TeamResponse = {
  data?: {
    items?: Array<{ id: string; email: string; role: string; status: string }>
  }
}

export default async function TeamPage() {
  const teamRes = await fetchDashboardApi<TeamResponse>('/api/team/members')
  const members = teamRes.ok ? teamRes.data.data?.items || [] : []

  return (
    <div className="space-y-8">
      <section>
        <Subheading level={2}>Team Access</Subheading>
        <Text className="mt-1">Manage members and their access to this workspace.</Text>
      </section>

      <TeamClient initialMembers={members} error={teamRes.ok ? null : teamRes.message} />
    </div>
  )
}
