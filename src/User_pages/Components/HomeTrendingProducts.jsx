import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useNewArrivals } from '../../hooks/useNewArrivals'
import { useBestSellers } from '../../hooks/useBestSellers'
import { useWishlist } from '../../hooks/useWishlist'
import { useReviewSummaries } from '../../hooks/useReviewSummaries'
import { useFeaturedProducts } from '../../hooks/useFeaturedProducts'
import { useHomeContent } from '../../hooks/useHomeContent'
import { trendingViewAllHref } from '../../services/homeMerchandising'
import { getProductPrimaryImage } from '../utils/productImages'
import HomeProductCard from './HomeProductCard'
import { useScrollReveal } from '../../hooks/useScrollReveal'

const GRID_SIZE = 10

function ProductSkeleton() {
  return (
    <div className="home-mobile-feed-card">
      <div className="jewelsium-skeleton home-mobile-feed-card__media" />
      <div className="home-mobile-feed-card__body space-y-2">
        <div className="jewelsium-skeleton h-3 w-2/3 rounded" />
        <div className="jewelsium-skeleton h-3 w-full rounded" />
        <div className="jewelsium-skeleton h-4 w-1/2 rounded" />
      </div>
    </div>
  )
}

function HomeTrendingProducts() {
  const ref = useScrollReveal()
  const { homeSections } = useHomeContent()
  const trending = homeSections.trending || {}
  const tabs = useMemo(
    () =>
      Array.isArray(trending.tabs) && trending.tabs.length
        ? trending.tabs
        : [
            { id: 'featured', label: 'Featured' },
            { id: 'new', label: 'New Arrivals' },
            { id: 'bestseller', label: 'Best Seller' },
          ],
    [trending.tabs]
  )
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || 'featured')
  const { products: newArrivals, loading: newLoading } = useNewArrivals()
  const { products: featured, loading: featuredLoading } = useFeaturedProducts(GRID_SIZE)
  const { products: bestseller, loading: bestsellerLoading } = useBestSellers(GRID_SIZE)
  const { toggle, isInWishlist } = useWishlist()

  const newProducts = useMemo(() => newArrivals.slice(0, GRID_SIZE), [newArrivals])

  const displayProducts =
    activeTab === 'new' ? newProducts : activeTab === 'bestseller' ? bestseller : featured

  const loading =
    (activeTab === 'new'
      ? newLoading
      : activeTab === 'featured'
        ? featuredLoading
        : bestsellerLoading) && displayProducts.length === 0

  const reviewSummaries = useReviewSummaries(displayProducts.map((p) => p.id))

  return (
    <section ref={ref} className="section-container section-reveal py-10 sm:py-16">
      {trending.overline ? <p className="text-overline text-center">{trending.overline}</p> : null}
      {trending.title ? (
        <h2 className="section-heading mt-2 text-center">{trending.title}</h2>
      ) : null}

      <div
        className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10"
        role="tablist"
        aria-label="Product collections"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`jewelsium-tabs__btn ${activeTab === tab.id ? 'is-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }, (_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : displayProducts.length === 0 ? (
        <div className="mt-10 border border-border bg-surface-warm p-10 text-center">
          <p className="text-helper text-center">No products to show yet.</p>
          <Link
            to="/collections"
            className="mt-4 inline-flex min-h-[44px] items-center bg-ink px-8 py-2.5 font-sans text-xs font-medium uppercase tracking-[0.14em] text-white transition hover:bg-royal-950"
          >
            Browse shop
          </Link>
        </div>
      ) : (
        <div
          className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5"
          role="tabpanel"
        >
          {displayProducts.map((product) => (
            <HomeProductCard
              key={product.id}
              product={product}
              reviewSummary={reviewSummaries[String(product.id)]}
              saved={isInWishlist(product.id)}
              onToggleWishlist={() =>
                toggle({
                  productId: product.id,
                  name: product.name,
                  image: getProductPrimaryImage(product),
                  price: product.price,
                })
              }
            />
          ))}
        </div>
      )}

      {trending.viewAllLabel ? (
        <div className="mt-12 text-center">
          <Link
            to={trendingViewAllHref(activeTab)}
            className="inline-flex border-b border-ink pb-1 font-sans text-sm font-medium uppercase tracking-[0.12em] text-ink transition hover:border-royal-700 hover:text-royal-700"
          >
            {trending.viewAllLabel}
          </Link>
        </div>
      ) : null}
    </section>
  )
}

export default HomeTrendingProducts
