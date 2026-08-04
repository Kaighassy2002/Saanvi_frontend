import { useEffect } from 'react'
import { useStoreSettings } from '../context/storeSettingsContext'

export const BOOT_LOADER_ID = 'app-boot-loader'
const BODY_CLASS = 'app-boot-loading'
/** Brand moment on first paint */
const MIN_VISIBLE_MS = 1600
/** Upper bound if settings are slow */
const MAX_WAIT_MS = 5000
const FADE_MS = 550

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
  window.setTimeout(remove, FADE_MS + 100)
}

/**
 * Hides the HTML boot splash once store settings are ready (or a short
 * max wait). Auth and catalog continue in the background — home already
 * uses skeletons for progressive content.
 */
export default function AppBootLoader() {
  const { ready: settingsReady } = useStoreSettings()

  useEffect(() => {
    const el = document.getElementById(BOOT_LOADER_ID)
    if (!el) return undefined

    document.body.classList.add(BODY_CLASS)

    let hideTimer
    const forceTimer = window.setTimeout(() => hideBootLoader(el), MAX_WAIT_MS)

    if (settingsReady) {
      const wait = Math.max(0, MIN_VISIBLE_MS - performance.now())
      hideTimer = window.setTimeout(() => hideBootLoader(el), wait)
    }

    return () => {
      window.clearTimeout(hideTimer)
      window.clearTimeout(forceTimer)
    }
  }, [settingsReady])

  return null
}
