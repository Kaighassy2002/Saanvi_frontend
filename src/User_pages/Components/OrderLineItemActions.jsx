import React, { useState } from 'react'
import {
  canCustomerCancelLine,
  canCustomerReturnLine,
  lineStatusLabel,
  lineStatusNote,
  lineStatusTone,
  normalizeLineItem,
} from '../../services/orderWorkflow'
import { cancelMyOrderLine, returnMyOrderLine } from '../../services/storefrontOrderService'

export default function OrderLineItemActions({
  order,
  item,
  index = 0,
  onOrderUpdated,
  className = '',
  variant = 'stacked',
}) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  const line = normalizeLineItem(item, index, order)
  const orderId = String(order?.id || order?.publicId || '').trim()
  const orderStatus = order?.status || 'Placed'
  const tone = lineStatusTone(line.status)
  const note = lineStatusNote(line)
  const showCancel = canCustomerCancelLine(line, orderStatus)
  const showReturn = canCustomerReturnLine(line, orderStatus)
  const isTerminal = line.status !== 'active'
  const isInline = variant === 'inline'

  const runAction = async (type) => {
    const promptText =
      type === 'cancel'
        ? `Reason for cancelling "${line.name}" (optional):`
        : `Reason for returning "${line.name}" (optional):`
    const raw = window.prompt(promptText)
    if (raw === null) return
    setBusy(true)
    setMsg('')
    try {
      const updated =
        type === 'cancel'
          ? await cancelMyOrderLine(orderId, line.lineId, raw.trim() || 'Customer cancelled item')
          : await returnMyOrderLine(orderId, line.lineId, raw.trim() || 'Customer requested return')
      onOrderUpdated?.(updated)
      setMsg(type === 'cancel' ? 'Item cancelled.' : 'Return request submitted.')
    } catch (e) {
      setMsg(e?.message || 'Action failed')
    } finally {
      setBusy(false)
    }
  }

  if (!showCancel && !showReturn && !isTerminal && !msg) return null

  return (
    <div
      className={`order-line-actions order-line-actions--${variant} ${className}`.trim()}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      role="presentation"
    >
      {isTerminal && !isInline ? (
        <span className={`order-line-actions__badge order-line-actions__badge--${tone}`}>
          {lineStatusLabel(line.status)}
        </span>
      ) : null}
      {note && isTerminal && !isInline ? <p className="order-line-actions__note">{note}</p> : null}
      <div className="order-line-actions__buttons">
        {showCancel ? (
          <button
            type="button"
            className={isInline ? 'order-line__link order-line__link--danger' : 'order-line-actions__btn'}
            disabled={busy}
            onClick={() => runAction('cancel')}
          >
            {isInline ? 'Cancel item' : 'Cancel this item'}
          </button>
        ) : null}
        {showReturn ? (
          <button
            type="button"
            className={isInline ? 'order-line__link' : 'order-line-actions__btn'}
            disabled={busy}
            onClick={() => runAction('return')}
          >
            {isInline ? 'Return item' : 'Return this item'}
          </button>
        ) : null}
      </div>
      {msg ? <p className="order-line-actions__msg">{msg}</p> : null}
    </div>
  )
}
