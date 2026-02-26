export const overviewStats = [
  { label: 'Requests (30d)', value: '2.4M', change: '+12%' },
  { label: 'Active API Keys', value: '18', change: '+3' },
  { label: 'Datasets Enabled', value: '7', change: '+1' },
  { label: 'Team Members', value: '12', change: '+2' },
]

export const gettingStartedSteps = [
  {
    title: 'Create your first API key',
    description: 'Generate a scoped key for your service and store it in a secret manager.',
  },
  {
    title: 'Validate endpoints in Sandbox',
    description: 'Run a few dry runs against the Sandbox environment before going live.',
  },
  {
    title: 'Configure usage alerts',
    description: 'Set thresholds so the team is notified when usage spikes.',
  },
]

export const apiKeys = [
  {
    id: 'key_live_48d91',
    name: 'Production Ingest',
    created: 'Jan 12, 2026',
    lastUsed: '2 hours ago',
    status: 'Active',
    scope: 'Ingest + Search',
  },
  {
    id: 'key_sbx_2cc14',
    name: 'Sandbox Batch',
    created: 'Jan 29, 2026',
    lastUsed: 'Yesterday',
    status: 'Active',
    scope: 'Batch + Files',
  },
  {
    id: 'key_live_92b77',
    name: 'Partner Sync',
    created: 'Dec 18, 2025',
    lastUsed: '5 days ago',
    status: 'Rotation Due',
    scope: 'Sync + Events',
  },
]

export const usageRows = [
  { endpoint: 'POST /v1/ingest', requests: '1.8M', p50: '210ms', p95: '540ms' },
  { endpoint: 'POST /v1/search', requests: '420k', p50: '180ms', p95: '410ms' },
  { endpoint: 'GET /v1/datasets', requests: '96k', p50: '120ms', p95: '260ms' },
  { endpoint: 'POST /v1/agents/run', requests: '62k', p50: '350ms', p95: '780ms' },
]

export const endpointUsage = [
  { name: 'Ingest', percent: 58 },
  { name: 'Search', percent: 24 },
  { name: 'Agents', percent: 10 },
  { name: 'Datasets', percent: 8 },
]

export const entitlements = {
  features: [
    { name: 'Realtime Ingest', status: 'Enabled', detail: '10k events/min' },
    { name: 'Semantic Search', status: 'Enabled', detail: 'Hybrid vector + keyword' },
    { name: 'Agents', status: 'Beta', detail: 'Limited to 5 concurrent runs' },
  ],
  datasets: [
    { name: 'Signals Core', status: 'Active', detail: 'Updated hourly' },
    { name: 'Market Intel', status: 'Active', detail: 'Updated daily' },
    { name: 'Private Corpus', status: 'Pending', detail: 'Provisioning access' },
  ],
}

export const teamMembers = [
  { name: 'Erica L.', email: 'erica@protos.ai', role: 'Admin', status: 'Active' },
  { name: 'Miles N.', email: 'miles@protos.ai', role: 'Engineer', status: 'Active' },
  { name: 'Simone K.', email: 'simone@protos.ai', role: 'Analyst', status: 'Pending' },
  { name: 'Jordan P.', email: 'jordan@protos.ai', role: 'Viewer', status: 'Active' },
]
