import { API_BASE } from './config'
import { reportApiError } from '../monitoring/sentry'
import {
  csrfHeaders,
  ensureCsrfToken,
  setStoredCsrfToken,
  clearStoredCsrfToken,
  getStoredCsrfToken,
} from './csrf'

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    /** @deprecated use status */
    this.statusCode = status
    this.data = data
    this.errors = data?.errors
  }
}

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

let customerRefreshPromise = null
let adminRefreshPromise = null

async function refreshCustomerSession() {
  if (!customerRefreshPromise) {
    customerRefreshPromise = fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json', ...csrfHeaders() },
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new ApiError(data?.message || 'Session expired', res.status, data)
        if (data?.csrfToken) setStoredCsrfToken(data.csrfToken)
        return data
      })
      .finally(() => {
        customerRefreshPromise = null
      })
  }
  return customerRefreshPromise
}

async function refreshAdminSession() {
  if (!adminRefreshPromise) {
    adminRefreshPromise = fetch(`${API_BASE}/api/admin/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json', ...csrfHeaders() },
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new ApiError(data?.message || 'Session expired', res.status, data)
        if (data?.csrfToken) setStoredCsrfToken(data.csrfToken)
        return data
      })
      .finally(() => {
        adminRefreshPromise = null
      })
  }
  return adminRefreshPromise
}

/**
 * @param {string} path - e.g. /api/products
 * @param {{ method?: string, body?: object, auth?: 'customer' | 'admin' | false, silentAuth?: boolean, _retried?: boolean }} options
 */
export async function jewelleryFetch(path, options = {}) {
  const { method = 'GET', body, silentAuth = false, auth = false, _retried = false } = options
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  if (MUTATING.has(method.toUpperCase()) && path !== '/api/auth/csrf') {
    if (!getStoredCsrfToken()) {
      await ensureCsrfToken().catch(() => '')
    }
    Object.assign(headers, csrfHeaders())
  }

  let res
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      credentials: 'include',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (error) {
    reportApiError(error, { path, method })
    throw error
  }

  // Access token expired — rotate refresh once, then retry.
  if (res.status === 401 && !_retried && !path.includes('/auth/refresh') && !path.includes('/auth/login')) {
    try {
      if (auth === 'admin' || path.startsWith('/api/admin/')) {
        await refreshAdminSession()
      } else if (auth === 'customer' || path.startsWith('/api/auth/') || path.startsWith('/api/orders')) {
        await refreshCustomerSession()
      } else {
        throw new Error('no-refresh')
      }
      return jewelleryFetch(path, { ...options, _retried: true })
    } catch {
      /* fall through to normal 401 handling */
    }
  }

  // CSRF token stale — refresh token and retry once.
  if (res.status === 403 && !_retried && MUTATING.has(method.toUpperCase())) {
    const textPeek = await res.clone().text()
    if (/csrf/i.test(textPeek)) {
      clearStoredCsrfToken()
      await ensureCsrfToken().catch(() => '')
      return jewelleryFetch(path, { ...options, _retried: true })
    }
  }

  const text = await res.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (typeof data === 'object' && data?.csrfToken) {
    setStoredCsrfToken(data.csrfToken)
  }

  if (!res.ok) {
    const msg =
      typeof data === 'object' && data?.message ? data.message : text || res.statusText
    const apiError = new ApiError(String(msg), res.status, typeof data === 'object' ? data : null)
    const isExpectedAuthProbe = silentAuth && res.status === 401
    if (!isExpectedAuthProbe) {
      reportApiError(apiError, { path, method, status: res.status })
    }
    throw apiError
  }

  if (res.status === 204) return null
  return data
}

// --- Public catalog ---

export async function fetchStoreSettings() {
  return jewelleryFetch('/api/store-settings')
}

// --- Public curated collections ---

export async function fetchPublicCollections(params = {}) {
  const q = new URLSearchParams()
  if (params.q) q.set('q', params.q)
  const suffix = q.toString() ? `?${q}` : ''
  const data = await jewelleryFetch(`/api/collections${suffix}`)
  return Array.isArray(data?.collections) ? data.collections : []
}

export async function fetchFeaturedCollections() {
  const data = await jewelleryFetch('/api/collections/featured')
  const rows = Array.isArray(data?.collections) ? data.collections : []
  return rows.slice(0, 3)
}

export async function fetchPublicCollectionBySlug(slug) {
  const data = await jewelleryFetch(`/api/collections/${encodeURIComponent(slug)}`)
  return data?.collection || null
}

export async function fetchBackendCategories() {
  const data = await jewelleryFetch('/api/categories')
  return Array.isArray(data?.categories) ? data.categories : []
}

export async function fetchPublicCatalogCategories() {
  const data = await jewelleryFetch('/api/catalog/categories')
  return Array.isArray(data?.categories) ? data.categories : []
}

export async function fetchBackendProducts() {
  const data = await jewelleryFetch('/api/products')
  return Array.isArray(data?.products) ? data.products : []
}

export async function fetchBackendProductById(id) {
  return jewelleryFetch(`/api/products/${encodeURIComponent(id)}`)
}

export async function fetchBackendNewArrivalIds() {
  const data = await jewelleryFetch('/api/merchandising/new-arrivals')
  return Array.isArray(data?.ids) ? data.ids.map(String) : []
}

/** New arrivals: configured ids (server-resolved), else six newest published products. */
export async function fetchBackendNewArrivalProducts() {
  const data = await jewelleryFetch('/api/merchandising/new-arrivals/products')
  return Array.isArray(data?.products) ? data.products : []
}

// --- Customer auth ---

export async function customerRegister(body) {
  return jewelleryFetch('/api/auth/register', { method: 'POST', body, auth: false })
}

export async function customerLogin(body) {
  return jewelleryFetch('/api/auth/login', { method: 'POST', body, auth: false })
}

export async function customerGoogleLogin(body) {
  return jewelleryFetch('/api/auth/google', { method: 'POST', body, auth: false })
}

export async function customerGetMe() {
  return jewelleryFetch('/api/auth/me', { auth: 'customer', silentAuth: true })
}

export async function customerPatchMe(body) {
  return jewelleryFetch('/api/auth/me', { method: 'PATCH', body, auth: 'customer' })
}

export async function customerGetCart() {
  const data = await jewelleryFetch('/api/auth/cart', { auth: 'customer' })
  return Array.isArray(data?.items) ? data.items : []
}

export async function customerPutCart(items) {
  const data = await jewelleryFetch('/api/auth/cart', { method: 'PUT', body: { items }, auth: 'customer' })
  return Array.isArray(data?.items) ? data.items : []
}

export async function customerGetWishlist() {
  const data = await jewelleryFetch('/api/auth/wishlist', { auth: 'customer' })
  return Array.isArray(data?.items) ? data.items : []
}

export async function customerPutWishlist(items) {
  const data = await jewelleryFetch('/api/auth/wishlist', {
    method: 'PUT',
    body: { items },
    auth: 'customer',
  })
  return Array.isArray(data?.items) ? data.items : []
}

export async function customerForgotPasswordRequest(email) {
  return jewelleryFetch('/api/auth/forgot-password/request', {
    method: 'POST',
    body: { email },
    auth: false,
  })
}

export async function customerForgotPasswordVerifyOtp(email, otp) {
  return jewelleryFetch('/api/auth/forgot-password/verify', {
    method: 'POST',
    body: { email, otp },
    auth: false,
  })
}

export async function customerForgotPasswordReset(resetToken, newPassword) {
  return jewelleryFetch('/api/auth/forgot-password/reset', {
    method: 'POST',
    body: { resetToken, newPassword },
    auth: false,
  })
}

export async function customerLogout() {
  try {
    return await jewelleryFetch('/api/auth/logout', { method: 'POST', auth: false })
  } finally {
    clearStoredCsrfToken()
  }
}

// --- Storefront orders ---

export async function quoteCheckoutOrder(payload) {
  return jewelleryFetch('/api/orders/quote', { method: 'POST', body: payload, auth: 'customer' })
}

export async function placeBackendOrder(payload) {
  return jewelleryFetch('/api/orders', { method: 'POST', body: payload, auth: 'customer' })
}

export async function fetchRazorpayConfig() {
  try {
    return await jewelleryFetch('/api/payments/razorpay-config')
  } catch {
    return { enabled: false, keyId: null, currency: 'INR' }
  }
}

export async function createRazorpayOrder(payload) {
  return jewelleryFetch('/api/orders/razorpay-order', { method: 'POST', body: payload, auth: 'customer' })
}

export async function verifyRazorpayPayment(payload) {
  return jewelleryFetch('/api/orders/razorpay-verify', { method: 'POST', body: payload, auth: 'customer' })
}

export async function quoteCoupon(payload) {
  return jewelleryFetch('/api/coupons/quote', { method: 'POST', body: payload, auth: 'customer' })
}

export async function fetchBackendMyOrders() {
  const data = await jewelleryFetch('/api/auth/orders', { auth: 'customer' })
  return Array.isArray(data?.orders) ? data.orders : []
}

export async function fetchBackendOrderById(orderId) {
  return jewelleryFetch(`/api/auth/orders/${encodeURIComponent(orderId)}`, { auth: 'customer' })
}

export async function requestOrderCancellation(orderId, note = '') {
  return jewelleryFetch(`/api/auth/orders/${encodeURIComponent(orderId)}/cancel-request`, {
    method: 'POST',
    body: { note },
    auth: 'customer',
  })
}

export async function requestOrderReturn(orderId, note = '') {
  return jewelleryFetch(`/api/auth/orders/${encodeURIComponent(orderId)}/return-request`, {
    method: 'POST',
    body: { note },
    auth: 'customer',
  })
}

export async function cancelOrderLineItem(orderId, lineId, note = '') {
  return jewelleryFetch(
    `/api/auth/orders/${encodeURIComponent(orderId)}/items/${encodeURIComponent(lineId)}/cancel`,
    { method: 'POST', body: { note }, auth: 'customer' }
  )
}

export async function returnOrderLineItem(orderId, lineId, note = '') {
  return jewelleryFetch(
    `/api/auth/orders/${encodeURIComponent(orderId)}/items/${encodeURIComponent(lineId)}/return-request`,
    { method: 'POST', body: { note }, auth: 'customer' }
  )
}

// --- Admin ---

export async function adminLoginRequest(email, password) {
  return jewelleryFetch('/api/admin/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  })
}

export async function adminLogout() {
  try {
    return await jewelleryFetch('/api/admin/auth/logout', { method: 'POST', auth: false })
  } finally {
    clearStoredCsrfToken()
  }
}

export async function adminFetch(path, options = {}) {
  return jewelleryFetch(path, { ...options, auth: 'admin' })
}
