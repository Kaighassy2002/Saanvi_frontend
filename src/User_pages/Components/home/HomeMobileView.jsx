import React from 'react'
import HomeMobileHero from './HomeMobileHero'
import HomeMobileServices from './HomeMobileServices'
import HomeMobileCategories from './HomeMobileCategories'
import HomeFeaturedCollections from './HomeFeaturedCollections'
import HomeMobileTrending from './HomeMobileTrending'
import HomeMobilePromos from './HomeMobilePromos'
import HomeMobileBestSellers from './HomeMobileBestSellers'
import HomeMobileDiscover from './HomeMobileDiscover'

function HomeMobileView() {
  return (
    <div className="home-mobile home-view--mobile">
      <HomeMobileHero />
      <HomeMobileServices />
      <HomeMobileCategories />
      <HomeFeaturedCollections />
      <HomeMobileTrending />
      <HomeMobilePromos />
      <HomeMobileBestSellers />
      <HomeMobileDiscover />
    </div>
  )
}

export default HomeMobileView
