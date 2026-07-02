import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { USE_LOCAL_API } from '../services/config'
import { customerGetMe } from '../services/jewelleryApi'
import {
  cacheCustomerProfile,
  clearCustomerProfileCache,
  logoutCustomerSession,
  migrateLegacyCustomerToken,
  notifyCustomerSessionChanged,
  readCachedCustomerProfile,
} from '../services/customerStorageScope'

const CustomerAuthContext = createContext(null)

export function CustomerAuthProvider({ children }) {
  const [user, setUser] = useState(() => readCachedCustomerProfile())
  const [loading, setLoading] = useState(!USE_LOCAL_API)

  useEffect(() => {
    migrateLegacyCustomerToken()
    if (USE_LOCAL_API) {
      setLoading(false)
      return
    }
    let active = true
    customerGetMe()
      .then((profile) => {
        if (!active) return
        cacheCustomerProfile(profile)
        setUser(profile)
        notifyCustomerSessionChanged()
      })
      .catch(() => {
        if (!active) return
        clearCustomerProfileCache()
        setUser(null)
        notifyCustomerSessionChanged()
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const login = useCallback((profile) => {
    if (!profile || typeof profile !== 'object') return
    cacheCustomerProfile(profile)
    setUser(profile)
    notifyCustomerSessionChanged()
  }, [])

  const logout = useCallback(async () => {
    await logoutCustomerSession()
    setUser(null)
  }, [])

  return (
    <CustomerAuthContext.Provider
      value={{
        user,
        loading,
        isLoggedIn: Boolean(user),
        login,
        logout,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  )
}

export function useCustomerAuth() {
  return useContext(CustomerAuthContext)
}
