import React from 'react'
import { Link } from 'react-router-dom'
import { useDiscoverProducts } from '../../../hooks/useDiscoverProducts'
import { useWishlist } from '../../../hooks/useWishlist'
import { useReviewSummaries } from '../../../hooks/useReviewSummaries'
import { useHomeContent } from '../../../hooks/useHomeContent'
import { getProductPrimaryImage } from '../../utils/productImages'
import HomeMobileFeedProductCard from './HomeMobileFeedProductCard'
import HomeDesktopSectionHeader from './HomeDesktopSectionHeader'
import { useScrollReveal } from '../../../hooks/useScrollReveal'

const DISCOVER_LIMIT = 10

function HomeDesktopDiscover() {
  const ref = useScrollReveal()
  const { products, loading } = useDiscoverProducts(DISCOVER_LIMIT)
  const { homeSections } = useHomeContent()
  const copy = homeSections.mobileDiscover || {}
  const { toggle, isInWishlist } = useWishlist()
  const reviewSummaries = useReviewSummaries(products.map((p) => p.id))

  if (!loading && products.length === 0) return null

  return (
    <section
      ref={ref}
      className="home-desktop-section home-desktop-section--discover section-reveal"
      aria-label="Discover more products"
    >
      <div className="section-container">
        <HomeDesktopSectionHeader
          overline={copy.overline || 'Handpicked for you'}
          title={copy.title || 'Discover more'}
          linkLabel={copy.linkLabel || 'View all'}
          linkHref={copy.linkUrl || '/collections'}
        />

        {loading ? (
          <div className="home-desktop-product-grid" aria-hidden="true">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="home-mobile-feed-card">
                <div className="jewelsium-skeleton home-mobile-feed-card__media" />
                <div className="home-mobile-feed-card__body space-y-2">
                  <div className="jewelsium-skeleton h-3 w-2/3 rounded" />
                  <div className="jewelsium-skeleton h-3 w-full rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="home-desktop-product-grid home-desktop-product-grid--discover">
              {products.map((product) => (
                <HomeMobileFeedProductCard
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

            <div className="home-desktop-section__cta-wrap">
              <Link to={copy.linkUrl || '/collections'} className="home-desktop-section__cta">
                {copy.ctaLabel || 'Browse all jewellery'}
                <i className="fa-solid fa-arrow-right text-[10px]" aria-hidden />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default HomeDesktopDiscover
