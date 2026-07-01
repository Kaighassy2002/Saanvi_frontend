import React, { useMemo } from 'react'
import { useNewArrivals } from '../../../hooks/useNewArrivals'
import { useFeaturedProducts } from '../../../hooks/useFeaturedProducts'
import { useBestSellers } from '../../../hooks/useBestSellers'
import { useWishlist } from '../../../hooks/useWishlist'
import { useReviewSummaries } from '../../../hooks/useReviewSummaries'
import { useHomeContent } from '../../../hooks/useHomeContent'
import { mobileTrendingViewAllHref } from '../../../services/homeMerchandising'
import HomeHeroSlider from '../HomeHeroSlider'
import HomeServiceBar from '../HomeServiceBar'
import HomePromoBanners from '../HomePromoBanners'
import HomeDesktopCategories from './HomeDesktopCategories'
import HomeDesktopProductSection from './HomeDesktopProductSection'
import HomeDesktopDiscover from './HomeDesktopDiscover'
import HomeDesktopTrust from './HomeDesktopTrust'

const SECTION_LIMIT = 10

function HomeDesktopView() {
  const { homeSections } = useHomeContent()
  const trending = homeSections.trending || {}
  const tabs = useMemo(() => {
    const raw =
      Array.isArray(trending.tabs) && trending.tabs.length
        ? trending.tabs
        : [
            { id: 'featured', label: 'Featured' },
            { id: 'new', label: 'New Arrivals' },
            { id: 'bestseller', label: 'Best Seller' },
          ]
    return raw
  }, [trending.tabs])

  const featuredTab = tabs.find((t) => t.id === 'featured') || { label: 'Featured' }
  const newTab = tabs.find((t) => t.id === 'new') || { label: 'New Arrivals' }
  const bestsellerTab = tabs.find((t) => t.id === 'bestseller') || { label: 'Best Seller' }

  const { products: newArrivals, loading: newLoading } = useNewArrivals()
  const { products: featured, loading: featuredLoading } = useFeaturedProducts(SECTION_LIMIT)
  const { products: bestsellers, loading: bestsellerLoading } = useBestSellers(SECTION_LIMIT)
  const { toggle, isInWishlist } = useWishlist()

  const newProducts = useMemo(() => newArrivals.slice(0, SECTION_LIMIT), [newArrivals])

  const newReviewSummaries = useReviewSummaries(newProducts.map((p) => p.id))
  const featuredReviewSummaries = useReviewSummaries(featured.map((p) => p.id))
  const bestsellerReviewSummaries = useReviewSummaries(bestsellers.map((p) => p.id))

  const linkLabel = trending.viewAllLabel || 'View all'

  return (
    <div className="home-desktop home-view--desktop storefront-feed--compact">
      <HomeHeroSlider />
      <HomeServiceBar />
      <HomeDesktopCategories />
      <HomeDesktopProductSection
        sectionClass="home-desktop-section--new-arrivals"
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
      <HomeDesktopProductSection
        sectionClass="home-desktop-section--featured"
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
      <HomePromoBanners />
      <HomeDesktopProductSection
        sectionClass="home-desktop-section--bestseller"
        ariaLabel="Best sellers"
        overline="Customer favorites"
        title={bestsellerTab.label}
        linkLabel={linkLabel}
        viewAllHref={mobileTrendingViewAllHref('bestseller')}
        ctaLabel="Shop best sellers"
        products={bestsellers}
        loading={bestsellerLoading && bestsellers.length === 0}
        reviewSummaries={bestsellerReviewSummaries}
        isInWishlist={isInWishlist}
        onToggleWishlist={toggle}
      />
      <HomeDesktopDiscover />
      <HomeDesktopTrust />
    </div>
  )
}

export default HomeDesktopView
