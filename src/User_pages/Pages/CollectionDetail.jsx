import React, { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SiteHeader from '../Components/SiteHeader'
import Footer from '../Components/Footer'
import CollectionProductCard from '../Components/CollectionProductCard'
import { fetchPublicCollectionBySlug } from '../../services/jewelleryApi'
import { productImageUrl } from '../../utils/cloudinaryImage'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useWishlist } from '../../hooks/useWishlist'
import { STORE_NAME } from '../../services/storefrontConstants'
import '../Styles/curated-collections.css'
import '../Styles/collection.css'

function CollectionDetail() {
  const { slug } = useParams()
  const { toggle, isInWishlist } = useWishlist()
  const [collection, setCollection] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchPublicCollectionBySlug(slug)
      setCollection(data)
    } catch (e) {
      setCollection(null)
      setError(e?.status === 404 ? 'This collection is unavailable.' : e?.message || 'Failed to load collection')
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    load()
  }, [load])

  const title = collection?.metaTitle || collection?.name || 'Collection'
  const description =
    collection?.metaDescription ||
    collection?.description ||
    `Shop the ${collection?.name || 'jewellery'} collection at ${STORE_NAME}.`

  usePageMeta({
    title: collection ? `${title} | ${STORE_NAME}` : `Collection | ${STORE_NAME}`,
    description,
    image: collection?.heroImage || '',
    canonicalPath: collection?.slug ? `/collections/${collection.slug}` : undefined,
    noIndex: !collection && !loading,
  })

  const products = Array.isArray(collection?.products) ? collection.products : []

  return (
    <div id="main-content" className="page-shell curated-collection-detail storefront-feed--compact" tabIndex={-1}>
      <SiteHeader showSearch />

      {loading ? (
        <div className="section-container py-16 text-center text-sm text-muted">Loading collection…</div>
      ) : error || !collection ? (
        <div className="section-container curated-collection-detail__empty">
          <h1 className="font-playfair text-2xl text-ink">Collection not found</h1>
          <p className="mt-2 text-sm text-muted">{error || 'This edit may be draft, expired, or removed.'}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/" className="lux-button inline-flex">
              Back to home
            </Link>
            <Link to="/shop" className="rounded-lg border border-[#d8c4a7] px-4 py-2 text-sm">
              Shop jewellery
            </Link>
          </div>
        </div>
      ) : (
        <>
          <header className="curated-collection-hero">
            {collection.heroImage ? (
              <img
                src={productImageUrl(collection.heroImage, 'hero')}
                alt=""
                className="curated-collection-hero__img"
              />
            ) : (
              <div className="curated-collection-hero__fallback" aria-hidden />
            )}
            <div className="curated-collection-hero__veil" aria-hidden />
            <div className="curated-collection-hero__content section-container">
              <nav aria-label="Breadcrumb" className="curated-collection-hero__crumb">
                <Link to="/">Home</Link>
                <span aria-hidden>/</span>
                <span>{collection.name}</span>
              </nav>
              <h1>{collection.name}</h1>
              {collection.description ? <p>{collection.description}</p> : null}
              <p className="curated-collection-hero__count">
                {products.length} piece{products.length === 1 ? '' : 's'}
              </p>
            </div>
          </header>

          <main className="section-container curated-collection-detail__grid-wrap">
            {products.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted">Products for this collection are coming soon.</p>
            ) : (
              <ul className="storefront-products-grid">
                {products.map((product) => (
                  <li key={product.id}>
                    <CollectionProductCard
                      product={product}
                      saved={isInWishlist(product.id)}
                      onToggleWishlist={() =>
                        toggle({
                          productId: product.id,
                          name: product.name,
                          image: product.image,
                          price: product.price,
                        })
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </main>
        </>
      )}

      <Footer />
    </div>
  )
}

export default CollectionDetail
