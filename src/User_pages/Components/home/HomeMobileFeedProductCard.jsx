import React, { memo } from 'react'
import { Link } from 'react-router-dom'
import ProductCardMedia from '../ProductCardMedia'
import { STORE_NAME } from '../../../services/storefrontConstants'
import { productIsInStock, productStockIsKnown } from '../../../services/productVariants'

function HomeMobileFeedProductCard({
  product,
  saved,
  onToggleWishlist,
  reviewSummary,
  size = 'default',
  colorLabel = '',
  productHref: productHrefProp,
}) {
  const price = Number(product.price || 0)
  const originalPrice = Number(product.originalPrice || 0)
  const discount =
    originalPrice > price && originalPrice > 0
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0
  const priceDrop = discount > 0 ? originalPrice - price : 0
  const stockKnown = productStockIsKnown(product)
  const inStock = stockKnown ? productIsInStock(product) : true
  const showSoldOut = stockKnown && !inStock
  const productHref = productHrefProp || `/product/${product.id}`

  return (
    <article
      className={[
        'home-mobile-feed-card',
        size === 'tall' ? 'home-mobile-feed-card--tall' : '',
        size === 'short' ? 'home-mobile-feed-card--short' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="home-mobile-feed-card__media">
        <button
          type="button"
          className={`home-mobile-feed-card__wishlist${saved ? ' is-active' : ''}`}
          onClick={(e) => {
            e.preventDefault()
            onToggleWishlist()
          }}
          aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <i className={`fa-heart ${saved ? 'fa-solid' : 'fa-regular'}`} aria-hidden />
        </button>

        <Link to={productHref} className="home-mobile-feed-card__media-link">
          <ProductCardMedia
            product={product}
            alt={colorLabel ? `${product.name} — ${colorLabel}` : product.name}
            singleImage={Boolean(colorLabel)}
            imageClassName="home-mobile-feed-card__img"
          />
        </Link>

        {reviewSummary?.count > 0 ? (
          <span className="home-mobile-feed-card__rating">
            {Number(reviewSummary.average).toFixed(1)}
            <i className="fa-solid fa-star" aria-hidden />
            {reviewSummary.count}
          </span>
        ) : null}

        {showSoldOut ? <span className="home-mobile-feed-card__oos">Sold out</span> : null}
      </div>

      <div className="home-mobile-feed-card__body">
        <p className="home-mobile-feed-card__brand">{STORE_NAME}</p>
        <Link to={productHref}>
          <h3 className="home-mobile-feed-card__title">{product.name}</h3>
        </Link>
        {colorLabel ? <p className="home-mobile-feed-card__variant">{colorLabel}</p> : null}
        <div className="home-mobile-feed-card__prices">
          {discount > 0 ? (
            <span className="home-mobile-feed-card__strike">₹{originalPrice.toLocaleString()}</span>
          ) : null}
          <span className="home-mobile-feed-card__price">₹{price.toLocaleString()}</span>
          {discount > 0 ? (
            <span className="home-mobile-feed-card__discount">{discount}% OFF</span>
          ) : null}
        </div>
        {priceDrop > 0 ? (
          <p className="home-mobile-feed-card__drop">
            <i className="fa-solid fa-arrow-down" aria-hidden />
            Price drop: ₹{priceDrop.toLocaleString()}
          </p>
        ) : null}
      </div>
    </article>
  )
}

export default memo(HomeMobileFeedProductCard)
