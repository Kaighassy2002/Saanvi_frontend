import React from 'react'
import HomeMobileHero from './HomeMobileHero'
import HomeMobileServices from './HomeMobileServices'
import HomeMobileCategories from './HomeMobileCategories'
import HomeMobileTrending from './HomeMobileTrending'
import HomeMobilePromos from './HomeMobilePromos'
import HomeMobileBestSellers from './HomeMobileBestSellers'
import HomeMobileDiscover from './HomeMobileDiscover'
import HomeMobileTrust from './HomeMobileTrust'

function HomeMobileView() {
  return (
    <div className="home-mobile home-view--mobile">
      <HomeMobileCategories />
      <HomeMobileHero />
      <HomeMobileServices />
      <HomeMobileTrending />
      <HomeMobilePromos />
      <HomeMobileBestSellers />
      <HomeMobileDiscover />
      <HomeMobileTrust />
    </div>
  )
}

export default HomeMobileView
