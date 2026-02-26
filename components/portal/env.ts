import type { Environment } from '@/lib/api/types'

export function getEnvBaseUrl(environment: Environment): string {
  return environment === 'production' ? 'https://api.arche.fi' : 'https://sandbox.api.arche.fi'
}
