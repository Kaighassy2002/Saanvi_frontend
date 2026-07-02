import { API_BASE, CUSTOMER_SESSION_CHANGED_EVENT, STORAGE_KEYS, USE_LOCAL_API } from './config'

/** @deprecated JWT is no longer stored — kept for one-time migration cleanup. */
const LEGACY_TOKEN_KEY = STORAGE_KEYS.customerToken

export function readCachedCustomerProfile() {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.customerProfile)
    if (!raw) return null
    const p = JSON.parse(raw)
    return p && typeof p === 'object' ? p : null
  } catch {
    return null
  }
}

export function cacheCustomerProfile(user) {
  if (typeof localStorage === 'undefined' || !user || typeof user !== 'object') return
  localStorage.setItem(STORAGE_KEYS.customerProfile, JSON.stringify(user))
}

export function clearCustomerProfileCache() {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(STORAGE_KEYS.customerProfile)
  localStorage.removeItem(LEGACY_TOKEN_KEY)
}

/** Remove legacy JWT keys from older builds (httpOnly cookies only now). */
export function migrateLegacyCustomerToken() {
  if (typeof localStorage === 'undefined') return
  if (localStorage.getItem(LEGACY_TOKEN_KEY)) {
    localStorage.removeItem(LEGACY_TOKEN_KEY)
  }
}

/** True when a customer profile is cached (demo mode) or cookie session is active. */
export function isCustomerLoggedIn() {
  return Boolean(readCachedCustomerProfile())
}

/** `guest` when logged out; Mongo user id string when profile present. */
export function getCustomerStorageScope() {
  const p = readCachedCustomerProfile()
  return p?.id ? String(p.id) : 'guest'
}

export function scopedCartKey(scope) {
  return `${STORAGE_KEYS.shopCart}::__scope_${scope}`
}

export function scopedWishlistKey(scope) {
  return `${STORAGE_KEYS.shopWishlist}::__scope_${scope}`
}

export function scopedStorefrontOrdersKey(scope) {
  return `jewellery_storefront_orders::__scope_${scope}`
}

/** Call after login / register / logout so cart, wishlist, and orders rebind to the right user. */
export function notifyCustomerSessionChanged() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(CUSTOMER_SESSION_CHANGED_EVENT))
}

export async function customerLogoutRequest() {
  if (USE_LOCAL_API || !API_BASE) return
  try {
    await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' })
  } catch {
    /* best-effort */
  }
}

/** Clear cached profile and httpOnly cookie after 401. */
export function clearExpiredCustomerSession(err) {
  const status = err?.status ?? err?.statusCode
  if (status !== 401) return false
  void customerLogoutRequest()
  clearCustomerProfileCache()
  notifyCustomerSessionChanged()
  return true
}

export async function logoutCustomerSession() {
  await customerLogoutRequest()
  clearCustomerProfileCache()
  notifyCustomerSessionChanged()
}
