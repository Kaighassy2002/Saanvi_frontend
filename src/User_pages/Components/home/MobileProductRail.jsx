import React from 'react'
import { Link } from 'react-router-dom'
import { getProductPrimaryImage } from '../../utils/productImages'
import MobileSectionHeader from './MobileSectionHeader'
import HomeMobileFeedProductCard from './HomeMobileFeedProductCard'

export const MOBILE_RAIL_LIMIT = 6

function MobileProductRail({
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
}) {
  if (!loading && products.length === 0) return null

  const displayProducts = products.slice(0, MOBILE_RAIL_LIMIT)

  return (
    <section
      className={`home-mobile-section ${sectionClass}`.trim()}
      aria-label={ariaLabel || title}
    >
      <MobileSectionHeader
        overline={overline}
        title={title}
        linkLabel={linkLabel}
        linkHref={viewAllHref}
      />

      {loading ? (
        <div className="home-mobile-product-rail" aria-hidden="true">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="home-mobile-product-rail__item">
              <div className="home-mobile-feed-card">
                <div className="jewelsium-skeleton home-mobile-feed-card__media" />
                <div className="home-mobile-feed-card__body">
                  <div className="jewelsium-skeleton h-3 w-1/2" />
                  <div className="jewelsium-skeleton mt-2 h-3 w-full" />
                  <div className="jewelsium-skeleton mt-2 h-3 w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="home-mobile-product-rail">
            {displayProducts.map((product) => (
              <div key={product.id} className="home-mobile-product-rail__item">
                <HomeMobileFeedProductCard
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
              </div>
            ))}
          </div>

          {viewAllHref ? (
            <div className="home-mobile-section__cta-wrap">
              <Link to={viewAllHref} className="home-mobile-section__cta">
                {ctaLabel || (title ? `View all ${title.toLowerCase()}` : 'View all')}
                <i className="fa-solid fa-arrow-right text-[10px]" aria-hidden />
              </Link>
            </div>
          ) : null}
        </>
      )}
    </section>
  )
}

export default MobileProductRail
