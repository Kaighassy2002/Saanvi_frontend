/** Marketplace-style order lifecycle — mirrors backend orderWorkflow.js */

export const ORDER_STATUSES = [
  'Placed',
  'Confirmed',
  'Packed',
  'Shipped',
  'Out For Delivery',
  'Delivered',
  'Cancelled',
  'Return Requested',
  'Returned',
]

export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded']

/** Main customer tracking steps (Flipkart / Amazon style) */
export const ORDER_STATUS_FLOW = [
  'Placed',
  'Confirmed',
  'Packed',
  'Shipped',
  'Out For Delivery',
  'Delivered',
]

export function normalizeLegacyOrderStatus(status) {
  const s = String(status || 'Placed')
  const map = {
    Pending: 'Placed',
    Processing: 'Packed',
    Paid: 'Confirmed',
    'In Transit': 'Shipped',
  }
  return map[s] || s
}

export function formatPaymentStatusLabel(status) {
  const key = String(status || 'pending').toLowerCase()
  if (key === 'paid') return 'Paid'
  if (key === 'failed') return 'Failed'
  if (key === 'refunded') return 'Refunded'
  if (key === 'partially_refunded') return 'Partially refunded'
  return 'Pending'
}

export function formatPaymentMethodLabel(method) {
  const key = String(method || '').toLowerCase()
  if (key === 'razorpay' || key === 'online') return 'Online payment'
  if (key === 'cod' || key === 'cash') return 'Cash on delivery'
  if (key === 'upi') return 'UPI'
  if (key === 'card') return 'Card'
  if (!key) return '—'
  return key.charAt(0).toUpperCase() + key.slice(1)
}

export function orderStatusTone(status) {
  switch (normalizeLegacyOrderStatus(status)) {
    case 'Delivered':
      return 'delivered'
    case 'Out For Delivery':
    case 'Shipped':
      return 'transit'
    case 'Packed':
    case 'Confirmed':
      return 'processing'
    case 'Placed':
      return 'pending'
    case 'Cancelled':
      return 'cancelled'
    case 'Return Requested':
      return 'return-pending'
    case 'Returned':
      return 'returned'
    default:
      return 'default'
  }
}

export function orderStatusIcon(status) {
  switch (normalizeLegacyOrderStatus(status)) {
    case 'Delivered':
      return 'fa-solid fa-box-open'
    case 'Out For Delivery':
      return 'fa-solid fa-motorcycle'
    case 'Shipped':
      return 'fa-solid fa-truck-fast'
    case 'Packed':
      return 'fa-solid fa-box'
    case 'Confirmed':
      return 'fa-solid fa-circle-check'
    case 'Placed':
      return 'fa-solid fa-clock'
    case 'Cancelled':
      return 'fa-solid fa-circle-xmark'
    case 'Return Requested':
      return 'fa-solid fa-rotate-left'
    case 'Returned':
      return 'fa-solid fa-rotate-left'
    default:
      return 'fa-solid fa-box'
  }
}

export function orderStatusNote(status) {
  switch (normalizeLegacyOrderStatus(status)) {
    case 'Placed':
      return 'Order received — we will confirm shortly.'
    case 'Confirmed':
      return 'Order confirmed and queued for packing.'
    case 'Packed':
      return 'Your jewellery is packed and ready to ship.'
    case 'Shipped':
      return 'Handed to courier — track with the ID below.'
    case 'Out For Delivery':
      return 'Out for delivery today — please keep your phone handy.'
    case 'Delivered':
      return 'Delivered successfully. Thank you for shopping with us.'
    case 'Cancelled':
      return 'This order was cancelled.'
    case 'Return Requested':
      return 'Return request received — our team will review it.'
    case 'Returned':
      return 'Return completed. Refund status is shown under payment.'
    default:
      return null
  }
}

export function canCustomerCancel(status) {
  const s = normalizeLegacyOrderStatus(status)
  return s === 'Placed' || s === 'Confirmed' || s === 'Packed'
}

export function canCustomerReturn(status) {
  return normalizeLegacyOrderStatus(status) === 'Delivered'
}

export function flowIndex(status) {
  const s = normalizeLegacyOrderStatus(status)
  if (s === 'Cancelled' || s === 'Returned' || s === 'Return Requested') return -1
  const idx = ORDER_STATUS_FLOW.indexOf(s)
  return idx >= 0 ? idx : 0
}

/** Stable storefront/admin order key (public id). */
export function getOrderPublicId(order) {
  if (order == null) return ''
  return String(order.id || order.publicId || '').trim()
}

export function formatOrderDateTime(raw) {
  if (!raw) return '—'
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return String(raw)
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function timelineLabel(entry) {
  const note = entry?.note
  const status = entry?.status
  if (typeof note === 'string' && note.trim()) return note.trim()
  if (typeof status === 'string' && status.trim()) return status.trim()
  return 'Update'
}

export function buildCustomerTimeline(order) {
  const placedAt = order.placedAt || order.date
  const history = Array.isArray(order.statusHistory) ? order.statusHistory : []
  const timeline = history.length
    ? [...history]
    : [
        {
          status: 'Placed',
          paymentStatus: order.paymentStatus || 'pending',
          note: 'Order placed',
          at: placedAt,
          by: null,
        },
      ]
  return timeline
    .map((entry) => ({
      ...entry,
      note: timelineLabel(entry),
      at: entry?.at || placedAt,
    }))
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
    .slice(-14)
}

/** Per-line item status (mirrors backend orderLineItems.js) */
export const LINE_STATUS_LABELS = {
  active: 'Active',
  cancelled: 'Cancelled',
  return_requested: 'Return requested',
  return_received: 'Return received',
  returned: 'Returned',
  refunded: 'Refunded',
}

export function getLineId(item, index = 0) {
  return (
    String(item?.lineId || '').trim() ||
    `line_legacy_${index}_${String(item?.productId || 'item').slice(-6)}`
  )
}

export function normalizeLineItem(item, index, order = {}) {
  const lineSubtotal = (Number(item?.price) || 0) * (Number(item?.quantity) || 1)
  const subtotal =
    order.subtotal != null
      ? Number(order.subtotal)
      : (order.items || []).reduce(
          (s, i) => s + (Number(i.price) || 0) * (Number(i.quantity) || 1),
          0
        )
  const couponDiscount = Number(order.couponDiscount) || 0
  const discountAllocated =
    item?.discountAllocated != null
      ? Number(item.discountAllocated)
      : subtotal > 0
        ? Math.round(((lineSubtotal / subtotal) * couponDiscount) * 100) / 100
        : 0
  return {
    ...item,
    lineId: getLineId(item, index),
    status: item?.status || 'active',
    lineSubtotal: item?.lineSubtotal ?? lineSubtotal,
    discountAllocated,
    refundableAmount:
      item?.refundableAmount ?? Math.max(0, lineSubtotal - discountAllocated),
  }
}

export function lineStatusLabel(status) {
  return LINE_STATUS_LABELS[status] || status || 'Active'
}

export function lineStatusTone(status) {
  switch (status) {
    case 'cancelled':
      return 'cancelled'
    case 'return_requested':
      return 'return-pending'
    case 'return_received':
    case 'returned':
    case 'refunded':
      return 'returned'
    default:
      return 'default'
  }
}

export function canCustomerCancelLine(item, orderStatus) {
  return (item?.status || 'active') === 'active' && canCustomerCancel(orderStatus)
}

export function canCustomerReturnLine(item, orderStatus) {
  return (item?.status || 'active') === 'active' && canCustomerReturn(orderStatus)
}

export function orderDisplayStatus(order) {
  const items = (order?.items || []).map((item, i) => normalizeLineItem(item, i, order))
  const active = items.filter((i) => i.status === 'active').length
  const cancelled = items.filter((i) => i.status === 'cancelled').length
  const returnPending = items.filter((i) =>
    ['return_requested', 'return_received'].includes(i.status)
  ).length
  const base = normalizeLegacyOrderStatus(order?.status)
  if (cancelled > 0 && active > 0) {
    return `${base} · ${cancelled} item${cancelled > 1 ? 's' : ''} cancelled`
  }
  if (returnPending > 0 && base === 'Delivered') {
    return `Delivered · ${returnPending} return${returnPending > 1 ? 's' : ''} pending`
  }
  if (cancelled === items.length && items.length > 0) return 'Cancelled'
  return base
}

export function lineStatusNote(item) {
  switch (item?.status) {
    case 'cancelled':
      return 'This item was cancelled.'
    case 'return_requested':
      return 'Return requested — our team will contact you.'
    case 'return_received':
      return 'Return received at our warehouse.'
    case 'returned':
      return 'Return completed — refund processing.'
    case 'refunded':
      return 'Refunded for this item.'
    default:
      return null
  }
}

function refundsForLine(refunds, lineId) {
  const key = String(lineId || '')
  return (refunds || []).filter((r) =>
    (r.lineItemIds || []).some((id) => String(id) === key)
  )
}

function sumRefundAmount(refundRows) {
  return Math.round(
    (refundRows || []).reduce((s, r) => s + Number(r.amount || 0), 0) * 100
  ) / 100
}

/** Per-line refund label for admin/customer UI */
export function getLineRefundDisplay(line, order) {
  if (line?.refundDisplay) return line.refundDisplay

  const lineId = String(line?.lineId || '')
  const status = line?.status || 'active'
  const cap = Math.round((Number(line?.refundableAmount) || 0) * 100) / 100
  const linked = refundsForLine(order?.refunds, lineId)
  const refundedTotal = sumRefundAmount(linked)
  const orderStatus = normalizeLegacyOrderStatus(order?.status)

  if (status === 'refunded') {
    const amt = refundedTotal > 0 ? refundedTotal : cap
    return { state: 'refunded', amount: amt, label: `Refunded · ₹${amt.toLocaleString('en-IN')}` }
  }

  if (status === 'cancelled') {
    if (refundedTotal > 0) {
      return {
        state: 'refunded',
        amount: refundedTotal,
        label: `Cancelled · refunded ₹${refundedTotal.toLocaleString('en-IN')}`,
      }
    }
    return { state: 'cancelled', amount: 0, label: 'Cancelled · no refund' }
  }

  if (['return_requested', 'return_received', 'returned'].includes(status)) {
    return {
      state: 'pending',
      amount: cap,
      label: `Return in progress · up to ₹${cap.toLocaleString('en-IN')}`,
    }
  }

  if (status === 'active') {
    if (canCustomerCancel(orderStatus)) {
      return {
        state: 'eligible_cancel',
        amount: cap,
        label: `If cancelled · up to ₹${cap.toLocaleString('en-IN')}`,
      }
    }
    return null
  }

  return null
}

export function lineRefundDisplayClass(state) {
  switch (state) {
    case 'refunded':
      return 'text-[#5a6b52] font-semibold'
    case 'pending':
      return 'text-[#9f7a2c] font-medium'
    case 'eligible_cancel':
    case 'eligible_return':
      return 'text-muted'
    case 'cancelled':
      return 'text-muted'
    default:
      return 'text-muted'
  }
}
