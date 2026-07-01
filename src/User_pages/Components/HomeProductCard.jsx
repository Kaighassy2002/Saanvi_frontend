import React, { memo } from 'react'
import HomeMobileFeedProductCard from './home/HomeMobileFeedProductCard'

function HomeProductCard(props) {
  return <HomeMobileFeedProductCard {...props} />
}

export default memo(HomeProductCard)
