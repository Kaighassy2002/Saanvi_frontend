import { useContext, useEffect } from 'react'
import { useStoreSettings } from '../context/storeSettingsContext'
import { useCustomerAuth } from '../context/CustomerAuthProvider'
import { CatalogContext } from '../context/catalogContext'

export const BOOT_LOADER_ID = 'app-boot-loader'
const BODY_CLASS = 'app-boot-loading'
const MIN_VISIBLE_MS = 700
const MAX_WAIT_MS = 8000
const FADE_MS = 600

export function hideBootLoader(el = document.getElementById(BOOT_LOADER_ID)) {
  if (!el || el.dataset.hiding === '1') return
  el.dataset.hiding = '1'
  el.classList.add('app-boot-loader--hide')
  el.setAttribute('aria-busy', 'false')
  document.body.classList.remove(BODY_CLASS)

  const remove = () => {
    if (el.parentNode) el.remove()
  }

  const onEnd = (event) => {
    if (event.target !== el || event.propertyName !== 'opacity') return
    el.removeEventListener('transitionend', onEnd)
    remove()
  }

  el.addEventListener('transitionend', onEnd)
  window.setTimeout(remove, FADE_MS + 80)
}

/**
 * Hides the HTML boot splash once store settings, customer session,
 * and (in local demo) catalog data are ready.
 */
export default function AppBootLoader() {
  const { ready: settingsReady } = useStoreSettings()
  const auth = useCustomerAuth()
  const catalog = useContext(CatalogContext)

  const authReady = !auth?.loading
  const catalogReady = !catalog?.loading
  const appReady = settingsReady && authReady && catalogReady

  useEffect(() => {
    const el = document.getElementById(BOOT_LOADER_ID)
    if (!el) return undefined

    document.body.classList.add(BODY_CLASS)

    let hideTimer
    const forceTimer = window.setTimeout(() => hideBootLoader(el), MAX_WAIT_MS)

    if (appReady) {
      const wait = Math.max(0, MIN_VISIBLE_MS - performance.now())
      hideTimer = window.setTimeout(() => hideBootLoader(el), wait)
    }

    return () => {
      window.clearTimeout(hideTimer)
      window.clearTimeout(forceTimer)
    }
  }, [appReady])

  return null
}
