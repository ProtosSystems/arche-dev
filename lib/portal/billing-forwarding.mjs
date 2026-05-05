export function readEnvironmentId(value) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null
}

export function buildCheckoutPayload(body) {
  if (typeof body !== 'object' || body === null) {
    return {}
  }
  const priceId = body.price_id
  return typeof priceId === 'string' && priceId.trim().length > 0 ? { price_id: priceId.trim() } : {}
}
