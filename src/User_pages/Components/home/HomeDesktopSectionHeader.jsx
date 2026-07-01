import React from 'react'
import { Link } from 'react-router-dom'

function HomeDesktopSectionHeader({ overline, title, linkLabel, linkHref }) {
  if (!title && !overline) return null

  return (
    <div className="home-desktop-section__head">
      <div className="home-desktop-section__titles">
        {overline ? <p className="home-desktop-section__overline">{overline}</p> : null}
        {title ? <h2 className="home-desktop-section__title">{title}</h2> : null}
      </div>
      {linkLabel && linkHref ? (
        <Link to={linkHref} className="home-desktop-section__link">
          {linkLabel}
          <i className="fa-solid fa-arrow-right text-[10px]" aria-hidden />
        </Link>
      ) : null}
    </div>
  )
}

export default HomeDesktopSectionHeader
