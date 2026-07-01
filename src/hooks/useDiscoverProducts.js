import { useCallback, useEffect, useState } from 'react'
import { CATALOG_UPDATED_EVENT } from '../services/config'
import { fetchBrowseProducts } from '../services/productDiscoveryApi'
import { mixSortedProductsForBrowse } from '../services/collectionListingSort'
import { productIsInStock } from '../services/productVariants'

export function useDiscoverProducts(limit = 8) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const pool = await fetchBrowseProducts(Math.max(limit * 4, 32))
      const inStock = pool.filter(productIsInStock)
      const shuffled = mixSortedProductsForBrowse(inStock, [])
      setProducts(shuffled.slice(0, limit))
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const onUpdate = () => load()
    window.addEventListener(CATALOG_UPDATED_EVENT, onUpdate)
    return () => window.removeEventListener(CATALOG_UPDATED_EVENT, onUpdate)
  }, [load])

  return { products, loading, refresh: load }
}
