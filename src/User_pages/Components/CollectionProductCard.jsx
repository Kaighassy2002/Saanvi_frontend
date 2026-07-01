import React, { memo } from 'react'
import HomeMobileFeedProductCard from './home/HomeMobileFeedProductCard'

function CollectionProductCard(props) {
  return <HomeMobileFeedProductCard {...props} />
}

export default memo(CollectionProductCard)
