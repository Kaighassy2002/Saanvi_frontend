import React from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import { useHomeHeroSlides } from '../../hooks/useHomeHeroSlides'
import { productImageUrl } from '../../utils/cloudinaryImage'

import 'swiper/css'
import 'swiper/css/pagination'

const HERO_TRUST = [
  { icon: 'fa-solid fa-certificate', label: 'Certified quality' },
  { icon: 'fa-solid fa-wallet', label: 'COD available' },
  { icon: 'fa-solid fa-truck-fast', label: 'Fast delivery' },
]

function HomeHeroSlider() {
  const { slides } = useHomeHeroSlides()

  if (slides.length === 0) return null

  return (
    <section className="jewelsium-hero jewelsium-hero--premium" aria-label="Featured collections">
      <div className="jewelsium-hero__backdrop" aria-hidden>
        <div className="jewelsium-hero__mesh jewelsium-hero__mesh--gold" />
        <div className="jewelsium-hero__mesh jewelsium-hero__mesh--rose" />
        <div className="jewelsium-hero__grain" />
      </div>

      <div className="section-container jewelsium-hero__shell">
        <Swiper
          modules={[Autoplay, Pagination]}
          slidesPerView={1}
          loop={slides.length > 1}
          speed={720}
          autoplay={{ delay: 6000, disableOnInteraction: false, pauseOnMouseEnter: true }}
          pagination={
            slides.length > 1 ? { clickable: true, el: '.jewelsium-hero__dots' } : false
          }
          className="jewelsium-hero__swiper"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={`${slide.title}-${index}`}>
              <div className="jewelsium-hero__slide">
                <div className="jewelsium-hero__copy">
                  {slide.tag ? (
                    <div className="jewelsium-hero__eyebrow">
                      <span className="jewelsium-hero__eyebrow-dot" aria-hidden />
                      {slide.tag}
                    </div>
                  ) : null}

                  <h1 className="jewelsium-hero__title">{slide.title}</h1>

                  {slide.subtitle ? (
                    <p className="jewelsium-hero__subtitle">{slide.subtitle}</p>
                  ) : null}

                  <div className="jewelsium-hero__actions">
                    <Link to={slide.link} className="lux-button jewelsium-hero__btn-primary">
                      Shop now
                    </Link>
                    <Link to="/collections" className="jewelsium-hero__btn-outline">
                      Browse collections
                    </Link>
                  </div>

                  <ul className="jewelsium-hero__trust" aria-label="Store highlights">
                    {HERO_TRUST.map((item) => (
                      <li key={item.label} className="jewelsium-hero__trust-item">
                        <i className={item.icon} aria-hidden />
                        {item.label}
                      </li>
                    ))}
                  </ul>
                </div>

                {slide.image ? (
                  <div className="jewelsium-hero__visual">
                    <div className="jewelsium-hero__frame-shadow" aria-hidden />
                    <div className="jewelsium-hero__frame">
                      <img
                        src={productImageUrl(slide.image, 'hero')}
                        alt={slide.title || 'Featured jewellery'}
                        className="jewelsium-hero__img"
                        fetchPriority={index === 0 ? 'high' : undefined}
                        loading={index === 0 ? undefined : 'lazy'}
                        decoding="async"
                      />
                      <div className="jewelsium-hero__frame-shine" aria-hidden />
                    </div>
                    <div className="jewelsium-hero__float-card" aria-hidden>
                      <i className="fa-solid fa-gem" />
                      <span>Handcrafted</span>
                    </div>
                    <div className="jewelsium-hero__ring" aria-hidden />
                  </div>
                ) : null}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {slides.length > 1 ? (
          <div className="jewelsium-hero__footer">
            <div className="jewelsium-hero__dots" />
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default HomeHeroSlider
