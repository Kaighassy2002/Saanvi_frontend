import React, { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../Components/Footer'
import SiteHeader from '../Components/SiteHeader'
import HomeMobileFeedProductCard from '../Components/home/HomeMobileFeedProductCard'
import { useCart } from '../../hooks/useCart'
import { useCartDrawer } from '../../hooks/useCartDrawer'
import { useWishlist } from '../../hooks/useWishlist'
import { isCustomerLoggedIn } from '../../services/customerStorageScope'
import '../Styles/wishlist-page.css'

function WishlistItem({ product, onAddToCart, onRemove, addingId }) {
  const busy = addingId === product.productId
  const feedProduct = useMemo(
    () => ({
      id: product.productId,
      name: product.name,
      image: product.image,
      price: product.price,
      originalPrice: 0,
    }),
    [product]
  )

  return (
    <div className="wishlist-item">
      <HomeMobileFeedProductCard
        product={feedProduct}
        saved
        onToggleWishlist={() => onRemove(product.productId)}
        productHref={`/product/${product.productId}`}
      />
      <div className="wishlist-item__actions">
        <button
          type="button"
          className="add-to-bag-btn wishlist-item__bag"
          disabled={busy}
          onClick={() => onAddToCart(product)}
        >
          <i className={`fa-solid ${busy ? 'fa-spinner fa-spin' : 'fa-bag-shopping'}`} aria-hidden />
          {busy ? 'Adding…' : 'Add to bag'}
        </button>
        <Link to={`/product/${product.productId}`} className="wishlist-item__view">
          View
        </Link>
      </div>
    </div>
  )
}

function Wishlist() {
  const { items, remove } = useWishlist()
  const { addItem } = useCart()
  const { openDrawer } = useCartDrawer()
  const signedIn = isCustomerLoggedIn()

  const [toast, setToast] = useState('')
  const [addingId, setAddingId] = useState(null)

  const showToast = useCallback((message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2800)
  }, [])

  const addProductToCart = useCallback(
    (product) => {
      setAddingId(product.productId)
      addItem({
        productId: product.productId,
        variantName: '',
        variantLabel: '',
        name: product.name,
        image: product.image,
        price: Number(product.price) || 0,
        quantity: 1,
        maxStock: 9999,
      })
      openDrawer()
      showToast(`${product.name} added to your bag`)
      window.setTimeout(() => setAddingId(null), 400)
    },
    [addItem, openDrawer, showToast]
  )

  return (
    <div id="main-content" className="page-shell wishlist-page storefront-feed--compact" tabIndex={-1}>
      <SiteHeader />

      <div className="section-container wishlist-page__inner">
        <header className="wishlist-page__hero">
          <div className="wishlist-page__hero-top">
            <div>
              <p className="wishlist-page__overline">Saved for later</p>
              <h1 className="wishlist-page__title">My wishlist</h1>
            </div>
            {items.length > 0 ? (
              <span className="wishlist-page__count" aria-label={`${items.length} saved`}>
                {items.length}
              </span>
            ) : null}
          </div>
          <p className="wishlist-page__subtitle">
            {items.length > 0
              ? `${items.length} ${items.length === 1 ? 'piece' : 'pieces'} you love`
              : 'Curate pieces you love — they stay here across visits when you sign in.'}
          </p>
        </header>

        {!signedIn && items.length > 0 ? (
          <div className="wishlist-page__sync-banner" role="status">
            <div className="wishlist-page__sync-copy">
              <i className="fa-regular fa-cloud" aria-hidden />
              <p>Sign in to sync your wishlist across devices.</p>
            </div>
            <Link
              to="/auth?mode=login&redirect=/wishlist"
              className="wishlist-page__sync-btn no-underline"
            >
              Sign in
            </Link>
          </div>
        ) : null}

        {items.length === 0 ? (
          <div className="wishlist-page__empty">
            <div className="wishlist-page__empty-icon" aria-hidden>
              <i className="fa-regular fa-heart" />
            </div>
            <h2 className="wishlist-page__empty-title">Your wishlist awaits</h2>
            <p className="wishlist-page__empty-text">
              Tap the heart on any design while you browse — your saved pieces will appear here.
            </p>
            <Link to="/shop" className="lux-button wishlist-page__empty-cta no-underline">
              Explore collections
            </Link>
            <nav className="wishlist-page__quick-picks" aria-label="Quick links">
              <Link to="/" className="wishlist-page__chip no-underline">
                New arrivals
              </Link>
              <Link to="/shop" className="wishlist-page__chip no-underline">
                All jewellery
              </Link>
            </nav>
          </div>
        ) : (
          <div className="wishlist-page__grid">
            {items.map((product) => (
              <WishlistItem
                key={product.productId}
                product={product}
                addingId={addingId}
                onAddToCart={addProductToCart}
                onRemove={remove}
              />
            ))}
          </div>
        )}
      </div>

      <div
        className={`wishlist-page__toast ${toast ? 'wishlist-page__toast--visible' : ''}`}
        role="status"
        aria-live="polite"
      >
        <i className="fa-solid fa-check" aria-hidden />
        {toast}
      </div>

      <Footer />
    </div>
  )
}

export default Wishlist
