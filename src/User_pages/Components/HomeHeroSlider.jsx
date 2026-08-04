import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import { useHomeHeroSlides } from '../../hooks/useHomeHeroSlides'
import { productImageUrl } from '../../utils/cloudinaryImage'

import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

function HomeHeroSlider() {
  const { slides } = useHomeHeroSlides()
  const prevRef = useRef(null)
  const nextRef = useRef(null)
  const dotsRef = useRef(null)

  if (slides.length === 0) return null

  const multi = slides.length > 1

  return (
    <section className="jewelsium-hero jewelsium-hero--split" aria-label="Featured collections">
      {multi ? (
        <>
          <button
            ref={prevRef}
            type="button"
            className="jewelsium-hero__nav jewelsium-hero__nav--prev"
            aria-label="Previous slide"
          >
            <i className="fa-solid fa-chevron-left" aria-hidden />
          </button>
          <button
            ref={nextRef}
            type="button"
            className="jewelsium-hero__nav jewelsium-hero__nav--next"
            aria-label="Next slide"
          >
            <i className="fa-solid fa-chevron-right" aria-hidden />
          </button>
          <div ref={dotsRef} className="jewelsium-hero__dots" />
        </>
      ) : null}

      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        slidesPerView={1}
        autoHeight={false}
        loop={multi}
        speed={680}
        autoplay={multi ? { delay: 6000, disableOnInteraction: false, pauseOnMouseEnter: true } : false}
        pagination={
          multi
            ? {
                clickable: true,
                el: dotsRef.current,
              }
            : false
        }
        navigation={
          multi
            ? {
                prevEl: prevRef.current,
                nextEl: nextRef.current,
              }
            : false
        }
        onBeforeInit={(swiper) => {
          if (!multi) return
          if (typeof swiper.params.navigation !== 'boolean') {
            swiper.params.navigation.prevEl = prevRef.current
            swiper.params.navigation.nextEl = nextRef.current
          }
          if (typeof swiper.params.pagination !== 'boolean') {
            swiper.params.pagination.el = dotsRef.current
          }
        }}
        className="jewelsium-hero__swiper"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={`${slide.title}-${index}`} style={{ height: '100%' }}>
            <div className="jewelsium-hero__slide">
              <div className="jewelsium-hero__copy">
                {slide.tag ? <p className="jewelsium-hero__eyebrow">{slide.tag}</p> : null}
                <h1 className="jewelsium-hero__title">{slide.title}</h1>
                {slide.subtitle ? (
                  <p className="jewelsium-hero__subtitle">{slide.subtitle}</p>
                ) : null}
                <Link to={slide.link} className="jewelsium-hero__cta">
                  {slide.buttonText || 'Shop now'}
                </Link>
              </div>

              <div className="jewelsium-hero__media">
                {slide.image ? (
                  <img
                    src={productImageUrl(slide.image, 'hero')}
                    alt={slide.title || 'Featured jewellery'}
                    className="jewelsium-hero__img"
                    fetchPriority={index === 0 ? 'high' : undefined}
                    loading={index === 0 ? undefined : 'lazy'}
                    decoding="async"
                  />
                ) : (
                  <div className="jewelsium-hero__media-fallback" aria-hidden />
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}

export default HomeHeroSlider
