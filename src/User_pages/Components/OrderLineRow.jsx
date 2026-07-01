import React from 'react'
import { Link } from 'react-router-dom'
import { STORE_NAME } from '../../services/storefrontConstants'
import { productImageUrl } from '../../utils/cloudinaryImage'
import {
  lineStatusLabel,
  lineStatusNote,
  lineStatusTone,
  normalizeLineItem,
} from '../../services/orderWorkflow'
import OrderLineItemActions from './OrderLineItemActions'

function formatPrice(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

export default function OrderLineRow({ order, item, index, onOrderUpdated, showReview = false }) {
  const line = normalizeLineItem(item, index, order)
  const productId = item.productId
  const qty = item.quantity || 1
  const lineTotal = (Number(item.price) || 0) * qty
  const tone = lineStatusTone(line.status)
  const note = lineStatusNote(line)
  const isActive = line.status === 'active'

  const thumb = (
    <img
      src={productImageUrl(item.image, 'thumb')}
      alt={item.name || 'Ordered item'}
      className="order-line__thumb"
      loading="lazy"
    />
  )

  const title = productId ? (
    <Link to={`/product/${productId}`} className="order-line__title-link">
      {item.name}
    </Link>
  ) : (
    <p className="order-line__title">{item.name}</p>
  )

  return (
    <div className={`order-line${!isActive ? ' order-line--terminal' : ''}`}>
      <div className="order-line__main">
        {productId ? (
          <Link to={`/product/${productId}`} className="order-line__media-link" aria-label={item.name}>
            {thumb}
          </Link>
        ) : (
          <div className="order-line__media">{thumb}</div>
        )}

        <div className="order-line__body">
          <div className="order-line__top">
            <div className="order-line__info">
              <p className="order-line__brand">{STORE_NAME}</p>
              {title}
              <p className="order-line__meta">
                {item.variantName ? `${item.variantName} · ` : ''}
                Qty {qty}
              </p>
            </div>
            <div className="order-line__aside">
              <p className="order-line__price">{formatPrice(lineTotal)}</p>
              {!isActive ? (
                <span className={`order-line__pill order-line__pill--${tone}`}>
                  {lineStatusLabel(line.status)}
                </span>
              ) : null}
            </div>
          </div>

          {note ? (
            <p className="order-line__note">
              <i className="fa-solid fa-circle-info" aria-hidden />
              {note}
            </p>
          ) : null}

          <div className="order-line__actions-row">
            <OrderLineItemActions
              order={order}
              item={item}
              index={index}
              onOrderUpdated={onOrderUpdated}
              variant="inline"
            />
            {showReview && productId && isActive ? (
              <Link to={`/product/${productId}#reviews`} className="order-line__link">
                <i className="fa-regular fa-star" aria-hidden />
                Write review
              </Link>
            ) : null}
            {productId ? (
              <Link to={`/product/${productId}`} className="order-line__link">
                View product
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
