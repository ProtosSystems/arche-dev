import { archeApiRequest, jsonError } from '@/lib/arche-api.server'
import type { AccountEntitlements, ControlPlaneApiKeyList, SelfServeAccessState, SuccessEnvelope } from '@/lib/api/types'
import { recordActivationEvent } from '@/lib/dev-metrics/store'
import { requireCurrentUserId } from '@/lib/dev-metrics/user'
import { NextResponse } from 'next/server'

type BillingSubscription = {
  status: string
  plan_id: string | null
  current_period_end: string | null
  updated_at: string | null
}

function mapStatus(status: string | null | undefined): AccountEntitlements['status'] {
  const normalized = (status ?? '').trim().toLowerCase()
  if (normalized === 'trialing' || normalized === 'trial') return 'trial'
  if (normalized === 'active') return 'active'
  if (normalized === 'past_due') return 'past_due'
  if (normalized === 'canceled' || normalized === 'cancelled') return 'cancelled'
  return 'inactive'
}

export async function GET(request: Request) {
  const userId = await requireCurrentUserId().catch(() => null)
  const headers = { 'X-Environment': 'sandbox' }

  try {
    const [billingRes, keysRes] = await Promise.all([
      archeApiRequest<SuccessEnvelope<BillingSubscription>>(request, '/v1/protected/billing/subscription'),
      archeApiRequest<SuccessEnvelope<ControlPlaneApiKeyList>>(request, '/v1/api-keys', { headers }),
    ])

    if (!billingRes.ok) {
      console.error('self-serve/access billing upstream error', {
        status: billingRes.status,
        message: billingRes.message,
        requestId: billingRes.requestId,
      })
      return jsonError(billingRes)
    }
    if (!keysRes.ok) {
      console.error('self-serve/access keys upstream error', {
        status: keysRes.status,
        message: keysRes.message,
        requestId: keysRes.requestId,
      })
      return jsonError(keysRes)
    }

    const billing = billingRes.data.data
    const apiKeys = keysRes.data.data.items
    const activeApiKeyCount = apiKeys.filter((key) => key.revoked_at === null).length
    const normalizedStatus = mapStatus(billing.status)
    const apiKeyLimit = null
    const canCreate =
      (normalizedStatus === 'active' || normalizedStatus === 'trial') &&
      (apiKeyLimit === null || activeApiKeyCount < apiKeyLimit)

    const state: SelfServeAccessState = {
      entitlement: {
        plan: billing.plan_id ?? (normalizedStatus === 'active' || normalizedStatus === 'trial' ? 'Active plan' : null),
        status: normalizedStatus,
        api_key_limit: apiKeyLimit,
        usage_limits: {},
        active_api_key_count: activeApiKeyCount,
        updated_at: billing.updated_at,
        source_of_truth: 'arche_api',
        subscription_status: billing.status,
      },
      can_create_api_keys: canCreate,
      purchase_required: !(normalizedStatus === 'active' || normalizedStatus === 'trial'),
      reason:
        normalizedStatus === 'active' || normalizedStatus === 'trial'
          ? null
          : 'Purchase or reactivation is required before API key creation.',
    }

    if (userId) {
      queueMicrotask(() => {
        recordActivationEvent({ userId, type: 'developer_signed_up' })
      })
    }

    return NextResponse.json({ data: state }, { status: 200 })
  } catch (error) {
    console.error('self-serve/access composition error', {
      error,
      name: error instanceof Error ? error.name : null,
      message: error instanceof Error ? error.message : String(error),
    })
    throw error
  }
}
