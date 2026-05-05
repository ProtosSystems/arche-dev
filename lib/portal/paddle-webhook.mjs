export function collectPaddleHeaders(headersLike) {
  const headers = new Headers()
  let hasSignature = false

  new Headers(headersLike).forEach((value, key) => {
    const normalized = key.toLowerCase()
    if (normalized === 'content-type') {
      headers.set(key, value)
      return
    }
    if (normalized.startsWith('paddle-')) {
      headers.set(key, value)
    }
    if (normalized === 'paddle-signature') {
      hasSignature = true
    }
  })

  return hasSignature ? headers : null
}
