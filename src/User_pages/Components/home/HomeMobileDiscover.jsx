import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useDiscoverProducts } from '../../../hooks/useDiscoverProducts'
import { useWishlist } from '../../../hooks/useWishlist'
import { useReviewSummaries } from '../../../hooks/useReviewSummaries'
import { useHomeContent } from '../../../hooks/useHomeContent'
import { getProductPrimaryImage } from '../../utils/productImages'
import MobileSectionHeader from './MobileSectionHeader'
import HomeMobileFeedProductCard from './HomeMobileFeedProductCard'

const FEED_GRID_LIMIT = 10

function masonrySize(column, colIndex) {
  const pattern = colIndex % 3
  if (column === 'left') {
    if (pattern === 0) return 'tall'
    if (pattern === 2) return 'short'
    return 'default'
  }
  if (pattern === 1) return 'tall'
  if (pattern === 0) return 'short'
  return 'default'
}

function splitMasonryColumns(products) {
  const left = []
  const right = []
  products.forEach((product, index) => {
    if (index % 2 === 0) left.push(product)
    else right.push(product)
  })
  return { left, right }
}

function FeedSkeletonColumn({ tallAt = 0, shortAt = 2 }) {
  return (
    <div className="home-mobile-feed-col" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={[
            'home-mobile-feed-card',
            i === tallAt ? 'home-mobile-feed-card--tall' : '',
            i === shortAt ? 'home-mobile-feed-card--short' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div className="jewelsium-skeleton home-mobile-feed-card__media" />
          <div className="home-mobile-feed-card__body">
            <div className="jewelsium-skeleton h-3 w-1/2" />
            <div className="jewelsium-skeleton mt-2 h-3 w-full" />
            <div className="jewelsium-skeleton mt-2 h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

function FeedSkeleton() {
  return (
    <div className="home-mobile-feed-grid">
      <FeedSkeletonColumn tallAt={0} shortAt={2} />
      <FeedSkeletonColumn tallAt={1} shortAt={0} />
    </div>
  )
}

function FeedColumn({ products, column, reviewSummaries, isInWishlist, onToggleWishlist }) {
  return (
    <div className="home-mobile-feed-col">
      {products.map((product, colIndex) => (
        <HomeMobileFeedProductCard
          key={product.id}
          product={product}
          size={masonrySize(column, colIndex)}
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
  )
}

function HomeMobileDiscover() {
  const { products, loading } = useDiscoverProducts(FEED_GRID_LIMIT)
  const { homeSections } = useHomeContent()
  const copy = homeSections.mobileDiscover || {}
  const { toggle, isInWishlist } = useWishlist()

  const columns = useMemo(() => splitMasonryColumns(products), [products])
  const reviewSummaries = useReviewSummaries(products.map((p) => p.id))

  if (!loading && products.length === 0) return null

  return (
    <section className="home-mobile-section home-mobile-section--discover" aria-label="Discover more products">
      <MobileSectionHeader
        overline={copy.overline || 'Handpicked for you'}
        title={copy.title || 'Discover more'}
        linkLabel={copy.linkLabel || 'View all'}
        linkHref={copy.linkUrl || '/shop'}
      />

      {loading ? (
        <FeedSkeleton />
      ) : (
        <>
          <div className="home-mobile-feed-grid">
            <FeedColumn
              products={columns.left}
              column="left"
              reviewSummaries={reviewSummaries}
              isInWishlist={isInWishlist}
              onToggleWishlist={toggle}
            />
            <FeedColumn
              products={columns.right}
              column="right"
              reviewSummaries={reviewSummaries}
              isInWishlist={isInWishlist}
              onToggleWishlist={toggle}
            />
          </div>

          <div className="home-mobile-section__cta-wrap">
            <Link to={copy.linkUrl || '/shop'} className="home-mobile-section__cta">
              {copy.ctaLabel || 'Browse all jewellery'}
              <i className="fa-solid fa-arrow-right text-[10px]" aria-hidden />
            </Link>
          </div>
        </>
      )}
    </section>
  )
}

export default HomeMobileDiscover
