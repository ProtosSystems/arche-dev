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
