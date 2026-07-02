import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { API_BASE, STORAGE_KEYS } from '../services/config'
import { adminFetch, adminLoginRequest } from '../services/jewelleryApi'

const AdminAuthContext = createContext(null)

function migrateLegacyAdminToken() {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(STORAGE_KEYS.adminToken)
  localStorage.removeItem(`${STORAGE_KEYS.adminToken}_profile`)
}

export function AdminAuthProvider({ children }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    migrateLegacyAdminToken()
    let active = true
    adminFetch('/api/admin/auth/me', { silentAuth: true })
      .then((user) => {
        if (active) setProfile(user)
      })
      .catch(() => {
        if (active) setProfile(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await adminLoginRequest(email, password)
    setProfile(data.user || { email, role: 'admin' })
    return data
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/api/admin/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      /* best-effort */
    }
    setProfile(null)
  }, [])

  const authFetch = useCallback(async (path, opts = {}) => {
    const { method = 'GET', body, ...rest } = opts
    try {
      return await adminFetch(path, {
        method,
        body: typeof body === 'string' ? JSON.parse(body) : body,
        ...rest,
      })
    } catch (err) {
      if (err?.status === 401) {
        setProfile(null)
        throw new Error('Session expired')
      }
      throw err
    }
  }, [])

  return (
    <AdminAuthContext.Provider
      value={{ profile, login, logout, authFetch, isAdmin: !!profile, loading }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  return useContext(AdminAuthContext)
}
