import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { whatsappUrl } from '../../services/storefrontConstants'
import { productImageUrl } from '../../utils/cloudinaryImage'
import {
  buildCustomerTimeline,
  canCustomerCancel,
  canCustomerReturn,
  flowIndex,
  formatOrderDateTime,
  formatPaymentMethodLabel,
  formatPaymentStatusLabel,
  getOrderPublicId,
  normalizeLineItem,
  lineStatusLabel,
  ORDER_STATUS_FLOW,
  orderStatusTone,
} from '../../services/orderWorkflow'
import { cancelMyOrder, fetchMyOrderById, returnMyOrder } from '../../services/storefrontOrderService'
import OrderLineItemActions from './OrderLineItemActions'
import { printOrderInvoice } from '../../utils/printOrderInvoice'

function formatPrice(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

function ProgressTracker({ status }) {
  const current = flowIndex(status)
  const terminal = ['Cancelled', 'Returned', 'Return Requested'].includes(status)

  if (terminal) {
    return (
      <div className="order-detail__progress order-detail__progress--terminal">
        <span className="order-detail__terminal">{status}</span>
      </div>
    )
  }

  return (
    <ol className="order-detail__progress" aria-label="Order progress">
      {ORDER_STATUS_FLOW.map((step, i) => {
        const done = i < current
        const active = i === current
        return (
          <li
            key={step}
            className={`order-detail__step${done ? ' order-detail__step--done' : ''}${active ? ' order-detail__step--active' : ''}`}
          >
            <span className="order-detail__step-marker" aria-hidden />
            <span className="order-detail__step-label">{step}</span>
          </li>
        )
      })}
    </ol>
  )
}

export default function OrderDetailPanel({ order: initialOrder, onOrderUpdated, onClose }) {
  const [order, setOrder] = useState(initialOrder)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [actionBusy, setActionBusy] = useState(false)
  const [actionMsg, setActionMsg] = useState('')

  const orderId = getOrderPublicId(initialOrder)

  useEffect(() => {
    setOrder(initialOrder)
  }, [initialOrder])

  useEffect(() => {
    if (!orderId) return undefined
    let cancelled = false
    setDetailLoading(true)
    setDetailError('')
    fetchMyOrderById(orderId)
      .then((full) => {
        if (cancelled) return
        if (full) setOrder(full)
        else setDetailError('Could not load order details.')
      })
      .catch((e) => {
        if (!cancelled) setDetailError(e?.message || 'Could not load order details.')
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [orderId])

  if (!order) return null

  const displayId = getOrderPublicId(order)
  const shipping = order.shipping || {}
  const items = Array.isArray(order.items) ? order.items : []
  const timeline = buildCustomerTimeline(order)
  const statusTone = orderStatusTone(order.status)

  const subtotal =
    order.subtotal != null
      ? Number(order.subtotal)
      : items.reduce((s, i) => s + (Number(i.price) || 0) * (i.quantity || 1), 0)
  const shippingFee = Number(order.shippingFee) || 0
  const couponDiscount = Number(order.couponDiscount) || 0
  const total = Number(order.total) || Math.max(0, subtotal - couponDiscount) + shippingFee
  const refunded = Number(order.lineSummary?.totalRefunded) || 0

  const handleCancelRequest = async () => {
    const raw = window.prompt('Reason for cancellation (optional):')
    if (raw === null) return
    setActionBusy(true)
    setActionMsg('')
    try {
      const updated = await cancelMyOrder(displayId, raw.trim() || 'Customer requested cancellation')
      setOrder(updated)
      onOrderUpdated?.(updated)
      setActionMsg('Cancellation request submitted.')
    } catch (e) {
      setActionMsg(e?.message || 'Could not submit cancellation')
    } finally {
      setActionBusy(false)
    }
  }

  const handleReturnRequest = async () => {
    const raw = window.prompt('Reason for return (optional):')
    if (raw === null) return
    setActionBusy(true)
    setActionMsg('')
    try {
      const updated = await returnMyOrder(displayId, raw.trim() || 'Customer requested return')
      setOrder(updated)
      onOrderUpdated?.(updated)
      setActionMsg('Return request submitted.')
    } catch (e) {
      setActionMsg(e?.message || 'Could not submit return')
    } finally {
      setActionBusy(false)
    }
  }

  return (
    <div className="order-detail" id={`order-expand-${displayId}`}>
      <div className="order-detail__head">
        <div>
          <p className="order-detail__eyebrow">Full breakdown</p>
          <p className="order-detail__id">{displayId}</p>
        </div>
        {onClose ? (
          <button type="button" className="order-detail__close" onClick={onClose} aria-label="Close">
            <i className="fa-solid fa-xmark" aria-hidden />
          </button>
        ) : null}
      </div>

      {detailLoading ? (
        <p className="order-detail__hint" aria-live="polite">
          Refreshing order…
        </p>
      ) : null}
      {detailError ? (
        <p className="order-detail__error" role="alert">
          {detailError}
        </p>
      ) : null}

      <div className="order-detail__chips">
        <span className={`order-detail__chip order-detail__chip--${statusTone}`}>{order.status}</span>
        <span className="order-detail__chip order-detail__chip--pay">
          {formatPaymentStatusLabel(order.paymentStatus)}
        </span>
        <span className="order-detail__chip order-detail__chip--muted">
          {formatPaymentMethodLabel(order.paymentMethod)}
        </span>
      </div>

      <ProgressTracker status={order.status} />

      <div className="order-detail__grid">
        <section className="order-detail__panel">
          <h3 className="order-detail__title">Items & payment</h3>
          <ul className="order-detail__items">
            {items.map((item, index) => {
              const line = normalizeLineItem(item, index, order)
              return (
                <li key={line.lineId} className="order-detail__item">
                  <img
                    src={productImageUrl(item.image, 'thumb')}
                    alt=""
                    className="order-detail__item-thumb"
                  />
                  <div className="order-detail__item-info">
                    <p className="order-detail__item-name">{item.name}</p>
                    <p className="order-detail__item-meta">
                      Qty {item.quantity || 1}
                      {item.variantName ? ` · ${item.variantName}` : ''}
                      {line.status !== 'active' ? ` · ${lineStatusLabel(line.status)}` : ''}
                    </p>
                    <OrderLineItemActions
                      order={order}
                      item={item}
                      index={index}
                      onOrderUpdated={(updated) => {
                        setOrder(updated)
                        onOrderUpdated?.(updated)
                      }}
                    />
                  </div>
                  <p className="order-detail__item-price">
                    {formatPrice((Number(item.price) || 0) * (item.quantity || 1))}
                  </p>
                </li>
              )
            })}
          </ul>

          <dl className="order-detail__ledger">
            <div>
              <dt>Subtotal</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            {couponDiscount > 0 ? (
              <div className="order-detail__ledger--discount">
                <dt>Coupon{order.couponCode ? ` (${order.couponCode})` : ''}</dt>
                <dd>−{formatPrice(couponDiscount)}</dd>
              </div>
            ) : null}
            <div>
              <dt>Shipping</dt>
              <dd>{shippingFee ? formatPrice(shippingFee) : 'Free'}</dd>
            </div>
            {refunded > 0 ? (
              <div className="order-detail__ledger--discount">
                <dt>Refunded</dt>
                <dd>−{formatPrice(refunded)}</dd>
              </div>
            ) : null}
            <div className="order-detail__ledger--total">
              <dt>Total paid</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
          </dl>
        </section>

        <section className="order-detail__panel">
          <h3 className="order-detail__title">Delivery address</h3>
          <address className="order-detail__address">
            <strong>
              {[shipping.firstName, shipping.lastName].filter(Boolean).join(' ') ||
                order.customerName}
            </strong>
            <br />
            {shipping.address}
            <br />
            {[shipping.city, shipping.state, shipping.pincode].filter(Boolean).join(', ')}
            <br />
            {shipping.phone}
            <br />
            {order.customerEmail}
          </address>

          {order.trackingNumber || order.courierPartner ? (
            <div className="order-detail__tracking">
              <i className="fa-solid fa-truck-fast" aria-hidden />
              <div>
                <p className="order-detail__tracking-label">
                  {order.courierPartner || 'Courier'}
                </p>
                {order.trackingUrl ? (
                  <a href={order.trackingUrl} target="_blank" rel="noreferrer">
                    Track {order.trackingNumber || 'shipment'}
                  </a>
                ) : (
                  <p>{order.trackingNumber}</p>
                )}
              </div>
            </div>
          ) : null}

          <h3 className="order-detail__title">Activity</h3>
          <ol className="order-detail__timeline">
            {timeline.map((entry, i) => (
              <li key={i}>
                <span className="order-detail__timeline-time">
                  {formatOrderDateTime(entry.at)}
                </span>
                <span className="order-detail__timeline-text">{entry.note}</span>
              </li>
            ))}
          </ol>

          <div className="order-detail__actions">
            <button
              type="button"
              className="order-detail__action order-detail__action--primary"
              onClick={() => printOrderInvoice(displayId)}
            >
              <i className="fa-solid fa-file-invoice" aria-hidden />
              Download invoice
            </button>
            {canCustomerCancel(order.status) && !order.cancellationRequestedAt ? (
              <button
                type="button"
                className="order-detail__action"
                disabled={actionBusy}
                onClick={handleCancelRequest}
              >
                Cancel entire order
              </button>
            ) : null}
            {canCustomerReturn(order.status) && !order.returnRequestedAt ? (
              <button
                type="button"
                className="order-detail__action"
                disabled={actionBusy}
                onClick={handleReturnRequest}
              >
                Return entire order
              </button>
            ) : null}
            <a
              href={whatsappUrl(`Hi, I need help with order ${displayId}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="order-detail__action"
            >
              <i className="fab fa-whatsapp" aria-hidden />
              WhatsApp support
            </a>
            <Link to="/returns" className="order-detail__action order-detail__action--link">
              Return policy
            </Link>
          </div>
          {actionMsg ? <p className="order-detail__action-msg">{actionMsg}</p> : null}
        </section>
      </div>
    </div>
  )
}
