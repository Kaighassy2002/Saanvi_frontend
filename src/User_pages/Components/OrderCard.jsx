import React from 'react'
import { Link } from 'react-router-dom'
import { whatsappUrl } from '../../services/storefrontConstants'
import { printOrderInvoice } from '../../utils/printOrderInvoice'
import {
  formatOrderDateTime,
  formatPaymentMethodLabel,
  formatPaymentStatusLabel,
  getOrderPublicId,
  orderDisplayStatus,
  orderStatusIcon,
  orderStatusTone,
} from '../../services/orderWorkflow'
import OrderDetailPanel from './OrderDetailPanel'
import OrderLineRow from './OrderLineRow'

function formatOrderId(id) {
  const s = String(id || '').trim()
  if (!s) return '—'
  if (s.length <= 22) return s
  const parts = s.split('-').filter(Boolean)
  if (parts.length >= 2) return `${parts[0]}-…-${parts[parts.length - 1]}`
  return `${s.slice(0, 10)}…${s.slice(-6)}`
}

export default function OrderCard({
  order,
  isExpanded,
  expandedOrder,
  onToggleExpand,
  onOrderUpdated,
  onCloseDetail,
}) {
  const orderId = getOrderPublicId(order)
  const items = order.items || []
  const displayStatus = orderDisplayStatus(order)
  const tone = orderStatusTone(order.status || 'Placed')
  const showReview = (order.status || '') === 'Delivered'
  const itemCount = items.reduce((n, i) => n + (i.quantity || 1), 0)
  const refunded = Number(order.lineSummary?.totalRefunded) || 0
  const detailOrder =
    expandedOrder && getOrderPublicId(expandedOrder) === orderId ? expandedOrder : order

  return (
    <article className={`order-card${isExpanded ? ' order-card--open' : ''}`}>
      <header className="order-card__header">
        <div className="order-card__header-left">
          <span
            className={`order-card__status-icon order-card__status-icon--${tone}`}
            aria-hidden
          >
            <i className={orderStatusIcon(order.status || 'Placed')} />
          </span>
          <div>
            <p className={`order-card__status order-card__status--${tone}`}>{displayStatus}</p>
            <p className="order-card__date">{formatOrderDateTime(order.placedAt || order.date)}</p>
          </div>
        </div>
        <div className="order-card__header-right">
          <p className="order-card__id" title={orderId}>
            #{formatOrderId(orderId)}
          </p>
          <p className="order-card__count">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>
      </header>

      <div className="order-card__items">
        {items.map((item, index) => (
          <OrderLineRow
            key={`${orderId}-${index}`}
            order={order}
            item={item}
            index={index}
            onOrderUpdated={onOrderUpdated}
            showReview={showReview}
          />
        ))}
      </div>

      <footer className="order-card__footer">
        <div className="order-card__summary">
          <p className="order-card__total">
            <span className="order-card__total-label">Total</span>
            <span className="order-card__total-amount">
              ₹{Number(order.total).toLocaleString('en-IN')}
            </span>
          </p>
          <p className="order-card__payment-meta">
            {formatPaymentMethodLabel(order.paymentMethod)}
            <span className="order-card__payment-sep" aria-hidden>
              ·
            </span>
            {formatPaymentStatusLabel(order.paymentStatus)}
            {refunded > 0 ? (
              <>
                <span className="order-card__payment-sep" aria-hidden>
                  ·
                </span>
                <span className="order-card__refunded">
                  Refunded ₹{refunded.toLocaleString('en-IN')}
                </span>
              </>
            ) : null}
          </p>
        </div>

        <div className="order-card__toolbar">
          <button
            type="button"
            className={`order-card__btn${isExpanded ? ' order-card__btn--active' : ''}`}
            onClick={() => onToggleExpand(orderId)}
            aria-expanded={isExpanded}
            aria-controls={`order-expand-${orderId}`}
          >
            <i className={isExpanded ? 'fa-solid fa-chevron-up' : 'fa-solid fa-list-ul'} aria-hidden />
            {isExpanded ? 'Hide details' : 'Order details'}
          </button>
          <button
            type="button"
            className="order-card__btn order-card__btn--ghost"
            onClick={() => printOrderInvoice(orderId)}
          >
            <i className="fa-solid fa-file-invoice" aria-hidden />
            Invoice
          </button>
          {(order.status || '') === 'Delivered' ? (
            <Link to="/shop" className="order-card__btn order-card__btn--ghost">
              Shop again
            </Link>
          ) : (
            <a
              href={whatsappUrl(`Hi, I have a question about order ${orderId}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="order-card__btn order-card__btn--ghost"
            >
              <i className="fab fa-whatsapp" aria-hidden />
              Help
            </a>
          )}
        </div>
      </footer>

      {isExpanded ? (
        <OrderDetailPanel
          order={detailOrder}
          onOrderUpdated={onOrderUpdated}
          onClose={onCloseDetail}
        />
      ) : null}
    </article>
  )
}
