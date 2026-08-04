/** Storefront path constants — catalog vs curated collections. */
export const SHOP_PATH = '/shop'
export const COLLECTIONS_PATH = '/collections'

export function shopHref(query = '') {
  const q = typeof query === 'string' ? query.replace(/^\?/, '') : String(query || '')
  return q ? `${SHOP_PATH}?${q}` : SHOP_PATH
}

export function collectionHref(slug = '') {
  const s = String(slug || '').trim()
  return s ? `${COLLECTIONS_PATH}/${encodeURIComponent(s)}` : COLLECTIONS_PATH
}

/** Query keys that belong to the product catalog (legacy /collections?… bookmarks). */
export const SHOP_QUERY_KEYS = ['category', 'search', 'sort', 'stock', 'min', 'max', 'color', 'material']

export function searchParamsLookLikeShop(searchParams) {
  if (!searchParams) return false
  return SHOP_QUERY_KEYS.some((key) => searchParams.has(key))
}
