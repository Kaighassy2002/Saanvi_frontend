import React from 'react'
import { Link } from 'react-router-dom'
import { getProductPrimaryImage } from '../../utils/productImages'
import HomeMobileFeedProductCard from './HomeMobileFeedProductCard'
import HomeDesktopSectionHeader from './HomeDesktopSectionHeader'

const DESKTOP_GRID_LIMIT = 10

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

function HomeDesktopProductSection({
  sectionClass = '',
  ariaLabel,
  overline,
  title,
  linkLabel,
  viewAllHref,
  ctaLabel,
  products,
  loading,
  reviewSummaries,
  isInWishlist,
  onToggleWishlist,
  limit = DESKTOP_GRID_LIMIT,
}) {
  if (!loading && products.length === 0) return null

  const displayProducts = products.slice(0, limit)

  return (
    <section
      className={`home-desktop-section ${sectionClass}`.trim()}
      aria-label={ariaLabel || title}
    >
      <div className="section-container">
        <HomeDesktopSectionHeader
          overline={overline}
          title={title}
          linkLabel={linkLabel}
          linkHref={viewAllHref}
        />

        {loading ? (
          <div className="home-desktop-product-grid" aria-hidden="true">
            {Array.from({ length: 5 }, (_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            <div className="home-desktop-product-grid">
              {displayProducts.map((product) => (
                <HomeMobileFeedProductCard
                  key={product.id}
                  product={product}
                  reviewSummary={reviewSummaries[String(product.id)]}
                  saved={isInWishlist(product.id)}
                  onToggleWishlist={() =>
                    onToggleWishlist({
                      productId: product.id,
                      name: product.name,
                      image: getProductPrimaryImage(product),
                      price: product.price,
                    })
                  }
                />
              ))}
            </div>

            {viewAllHref ? (
              <div className="home-desktop-section__cta-wrap">
                <Link to={viewAllHref} className="home-desktop-section__cta">
                  {ctaLabel || (title ? `Shop ${title.toLowerCase()}` : 'View all')}
                  <i className="fa-solid fa-arrow-right text-[10px]" aria-hidden />
                </Link>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  )
}

export default HomeDesktopProductSection
