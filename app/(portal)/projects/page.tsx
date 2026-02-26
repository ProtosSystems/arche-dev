'use client'

import { Button } from '@/components/catalyst/button'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/catalyst/dialog'
import { Input } from '@/components/catalyst/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/catalyst/table'
import { Text } from '@/components/catalyst/text'
import { PageShell } from '@/components/portal/PageShell'
import { usePortal } from '@/components/portal/PortalProvider'
import { formatDateTime } from '@/components/portal/utils'
import { normalizeApiError } from '@/lib/api/errors'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ProjectsPage() {
  const router = useRouter()
  const { projects, createProject, loadingProjects, projectError } = usePortal()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [openCreate, setOpenCreate] = useState(false)

  const onCreate = async () => {
    if (!name.trim()) {
      setError('Project name is required.')
      return
    }

    setBusy(true)
    setError(null)
    try {
      const created = await createProject(name.trim())
      setName('')
      setOpenCreate(false)
      router.push(`/projects/${created.id}`)
    } catch (err) {
      setError(normalizeApiError(err).userMessage)
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageShell title="Projects" description="Create and manage your API projects.">
      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <Button color="dark/zinc" onClick={() => setOpenCreate(true)} disabled={loadingProjects}>
          Create project
        </Button>
        {projectError ? <Text className="mt-2 text-sm text-amber-700">{projectError}</Text> : null}
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Name</TableHeader>
              <TableHeader>Created</TableHeader>
              <TableHeader></TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>{project.name}</TableCell>
                <TableCell>{formatDateTime(project.created_at)}</TableCell>
                <TableCell>
                  <Button plain href={`/projects/${project.id}`}>
                    Open
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!loadingProjects && projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3}>No projects yet. Create one to get started.</TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </section>

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} size="lg">
        <DialogTitle>Create Project</DialogTitle>
        <DialogDescription>Projects are top-level containers for keys, usage, and webhooks.</DialogDescription>
        <DialogBody>
          <label className="text-xs uppercase tracking-wide text-zinc-500">Project name</label>
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Acme backend" />
          {error ? <Text className="mt-2 text-sm text-rose-700">{error}</Text> : null}
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setOpenCreate(false)}>
            Cancel
          </Button>
          <Button color="dark/zinc" onClick={onCreate} disabled={busy}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  )
}
