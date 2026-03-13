export function formatDateTime(iso: string | null): string {
  if (!iso) {
    return 'Never'
  }

  const value = new Date(iso)
  if (Number.isNaN(value.getTime())) {
    return iso
  }

  return value.toLocaleString()
}

export function formatShortDate(iso: string): string {
  const value = new Date(iso)
  if (Number.isNaN(value.getTime())) {
    return iso
  }

  return value.toLocaleDateString()
}

export function formatBillingStatusLabel(status: string | null | undefined): string {
  const normalized = (status ?? 'unknown').trim().toLowerCase()
  if (normalized === 'not_purchased') {
    return 'Not purchased'
  }
  if (normalized === 'not_configured') {
    return 'Not purchased'
  }
  if (normalized.length === 0) {
    return 'Unknown'
  }
  return normalized
    .split('_')
    .map((part) => (part ? `${part[0].toUpperCase()}${part.slice(1)}` : part))
    .join(' ')
}

export function formatPlanNameLabel(planName: string | null | undefined): string {
  const normalized = (planName ?? '').trim().toLowerCase()
  if (normalized.length === 0 || normalized === 'unknown' || normalized === 'plan') {
    return 'Not purchased'
  }
  return planName!.trim()
}
