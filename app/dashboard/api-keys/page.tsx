import { Subheading } from '@/components/catalyst/heading'
import { Text } from '@/components/catalyst/text'
import { ApiKeysClient } from '@/components/dashboard/ApiKeysClient'
import { fetchDashboardApi } from '@/lib/dashboard-api'

type ProjectsResponse = {
  data: { items: Array<{ id: string; name: string }> }
}

type EnvironmentsResponse = {
  data: { items: Array<{ id: string; name: string }> }
}

type ApiKeysResponse = {
  data: {
    items: Array<{
      id: string
      env_id: string
      key_prefix: string
      status: string
      scopes: string[]
      name: string | null
      created_at: string
      revoked_at: string | null
      last_used_at: string | null
    }>
  }
}

async function resolveEnvOptions() {
  const projects = await fetchDashboardApi<ProjectsResponse>('/api/orgs/projects')
  if (!projects.ok) return { error: projects.message, envs: [] as Array<{ id: string; name: string }>, envId: null }
  const projectId = projects.data.data.items[0]?.id
  if (!projectId) return { error: 'No projects available.', envs: [], envId: null }

  const envs = await fetchDashboardApi<EnvironmentsResponse>(`/api/projects/${projectId}/environments`)
  if (!envs.ok) return { error: envs.message, envs: [], envId: null }
  const envItems = envs.data.data.items
  return { envs: envItems, envId: envItems[0]?.id || null, error: null }
}

export default async function ApiKeysPage() {
  const { envs, envId, error } = await resolveEnvOptions()

  let keys: ApiKeysResponse['data']['items'] = []
  let keyError = error
  if (envId) {
    const res = await fetchDashboardApi<ApiKeysResponse>(`/api/keys?env_id=${envId}`)
    if (res.ok) {
      keys = res.data.data.items
    } else {
      keyError = res.message
    }
  }

  return (
    <div className="space-y-10">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Subheading level={2}>Key Inventory</Subheading>
          <Text className="mt-1">Rotate keys regularly and scope to the minimum required access.</Text>
        </div>
      </section>

      <ApiKeysClient envs={envs} initialEnvId={envId} initialKeys={keys} error={keyError} />
    </div>
  )
}
