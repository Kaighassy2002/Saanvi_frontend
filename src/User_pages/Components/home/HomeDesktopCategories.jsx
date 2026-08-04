import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useShopCategories } from '../../../hooks/useShopCategories'
import { useCatalog } from '../../../hooks/useCatalog'
import { useStoreSettings } from '../../../context/storeSettingsContext'
import { useHomeContent } from '../../../hooks/useHomeContent'
import { categoryCollectionHref } from '../../data/shopNav'
import { buildHomeCategoryDisplayList } from '../../../services/shopCategories'
import { productImageUrl } from '../../../utils/cloudinaryImage'
import { useScrollReveal } from '../../../hooks/useScrollReveal'

const DESKTOP_CATEGORY_LIMIT = 6

function CategorySkeleton() {
  return (
    <div className="home-desktop-cat-tile" aria-hidden="true">
      <div className="home-desktop-cat-tile__visual jewelsium-skeleton" />
      <div className="jewelsium-skeleton home-desktop-cat-tile__label-skeleton" />
      <div className="jewelsium-skeleton home-desktop-cat-tile__cta-skeleton" />
    </div>
  )
}

function HomeDesktopCategories() {
  const ref = useScrollReveal()
  const { categories, loading: categoriesLoading } = useShopCategories()
  const { products, loading: catalogLoading } = useCatalog()
  const { homeCategoryImages } = useStoreSettings()
  const { homeSections } = useHomeContent()
  const copy = homeSections.categories || {}
  const mobileCopy = homeSections.mobileCategories || {}

  const display = useMemo(
    () => buildHomeCategoryDisplayList(categories, products, homeCategoryImages, DESKTOP_CATEGORY_LIMIT),
    [categories, products, homeCategoryImages]
  )

  const loading = categoriesLoading || (catalogLoading && display.length === 0)
  const overline = copy.overline || 'Shop by style'
  const title = mobileCopy.title || copy.title || 'Popular Categories'

  return (
    <section
      ref={ref}
      className="home-desktop-section home-desktop-section--categories section-reveal"
      aria-label="Shop by category"
    >
      <div className="section-container">
        <div className="home-desktop-section__head home-desktop-section__head--center">
          <div className="home-desktop-section__titles">
            <p className="home-desktop-section__overline">{overline}</p>
            <h2 className="home-desktop-section__title">{title}</h2>
          </div>
        </div>

        {loading ? (
          <div className="home-desktop-cat-grid" aria-hidden="true">
            {Array.from({ length: 6 }, (_, i) => (
              <CategorySkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="home-desktop-cat-grid">
            {display.map((category) => (
              <Link
                key={category.name}
                to={categoryCollectionHref(category.name)}
                className="home-desktop-cat-tile group"
              >
                <div className="home-desktop-cat-tile__visual">
                  <span className="home-desktop-cat-tile__ring" aria-hidden />
                  <img
                    src={productImageUrl(category.image, 'category')}
                    alt=""
                    className="home-desktop-cat-tile__img"
                    loading="lazy"
                  />
                </div>
                <span className="home-desktop-cat-tile__label">{category.name}</span>
                <span className="home-desktop-cat-tile__cta">Shop now</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default HomeDesktopCategories
