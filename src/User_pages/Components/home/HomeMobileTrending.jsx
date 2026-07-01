import React, { useMemo } from 'react'
import { useNewArrivals } from '../../../hooks/useNewArrivals'
import { useWishlist } from '../../../hooks/useWishlist'
import { useFeaturedProducts } from '../../../hooks/useFeaturedProducts'
import { useReviewSummaries } from '../../../hooks/useReviewSummaries'
import { useHomeContent } from '../../../hooks/useHomeContent'
import { mobileTrendingViewAllHref } from '../../../services/homeMerchandising'
import MobileProductRail, { MOBILE_RAIL_LIMIT } from './MobileProductRail'

function HomeMobileTrending() {
  const { homeSections } = useHomeContent()
  const trending = homeSections.trending || {}
  const mobileCopy = homeSections.mobileTrending || {}
  const tabs = useMemo(() => {
    const raw =
      Array.isArray(trending.tabs) && trending.tabs.length
        ? trending.tabs
        : [
            { id: 'featured', label: 'Featured' },
            { id: 'new', label: 'New Arrivals' },
            { id: 'bestseller', label: 'Best deals' },
          ]
    return raw.filter((t) => t.id !== 'bestseller')
  }, [trending.tabs])

  const featuredTab = tabs.find((t) => t.id === 'featured') || { id: 'featured', label: 'Featured' }
  const newTab = tabs.find((t) => t.id === 'new') || { id: 'new', label: 'New Arrivals' }

  const { products: newArrivals, loading: newLoading } = useNewArrivals()
  const { products: featured, loading: featuredLoading } = useFeaturedProducts(MOBILE_RAIL_LIMIT)
  const { toggle, isInWishlist } = useWishlist()

  const newProducts = useMemo(() => newArrivals.slice(0, MOBILE_RAIL_LIMIT), [newArrivals])

  const newReviewSummaries = useReviewSummaries(newProducts.map((p) => p.id))
  const featuredReviewSummaries = useReviewSummaries(featured.map((p) => p.id))

  const linkLabel = mobileCopy.linkLabel || 'View all'

  return (
    <>
      <MobileProductRail
        sectionClass="home-mobile-section--new-arrivals"
        ariaLabel="New arrivals"
        overline="Just dropped"
        title={newTab.label}
        linkLabel={linkLabel}
        viewAllHref={mobileTrendingViewAllHref('new')}
        ctaLabel="Shop new arrivals"
        products={newProducts}
        loading={newLoading && newProducts.length === 0}
        reviewSummaries={newReviewSummaries}
        isInWishlist={isInWishlist}
        onToggleWishlist={toggle}
      />
      <MobileProductRail
        sectionClass="home-mobile-section--featured"
        ariaLabel="Featured products"
        overline={trending.overline || 'Most loved picks'}
        title={featuredTab.label}
        linkLabel={linkLabel}
        viewAllHref={mobileTrendingViewAllHref('featured')}
        ctaLabel="Shop featured"
        products={featured}
        loading={featuredLoading && featured.length === 0}
        reviewSummaries={featuredReviewSummaries}
        isInWishlist={isInWishlist}
        onToggleWishlist={toggle}
      />
    </>
  )
}

export default HomeMobileTrending
