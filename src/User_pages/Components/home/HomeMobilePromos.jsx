import React from 'react'
import { Link } from 'react-router-dom'
import { useHomeContent } from '../../../hooks/useHomeContent'
import { productImageUrl } from '../../../utils/cloudinaryImage'
import MobileSectionHeader from './MobileSectionHeader'

function HomeMobilePromos() {
  const { promoBanners, homeSections } = useHomeContent()
  const copy = homeSections.mobilePromos || {}

  if (!promoBanners.length) return null

  return (
    <section className="home-mobile-section home-mobile-section--offers" aria-label="Offers">
      <MobileSectionHeader
        overline="Limited time"
        title={copy.title || 'Offers for you'}
        linkLabel={copy.linkLabel || 'See all'}
        linkHref={copy.linkUrl || '/collections'}
      />
      <div className="home-mobile-promo-list">
        {promoBanners.map((banner, index) => (
          <Link
            key={`${banner.title}-${index}`}
            to={banner.link}
            className="home-mobile-promo-card"
          >
            <div className="home-mobile-promo-card__copy">
              {banner.label ? (
                <span className="home-mobile-promo-card__badge">{banner.label}</span>
              ) : null}
              <p className="home-mobile-promo-card__title">{banner.title}</p>
              <span className="home-mobile-promo-card__cta">
                {banner.buttonText || 'Shop now'}
                <i className="fa-solid fa-arrow-right" aria-hidden />
              </span>
            </div>
            <div className="home-mobile-promo-card__media">
              <img
                src={productImageUrl(banner.image, 'promo')}
                alt=""
                className="home-mobile-promo-card__img"
                loading="lazy"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default HomeMobilePromos
