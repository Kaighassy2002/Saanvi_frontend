import React from 'react'
import { Link } from 'react-router-dom'

function MobileSectionHeader({ overline, title, linkLabel, linkHref }) {
  if (!title && !overline) return null

  return (
    <div className="home-mobile-section__head">
      <div>
        {overline ? <p className="home-mobile-section__overline">{overline}</p> : null}
        {title ? <h2 className="home-mobile-section__title">{title}</h2> : null}
      </div>
      {linkLabel && linkHref ? (
        <Link to={linkHref} className="home-mobile-section__link">
          {linkLabel}
        </Link>
      ) : null}
    </div>
  )
}

export default MobileSectionHeader
