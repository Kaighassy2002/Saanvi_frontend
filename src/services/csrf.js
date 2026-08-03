import { API_BASE } from './config'

const CSRF_STORAGE_KEY = 'jewellery_csrf_token'

let memoryToken = ''

export function getStoredCsrfToken() {
  if (memoryToken) return memoryToken
  try {
    memoryToken = sessionStorage.getItem(CSRF_STORAGE_KEY) || ''
  } catch {
    memoryToken = ''
  }
  return memoryToken
}

export function setStoredCsrfToken(token) {
  memoryToken = String(token || '')
  try {
    if (memoryToken) sessionStorage.setItem(CSRF_STORAGE_KEY, memoryToken)
    else sessionStorage.removeItem(CSRF_STORAGE_KEY)
  } catch {
    /* private mode */
  }
}

export function clearStoredCsrfToken() {
  setStoredCsrfToken('')
}

/** Fetch a CSRF token from the API (sets httpOnly cookie + returns body token). */
export async function ensureCsrfToken() {
  const existing = getStoredCsrfToken()
  if (existing) return existing
  const res = await fetch(`${API_BASE}/api/auth/csrf`, {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) return ''
  const data = await res.json().catch(() => ({}))
  const token = String(data?.csrfToken || '')
  if (token) setStoredCsrfToken(token)
  return token
}

export function csrfHeaders() {
  const token = getStoredCsrfToken()
  return token ? { 'X-CSRF-Token': token } : {}
}
