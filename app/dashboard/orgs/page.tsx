import { Subheading } from '@/components/catalyst/heading'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/catalyst/table'
import { Text } from '@/components/catalyst/text'
import { fetchDashboardApi } from '@/lib/dashboard-api'

type OrgsResponse = { data?: { items?: Array<{ id: string; name: string }> } }
type ProjectsResponse = { data?: { items?: Array<{ id: string; name: string }> } }
type EnvsResponse = { data?: { items?: Array<{ id: string; name: string; is_production?: boolean }> } }

export default async function OrgsPage() {
  const orgsRes = await fetchDashboardApi<OrgsResponse>('/api/orgs')
  const projectsRes = await fetchDashboardApi<ProjectsResponse>('/api/orgs/projects')

  const orgs = orgsRes.ok ? orgsRes.data.data?.items || [] : []
  const projects = projectsRes.ok ? projectsRes.data.data?.items || [] : []

  const firstProjectId = projects[0]?.id
  const envsRes = firstProjectId
    ? await fetchDashboardApi<EnvsResponse>(`/api/projects/${firstProjectId}/environments`)
    : ({ ok: false, message: 'No project selected' } as const)

  const envs = envsRes.ok ? envsRes.data.data?.items || [] : []

  return (
    <div className="space-y-10">
      <section>
        <Subheading level={2}>Organization Context</Subheading>
        <Text className="mt-1">Organizations visible to the current Clerk user.</Text>
      </section>

      <section className="rounded-xl border border-zinc-950/10 bg-white p-6 shadow-xs dark:border-white/10 dark:bg-slate-900">
        <div className="text-sm font-semibold">Organizations</div>
        <Table className="mt-4">
          <TableHead>
            <TableRow>
              <TableHeader>Name</TableHeader>
              <TableHeader>ID</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {orgs.map((org) => (
              <TableRow key={org.id}>
                <TableCell>{org.name}</TableCell>
                <TableCell>{org.id}</TableCell>
              </TableRow>
            ))}
            {orgs.length === 0 && (
              <TableRow>
                <TableCell colSpan={2}>{orgsRes.ok ? 'No organizations found.' : orgsRes.message}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>

      <section className="rounded-xl border border-zinc-950/10 bg-white p-6 shadow-xs dark:border-white/10 dark:bg-slate-900">
        <div className="text-sm font-semibold">Projects</div>
        <Table className="mt-4">
          <TableHead>
            <TableRow>
              <TableHeader>Name</TableHeader>
              <TableHeader>ID</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>{project.name}</TableCell>
                <TableCell>{project.id}</TableCell>
              </TableRow>
            ))}
            {projects.length === 0 && (
              <TableRow>
                <TableCell colSpan={2}>{projectsRes.ok ? 'No projects found.' : projectsRes.message}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>

      <section className="rounded-xl border border-zinc-950/10 bg-white p-6 shadow-xs dark:border-white/10 dark:bg-slate-900">
        <div className="text-sm font-semibold">Environments (first project)</div>
        <Table className="mt-4">
          <TableHead>
            <TableRow>
              <TableHeader>Name</TableHeader>
              <TableHeader>ID</TableHeader>
              <TableHeader>Mode</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {envs.map((env) => (
              <TableRow key={env.id}>
                <TableCell>{env.name}</TableCell>
                <TableCell>{env.id}</TableCell>
                <TableCell>{env.is_production ? 'Production' : 'Sandbox'}</TableCell>
              </TableRow>
            ))}
            {envs.length === 0 && (
              <TableRow>
                <TableCell colSpan={3}>{envsRes.ok ? 'No environments found.' : envsRes.message}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>
    </div>
  )
}
