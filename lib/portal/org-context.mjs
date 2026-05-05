export function normalizeOrganizations(details) {
  if (typeof details !== 'object' || details === null) {
    return []
  }

  const organizations = details.organizations ?? details.error?.details?.organizations
  if (!Array.isArray(organizations)) {
    return []
  }

  return organizations.flatMap((item) => {
    if (typeof item !== 'object' || item === null) {
      return []
    }
    const id = item.id
    const name = item.name
    if (typeof id !== 'string' || typeof name !== 'string') {
      return []
    }
    return [{ id, name }]
  })
}

export function resolveOrgContext({ organizations, selectedOrgId, requiresSelection }) {
  const selected = organizations.find((org) => org.id === selectedOrgId) ?? null
  if (selected) {
    return {
      selectedOrgId: selected.id,
      organizations,
      requiresSelection: false,
      shouldPersistCookie: false,
      shouldClearCookie: false,
    }
  }

  if (organizations.length === 1) {
    return {
      selectedOrgId: organizations[0].id,
      organizations,
      requiresSelection: false,
      shouldPersistCookie: true,
      shouldClearCookie: false,
    }
  }

  return {
    selectedOrgId: null,
    organizations,
    requiresSelection: requiresSelection || organizations.length > 1,
    shouldPersistCookie: false,
    shouldClearCookie: Boolean(selectedOrgId),
  }
}
