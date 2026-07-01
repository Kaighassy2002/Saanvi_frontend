import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useShopCategories } from '../../../hooks/useShopCategories'
import { useCatalog } from '../../../hooks/useCatalog'
import { useStoreSettings } from '../../../context/storeSettingsContext'
import { useHomeContent } from '../../../hooks/useHomeContent'
import { categoryCollectionHref } from '../../data/shopNav'
import { buildHomeCategoryDisplayList } from '../../../services/shopCategories'
import { productImageUrl } from '../../../utils/cloudinaryImage'
import HomeDesktopSectionHeader from './HomeDesktopSectionHeader'
import { useScrollReveal } from '../../../hooks/useScrollReveal'

const DESKTOP_CATEGORY_LIMIT = 8

function CategorySkeleton() {
  return (
    <div className="home-desktop-cat-tile" aria-hidden="true">
      <div className="home-desktop-cat-tile__visual jewelsium-skeleton" />
      <div className="jewelsium-skeleton home-desktop-cat-tile__label-skeleton" />
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

  return (
    <section
      ref={ref}
      className="home-desktop-section home-desktop-section--categories section-reveal"
      aria-label="Shop by category"
    >
      <div className="section-container">
        <HomeDesktopSectionHeader
          overline={copy.overline || 'Discover'}
          title={mobileCopy.title || copy.title || 'Shop by category'}
          linkLabel={mobileCopy.linkLabel || copy.buttonLabel}
          linkHref={mobileCopy.linkUrl || copy.buttonLink || '/collections'}
        />

        {loading ? (
          <div className="home-desktop-cat-grid" aria-hidden="true">
            {Array.from({ length: 8 }, (_, i) => (
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
                  <img
                    src={productImageUrl(category.image, 'category')}
                    alt=""
                    className="home-desktop-cat-tile__img"
                    loading="lazy"
                  />
                  <span className="home-desktop-cat-tile__overlay" aria-hidden>
                    <span className="home-desktop-cat-tile__shop">
                      Shop
                      <i className="fa-solid fa-arrow-right text-[9px]" aria-hidden />
                    </span>
                  </span>
                </div>
                <span className="home-desktop-cat-tile__label">{category.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default HomeDesktopCategories
