import React, { useMemo } from 'react'
import { useBestSellers } from '../../../hooks/useBestSellers'
import { useWishlist } from '../../../hooks/useWishlist'
import { useReviewSummaries } from '../../../hooks/useReviewSummaries'
import { useHomeContent } from '../../../hooks/useHomeContent'
import { mobileTrendingViewAllHref } from '../../../services/homeMerchandising'
import MobileProductRail, { MOBILE_RAIL_LIMIT } from './MobileProductRail'

function HomeMobileBestSellers() {
  const { homeSections } = useHomeContent()
  const trending = homeSections.trending || {}
  const bestsellerTab = useMemo(() => {
    const tabs = Array.isArray(trending.tabs) ? trending.tabs : []
    return tabs.find((t) => t.id === 'bestseller') || { id: 'bestseller', label: 'Best Seller' }
  }, [trending.tabs])

  const { products: displayProducts, loading } = useBestSellers(MOBILE_RAIL_LIMIT)
  const { toggle, isInWishlist } = useWishlist()
  const reviewSummaries = useReviewSummaries(displayProducts.map((p) => p.id))

  return (
    <MobileProductRail
      sectionClass="home-mobile-section--bestseller"
      ariaLabel="Best sellers"
      overline="Customer favorites"
      title={bestsellerTab.label || 'Best Seller'}
      linkLabel="View all"
      viewAllHref={mobileTrendingViewAllHref('bestseller')}
      ctaLabel="Shop best sellers"
      products={displayProducts}
      loading={loading && displayProducts.length === 0}
      reviewSummaries={reviewSummaries}
      isInWishlist={isInWishlist}
      onToggleWishlist={toggle}
    />
  )
}

export default HomeMobileBestSellers
