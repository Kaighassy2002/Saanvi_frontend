import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Footer from '../Components/Footer'
import SiteHeader from '../Components/SiteHeader'
import AccountSidebar from '../Components/AccountSidebar'
import OrderInvoicePrint from '../Components/OrderInvoicePrint'
import OrderCard from '../Components/OrderCard'
import OrderDetailPanel from '../Components/OrderDetailPanel'
import {
  CUSTOMER_SESSION_CHANGED_EVENT,
  STOREFRONT_ORDERS_UPDATED_EVENT,
  USE_LOCAL_API,
} from '../../services/config'
import { whatsappUrl, STORE_NAME } from '../../services/storefrontConstants'
import { printOrderInvoice } from '../../utils/printOrderInvoice'
import { fetchMyOrders, fetchMyOrderById } from '../../services/storefrontOrderService'
import { isCustomerLoggedIn } from '../../services/customerStorageScope'
import { getOrderPublicId } from '../../services/orderWorkflow'
import '../Styles/user-profile.css'
import '../Styles/orders-list.css'

const ORDER_FILTERS = [
  { id: 'all', label: 'All orders' },
  { id: 'active', label: 'In progress' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
]

function orderIdsMatch(a, b) {
  const left = String(a || '').trim()
  const right = String(b || '').trim()
  return left.length > 0 && left === right
}

function matchesFilter(order, filterId) {
  const status = String(order.status || '').toLowerCase()
  if (filterId === 'all') return true
  if (filterId === 'active') {
    return ['placed', 'confirmed', 'packed', 'shipped', 'out for delivery'].includes(status)
  }
  if (filterId === 'delivered') return status === 'delivered'
  if (filterId === 'cancelled') {
    return status === 'cancelled' || status === 'returned' || status === 'return requested'
  }
  return true
}

function Order() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const placedId = searchParams.get('placed')
  const orderFromQuery = searchParams.get('order')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [filter, setFilter] = useState('all')
  const [expandedId, setExpandedId] = useState(() => {
    const seed = placedId || orderFromQuery
    return seed ? String(seed).trim() : null
  })
  const [fetchedExpandedOrder, setFetchedExpandedOrder] = useState(null)

  useEffect(() => {
    if (USE_LOCAL_API) return
    if (!isCustomerLoggedIn()) {
      navigate(`/auth?redirect=${encodeURIComponent('/orders')}`, { replace: true })
    }
  }, [navigate])

  const load = useCallback(async () => {
    setLoadError('')
    try {
      const list = await fetchMyOrders()
      setOrders(list)
    } catch (e) {
      setLoadError(e?.message || 'Could not load orders')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const onSession = () => load()
    window.addEventListener(CUSTOMER_SESSION_CHANGED_EVENT, onSession)
    if (USE_LOCAL_API) {
      window.addEventListener(STOREFRONT_ORDERS_UPDATED_EVENT, onSession)
    }
    return () => {
      window.removeEventListener(CUSTOMER_SESSION_CHANGED_EVENT, onSession)
      if (USE_LOCAL_API) {
        window.removeEventListener(STOREFRONT_ORDERS_UPDATED_EVENT, onSession)
      }
    }
  }, [load])

  useEffect(() => {
    if (!placedId) return
    const t = setTimeout(() => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.delete('placed')
          return next
        },
        { replace: true },
      )
    }, 8000)
    return () => clearTimeout(t)
  }, [placedId, setSearchParams])

  const sorted = useMemo(
    () =>
      [...orders].sort((a, b) =>
        String(b.placedAt || b.date).localeCompare(String(a.placedAt || a.date)),
      ),
    [orders],
  )

  const filtered = useMemo(
    () => sorted.filter((o) => matchesFilter(o, filter)),
    [sorted, filter],
  )

  const filterCounts = useMemo(() => {
    const counts = { all: sorted.length }
    ORDER_FILTERS.forEach((f) => {
      if (f.id !== 'all') {
        counts[f.id] = sorted.filter((o) => matchesFilter(o, f.id)).length
      }
    })
    return counts
  }, [sorted])

  const placedOrder = placedId
    ? sorted.find((o) => orderIdsMatch(getOrderPublicId(o), placedId))
    : null
  const listExpandedOrder = expandedId
    ? sorted.find((o) => orderIdsMatch(getOrderPublicId(o), expandedId))
    : null
  const expandedOrder =
    listExpandedOrder ||
    (fetchedExpandedOrder && expandedId && orderIdsMatch(getOrderPublicId(fetchedExpandedOrder), expandedId)
      ? fetchedExpandedOrder
      : null) ||
    (expandedId && placedOrder && orderIdsMatch(getOrderPublicId(placedOrder), expandedId) ? placedOrder : null)
  const invoiceOrder = expandedOrder || placedOrder

  useEffect(() => {
    if (!expandedId) {
      setFetchedExpandedOrder(null)
      return undefined
    }
    if (listExpandedOrder) {
      setFetchedExpandedOrder(null)
      return undefined
    }
    let cancelled = false
    fetchMyOrderById(expandedId)
      .then((row) => {
        if (!cancelled) setFetchedExpandedOrder(row)
      })
      .catch(() => {
        if (!cancelled) setFetchedExpandedOrder(null)
      })
    return () => {
      cancelled = true
    }
  }, [expandedId, listExpandedOrder])

  useEffect(() => {
    if (placedId) setExpandedId(String(placedId).trim())
    else if (orderFromQuery) setExpandedId(String(orderFromQuery).trim())
  }, [placedId, orderFromQuery])

  useEffect(() => {
    if (!expandedId) return
    const el = document.getElementById(`order-expand-${expandedId}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [expandedId])

  const handleOrderUpdated = (updated) => {
    const id = getOrderPublicId(updated)
    if (!id) return
    setOrders((prev) => prev.map((o) => (orderIdsMatch(getOrderPublicId(o), id) ? { ...o, ...updated, id } : o)))
    if (orderIdsMatch(expandedId, id)) {
      setFetchedExpandedOrder((prev) => (prev ? { ...prev, ...updated, id } : prev))
    }
  }

  const toggleExpand = (orderId) => {
    const id = String(orderId || '').trim()
    if (!id) return
    setExpandedId((prev) => (orderIdsMatch(prev, id) ? null : id))
  }

  const showSignInHint = !USE_LOCAL_API && !isCustomerLoggedIn() && sorted.length === 0 && !placedId

  const mainContent = loading ? (
    <div className="orders-loading" aria-busy="true" aria-label="Loading orders">
      <div className="orders-skeleton" />
      <div className="orders-skeleton" />
      <div className="orders-skeleton" />
    </div>
  ) : (
    <>
      {loadError ? (
        <p className="orders-alert orders-alert--error" role="alert">
          {loadError}{' '}
          <button type="button" onClick={() => load()}>
            Retry
          </button>
        </p>
      ) : null}

      {placedId ? (
        <div className="orders-success" role="status">
          <div className="orders-success__icon" aria-hidden>
            <i className="fa-solid fa-circle-check" />
          </div>
          <div className="orders-success__body">
            <h2 className="orders-success__title">Thank you — order placed</h2>
            <p className="orders-success__text">
              <span className="orders-success__id">{placedId}</span>
              {placedOrder ? (
                <>
                  {' '}
                  is <strong>{placedOrder.status}</strong>.
                </>
              ) : (
                ' will appear in your list shortly.'
              )}
            </p>
            <div className="orders-success__actions">
              {placedOrder ? (
                <>
                  <button type="button" onClick={() => setExpandedId(placedId)}>
                    View order
                  </button>
                  <button type="button" onClick={() => printOrderInvoice(placedId)}>
                    Invoice
                  </button>
                </>
              ) : null}
              <a
                href={whatsappUrl(`Hi, I placed order ${placedId} on ${STORE_NAME}.`)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-whatsapp" aria-hidden />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      ) : null}

      {showSignInHint ? (
        <p className="orders-alert orders-alert--info">
          Sign in to see orders linked to your account.{' '}
          <Link to="/auth">Sign in</Link>
        </p>
      ) : null}

      {sorted.length > 0 ? (
        <div className="orders-filters" role="tablist" aria-label="Filter orders">
          {ORDER_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              className={`orders-filters__chip${filter === f.id ? ' orders-filters__chip--active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
              <span className="orders-filters__count">{filterCounts[f.id] ?? 0}</span>
            </button>
          ))}
        </div>
      ) : null}

      {sorted.length === 0 ? (
        <div className="orders-empty">
          <div className="orders-empty__ring" aria-hidden>
            <i className="fa-solid fa-bag-shopping" />
          </div>
          <h2 className="orders-empty__title">No orders yet</h2>
          <p className="orders-empty__text">
            Your purchases will appear here with live tracking, per-item returns, and invoices.
          </p>
          <div className="orders-empty__actions">
            <Link to="/collections" className="lux-button">
              Explore collections
            </Link>
            {!USE_LOCAL_API && !isCustomerLoggedIn() ? (
              <Link to="/auth" className="orders-empty__secondary">
                Sign in
              </Link>
            ) : null}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="orders-empty orders-empty--compact">
          <p className="orders-empty__text">No orders in this filter.</p>
          <button type="button" className="orders-empty__secondary" onClick={() => setFilter('all')}>
            Show all orders
          </button>
        </div>
      ) : (
        <ul className="orders-list">
          {filtered.map((order) => {
            const orderId = getOrderPublicId(order)
            const isExpanded = orderIdsMatch(expandedId, orderId)
            return (
              <li key={orderId}>
                <OrderCard
                  order={order}
                  isExpanded={isExpanded}
                  expandedOrder={expandedOrder}
                  onToggleExpand={toggleExpand}
                  onOrderUpdated={handleOrderUpdated}
                  onCloseDetail={() => setExpandedId(null)}
                />
              </li>
            )
          })}
        </ul>
      )}

      {expandedId &&
      !listExpandedOrder &&
      fetchedExpandedOrder &&
      orderIdsMatch(getOrderPublicId(fetchedExpandedOrder), expandedId) ? (
        <article className="order-card order-card--open orders-orphan-detail">
          <OrderDetailPanel
            order={fetchedExpandedOrder}
            onOrderUpdated={handleOrderUpdated}
            onClose={() => setExpandedId(null)}
          />
        </article>
      ) : null}
    </>
  )

  return (
    <div id="main-content" className="page-shell" tabIndex={-1}>
      {invoiceOrder ? (
        <OrderInvoicePrint
          order={invoiceOrder}
          shipping={invoiceOrder.shipping || {}}
          items={invoiceOrder.items || []}
        />
      ) : null}
      <SiteHeader />

      <div className="account-page orders-page section-container">
        <header className="orders-page__header">
          <div>
            <p className="orders-page__kicker">My account</p>
            <h1 className="orders-page__title">Orders</h1>
            <p className="orders-page__subtitle">
              Track shipments, manage returns per item, and download invoices.
            </p>
          </div>
          <div className="orders-page__header-actions">
            <Link to="/collections" className="orders-page__header-link">
              <i className="fa-solid fa-gem" aria-hidden />
              Continue shopping
            </Link>
          </div>
        </header>

        <nav className="account-tabs-mobile orders-page__tabs lg:hidden" aria-label="Account shortcuts">
          <Link to="/profile" className="account-tabs-mobile__btn">
            Profile
          </Link>
          <Link to="/profile?tab=addresses" className="account-tabs-mobile__btn">
            Addresses
          </Link>
          <span className="account-tabs-mobile__btn account-tabs-mobile__btn--active">Orders</span>
        </nav>

        <div className="account-layout">
          <AccountSidebar active="orders" />
          <div className="orders-page__content">{mainContent}</div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Order
