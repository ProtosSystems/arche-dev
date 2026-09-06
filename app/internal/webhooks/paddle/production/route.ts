import { relayPaddleWebhook } from '@/lib/portal/paddle-ingress'

export async function POST(request: Request) {
  return relayPaddleWebhook(request, 'production')
}
