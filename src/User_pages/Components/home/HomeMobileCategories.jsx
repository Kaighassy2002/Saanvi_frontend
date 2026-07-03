import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useShopCategories } from '../../../hooks/useShopCategories'
import { useCatalog } from '../../../hooks/useCatalog'
import { useHomeContent } from '../../../hooks/useHomeContent'
import { useStoreSettings } from '../../../context/storeSettingsContext'
import { categoryCollectionHref } from '../../data/shopNav'
import { applyHomeTemplate } from '../../../services/homeMerchandising'
import { buildHomeCategoryDisplayList } from '../../../services/shopCategories'
import { productImageUrl } from '../../../utils/cloudinaryImage'

const MOBILE_CATEGORY_LIMIT = 8

function FeaturedCategoryTile({ chip, freeShippingThreshold }) {
  const label = applyHomeTemplate(chip.label, { freeShippingThreshold })
  const words = label.split(/\s+/).filter(Boolean)
  const lead = words.length > 1 ? words[0] : label
  const rest = words.length > 1 ? words.slice(1).join(' ') : ''

  return (
    <Link
      to={chip.link || '/collections?sort=latest'}
      className="home-mobile-cat-tile home-mobile-cat-tile--featured"
      aria-label={label}
    >
      <div className="home-mobile-cat-tile__visual">
        <span className="home-mobile-cat-tile__featured-glow" aria-hidden />
        <span className="home-mobile-cat-tile__featured-ring" aria-hidden />
        <div className="home-mobile-cat-tile__featured-inner" aria-hidden>
          <i className="fa-solid fa-sparkles home-mobile-cat-tile__featured-icon" />
          <span className="home-mobile-cat-tile__featured-lead">{lead}</span>
          {rest ? <span className="home-mobile-cat-tile__featured-rest">{rest}</span> : null}
        </div>
      </div>
    </Link>
  )
}

function HomeMobileCategories() {
  const { freeShippingThreshold, homeCategoryImages } = useStoreSettings()
  const { categories, loading: categoriesLoading } = useShopCategories()
  const { products, loading: catalogLoading } = useCatalog()
  const { homeSections } = useHomeContent()
  const chips = Array.isArray(homeSections.mobileQuickShop?.chips)
    ? homeSections.mobileQuickShop.chips
    : []

  const display = useMemo(
    () => buildHomeCategoryDisplayList(categories, products, homeCategoryImages, MOBILE_CATEGORY_LIMIT),
    [categories, products, homeCategoryImages]
  )

  const loading = categoriesLoading || (catalogLoading && display.length === 0)

  return (
    <section className="home-mobile-section home-mobile-section--categories" aria-label="Shop by category">
      <div className="home-mobile-cat-rail-wrap">
        <div className="home-mobile-cat-rail">
          {chips.map((chip, index) => (
            <FeaturedCategoryTile
              key={`chip-${index}-${chip.label}`}
              chip={chip}
              freeShippingThreshold={freeShippingThreshold}
            />
          ))}
          {loading
            ? [1, 2, 3, 4].map((i) => (
                <div key={i} className="home-mobile-cat-tile" aria-hidden>
                  <div className="home-mobile-cat-tile__visual jewelsium-skeleton" />
                  <div className="home-mobile-cat-tile__label jewelsium-skeleton" />
                </div>
              ))
            : display.map((category) => (
                <Link
                  key={category.name}
                  to={categoryCollectionHref(category.name)}
                  className="home-mobile-cat-tile"
                  aria-label={`Shop ${category.name}`}
                >
                  <div className="home-mobile-cat-tile__visual">
                    <img
                      src={productImageUrl(category.image, 'category')}
                      alt=""
                      className="home-mobile-cat-tile__img"
                      loading="lazy"
                    />
                  </div>
                  <span className="home-mobile-cat-tile__label">{category.name}</span>
                </Link>
              ))}
        </div>
      </div>
    </section>
  )
}

export default HomeMobileCategories
