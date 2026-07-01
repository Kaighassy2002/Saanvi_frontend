import React from 'react'
import { Link } from 'react-router-dom'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { useHomeContent } from '../../hooks/useHomeContent'
import { productImageUrl } from '../../utils/cloudinaryImage'
import HomeDesktopSectionHeader from './home/HomeDesktopSectionHeader'

function HomePromoBanners() {
  const ref = useScrollReveal()
  const { promoBanners, homeSections } = useHomeContent()
  const promoCopy = homeSections.promo || {}
  const mobilePromoCopy = homeSections.mobilePromos || {}

  if (!promoBanners.length) return null

  return (
    <section
      ref={ref}
      className="home-desktop-section home-desktop-section--promo section-reveal"
      aria-label="Offers and promotions"
    >
      <div className="section-container">
        <HomeDesktopSectionHeader
          overline={promoCopy.overline || 'Limited time'}
          title={mobilePromoCopy.title || promoCopy.title || 'Offers for you'}
          linkLabel={mobilePromoCopy.linkLabel || 'See all'}
          linkHref={mobilePromoCopy.linkUrl || '/collections'}
        />

        <div className="home-desktop-promo-grid">
          {promoBanners.map((banner, index) => (
            <Link
              key={`${banner.title}-${index}`}
              to={banner.link}
              className="home-desktop-promo group"
            >
              <div className="home-desktop-promo__copy">
                {banner.label ? (
                  <span className="home-desktop-promo__badge">{banner.label}</span>
                ) : null}
                <h3 className="home-desktop-promo__title">{banner.title}</h3>
                <span className="home-desktop-promo__cta">
                  {banner.buttonText || 'Shop now'}
                  <i className="fa-solid fa-arrow-right text-[9px]" aria-hidden />
                </span>
              </div>
              <div className="home-desktop-promo__media">
                <img
                  src={productImageUrl(banner.image, 'promo')}
                  alt={banner.title}
                  className="home-desktop-promo__img"
                  loading="lazy"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HomePromoBanners
