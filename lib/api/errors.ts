export type NormalizedApiError = {
  status: number
  code: string
  userMessage: string
  debugMessage?: string
  requestId?: string
  troubleshootingUrl: string
}

const USER_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: 'You are not authorized. Please sign in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'Requested resource was not found.',
  RATE_LIMITED: 'Too many requests. Please retry shortly.',
  NETWORK: 'Network error. Check your connection and retry.',
  TIMEOUT: 'Request timed out. Please retry.',
  UNKNOWN: 'Something went wrong. Please retry.',
}

export class ApiError extends Error {
  status: number
  code: string
  requestId?: string

  constructor(status: number, code: string, message: string, requestId?: string) {
    super(message)
    this.status = status
    this.code = code
    this.requestId = requestId
  }
}

const TROUBLESHOOTING_URL = 'https://docs.arche.fi/troubleshooting/request-ids'

export function normalizeApiError(err: unknown): NormalizedApiError {
  if (err instanceof ApiError) {
    const fallbackMessage = USER_MESSAGES[err.code] ?? USER_MESSAGES.UNKNOWN
    const unknownWithMessage = err.code === 'UNKNOWN' && typeof err.message === 'string' && err.message.trim().length > 0
    const userMessage = unknownWithMessage ? err.message.trim().slice(0, 220) : fallbackMessage
    return {
      status: err.status,
      code: err.code,
      userMessage,
      debugMessage: err.message,
      requestId: err.requestId,
      troubleshootingUrl: TROUBLESHOOTING_URL,
    }
  }

  if (err instanceof Error && err.name === 'AbortError') {
    return {
      status: 408,
      code: 'TIMEOUT',
      userMessage: USER_MESSAGES.TIMEOUT,
      debugMessage: err.message,
      troubleshootingUrl: TROUBLESHOOTING_URL,
    }
  }

  if (err instanceof TypeError) {
    return {
      status: 0,
      code: 'NETWORK',
      userMessage: USER_MESSAGES.NETWORK,
      debugMessage: err.message,
      troubleshootingUrl: TROUBLESHOOTING_URL,
    }
  }

  if (err instanceof Error) {
    const message = err.message?.trim()
    return {
      status: 500,
      code: 'UNKNOWN',
      userMessage: message ? message.slice(0, 220) : USER_MESSAGES.UNKNOWN,
      debugMessage: err.message,
      troubleshootingUrl: TROUBLESHOOTING_URL,
    }
  }

  return { status: 500, code: 'UNKNOWN', userMessage: USER_MESSAGES.UNKNOWN, troubleshootingUrl: TROUBLESHOOTING_URL }
}
