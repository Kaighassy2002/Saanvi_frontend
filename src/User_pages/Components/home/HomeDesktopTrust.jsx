import React from 'react'
import { useStoreSettings } from '../../../context/storeSettingsContext'
import { applyHomeTemplate } from '../../../services/homeMerchandising'
import { useScrollReveal } from '../../../hooks/useScrollReveal'

const TRUST_ITEMS = [
  { icon: 'fa-solid fa-star', title: '4.8★ rated', text: 'Loved by customers' },
  { icon: 'fa-solid fa-wallet', title: 'COD available', text: 'Pay on delivery' },
  { icon: 'fa-solid fa-arrow-rotate-left', title: 'Easy returns', text: '7-day return policy' },
  { icon: 'fa-solid fa-shield-halved', title: 'Secure checkout', text: 'Safe payments' },
]

function HomeDesktopTrust() {
  const ref = useScrollReveal()
  const { freeShippingThreshold } = useStoreSettings()

  return (
    <section ref={ref} className="home-desktop-trust section-reveal" aria-label="Why shop with us">
      <div className="section-container">
        <p className="home-desktop-trust__heading">Why shop with us</p>
        <div className="home-desktop-trust__grid">
          {TRUST_ITEMS.map((item) => (
            <div key={item.title} className="home-desktop-trust__card">
              <span className="home-desktop-trust__icon-wrap">
                <i className={item.icon} aria-hidden />
              </span>
              <div>
                <p className="home-desktop-trust__title">{item.title}</p>
                <p className="home-desktop-trust__text">{item.text}</p>
              </div>
            </div>
          ))}
          {freeShippingThreshold ? (
            <div className="home-desktop-trust__card home-desktop-trust__card--gold">
              <span className="home-desktop-trust__icon-wrap">
                <i className="fa-solid fa-truck-fast" aria-hidden />
              </span>
              <div>
                <p className="home-desktop-trust__title">Free shipping</p>
                <p className="home-desktop-trust__text">
                  {applyHomeTemplate('On orders over {{threshold}}', { freeShippingThreshold })}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default HomeDesktopTrust
