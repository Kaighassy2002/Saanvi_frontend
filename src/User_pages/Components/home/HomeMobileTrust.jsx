import React from 'react'
import { useStoreSettings } from '../../../context/storeSettingsContext'
import { applyHomeTemplate } from '../../../services/homeMerchandising'

const TRUST_ITEMS = [
  { icon: 'fa-solid fa-star', title: '4.8★ rated', text: 'Loved by customers' },
  { icon: 'fa-solid fa-wallet', title: 'COD available', text: 'Pay on delivery' },
  { icon: 'fa-solid fa-arrow-rotate-left', title: 'Easy returns', text: '7-day return policy' },
  { icon: 'fa-solid fa-shield-halved', title: 'Secure checkout', text: 'Safe payments' },
]

function HomeMobileTrust() {
  const { freeShippingThreshold } = useStoreSettings()

  return (
    <section className="home-mobile-trust" aria-label="Why shop with us">
      <p className="home-mobile-trust__heading">Why shop with us</p>
      <div className="home-mobile-scroll home-mobile-scroll--trust">
        {TRUST_ITEMS.map((item) => (
          <div key={item.title} className="home-mobile-trust__card">
            <i className={`${item.icon} home-mobile-trust__icon`} aria-hidden />
            <div>
              <p className="home-mobile-trust__title">{item.title}</p>
              <p className="home-mobile-trust__text">{item.text}</p>
            </div>
          </div>
        ))}
        {freeShippingThreshold ? (
          <div className="home-mobile-trust__card home-mobile-trust__card--gold">
            <i className="fa-solid fa-truck-fast home-mobile-trust__icon" aria-hidden />
            <div>
              <p className="home-mobile-trust__title">Free shipping</p>
              <p className="home-mobile-trust__text">
                {applyHomeTemplate('On orders over {{threshold}}', { freeShippingThreshold })}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default HomeMobileTrust
