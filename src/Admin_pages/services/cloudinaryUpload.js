/**
 * Admin image uploads via backend → Cloudinary (API secret stays on server).
 */
import { API_BASE } from '../../services/config'

/**
 * @param {File} file
 * @param {{ purpose?: 'product' | 'hero' | 'category' | 'promo', onProgress?: (percent: number) => void }} [options]
 * @returns {Promise<{ secureUrl: string, publicId: string }>}
 */
export function uploadAdminImage(file, { purpose = 'product', onProgress } = {}) {
  const q =
    purpose && purpose !== 'product'
      ? `?purpose=${encodeURIComponent(purpose)}`
      : ''
  const url = `${API_BASE}/api/admin/upload/image${q}`

  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', file)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    xhr.withCredentials = true

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    })

    xhr.addEventListener('load', () => {
      try {
        const data = JSON.parse(xhr.responseText || '{}')
        if (xhr.status >= 200 && xhr.status < 300 && data.secureUrl) {
          resolve({ secureUrl: data.secureUrl, publicId: data.publicId || '' })
          return
        }
        const msg = data.message || `Upload failed (${xhr.status})`
        reject(new Error(msg))
      } catch {
        reject(new Error('Invalid response from server'))
      }
    })

    xhr.addEventListener('error', () => reject(new Error('Network error during upload')))
    xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')))

    xhr.send(formData)
  })
}
