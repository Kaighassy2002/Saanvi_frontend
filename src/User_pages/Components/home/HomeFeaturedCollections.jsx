import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchFeaturedCollections } from '../../../services/jewelleryApi'
import { productImageUrl } from '../../../utils/cloudinaryImage'
import '../../Styles/curated-collections.css'

const FEATURED_LIMIT = 3
const FALLBACK_LABELS = ['Featured', 'Hot pick', 'Best value']

function HomeFeaturedCollections() {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const rows = await fetchFeaturedCollections()
        if (!cancelled) setCollections(Array.isArray(rows) ? rows.slice(0, FEATURED_LIMIT) : [])
      } catch {
        if (!cancelled) setCollections([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (!loading && collections.length === 0) return null

  return (
    <section className="home-featured-collections" aria-label="Featured collections">
      <div className="section-container">
        <div className="home-featured-collections__head">
          <div>
            <p className="home-featured-collections__eyebrow">From the atelier</p>
            <h2 className="home-featured-collections__title">Featured collections</h2>
          </div>
        </div>

        {loading ? (
          <div className="home-featured-collections__rail" aria-hidden>
            {[1, 2, 3].map((i) => (
              <div key={i} className="home-featured-collections__card home-featured-collections__card--skeleton" />
            ))}
          </div>
        ) : (
          <ul className="home-featured-collections__rail">
            {collections.map((c, index) => {
              const href = `/collections/${encodeURIComponent(c.slug)}`
              const label = String(c.badge || c.tag || FALLBACK_LABELS[index % FALLBACK_LABELS.length]).trim()
              return (
                <li key={c.id}>
                  <Link to={href} className="home-featured-collections__card home-featured-collections__card--link">
                    <div className="home-featured-collections__media">
                      {c.heroImage ? (
                        <img src={productImageUrl(c.heroImage, 'hero')} alt="" loading="lazy" />
                      ) : (
                        <div className="home-featured-collections__card-fallback" aria-hidden />
                      )}
                    </div>
                    <div className="home-featured-collections__card-body">
                      {label ? <span className="home-featured-collections__badge">{label}</span> : null}
                      <h3 className="home-featured-collections__name">{c.name}</h3>
                      <span className="home-featured-collections__cta">Shop now</span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}

export default HomeFeaturedCollections
