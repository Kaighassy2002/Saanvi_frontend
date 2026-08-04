import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useAdminAuth } from '../context/AdminAuthProvider'
import {
  createCoupon,
  deleteCoupon,
  listCoupons,
  updateCoupon,
} from './services/adminApi'
import AdminPageHeader from './components/AdminPageHeader'
import AdminErrorBanner from './components/AdminErrorBanner'
import AdminConfirmDialog from './components/AdminConfirmDialog'
import AdminDataTable from './components/AdminDataTable'
import { INPUT_CLASS, SettingsField } from './components/AdminSettingsUi'
import { useAdminToast } from './shared/AdminToastProvider'

const CODE_PATTERN = /^[A-Z0-9][A-Z0-9_-]{1,31}$/

const emptyForm = () => ({
  code: '',
  type: 'percent',
  value: '10',
  minOrder: '0',
  maxUses: '0',
  active: true,
  expiresAt: '',
})

function todayIsoDate() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function formatInr(n) {
  const num = Number(n) || 0
  return `₹${num.toLocaleString('en-IN')}`
}

function isExpired(row) {
  if (!row?.expiresAt) return false
  return new Date(row.expiresAt) < new Date()
}

function isExhausted(row) {
  const max = Number(row?.maxUses) || 0
  if (max <= 0) return false
  return Number(row?.usedCount || 0) >= max
}

/** @returns {'active' | 'inactive' | 'expired' | 'exhausted'} */
function couponStatus(row) {
  if (isExpired(row)) return 'expired'
  if (row?.active === false) return 'inactive'
  if (isExhausted(row)) return 'exhausted'
  return 'active'
}

function StatusBadge({ status }) {
  const styles = {
    active: 'bg-emerald-100 text-emerald-800',
    inactive: 'bg-stone-200 text-stone-600',
    expired: 'bg-amber-100 text-amber-900',
    exhausted: 'bg-rose-100 text-rose-800',
  }
  const labels = {
    active: 'Active',
    inactive: 'Inactive',
    expired: 'Expired',
    exhausted: 'Limit reached',
  }
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${styles[status] || styles.inactive}`}
    >
      {labels[status] || status}
    </span>
  )
}

function discountLabel(row) {
  if (row.type === 'percent') return `${row.value}% off`
  return `${formatInr(row.value)} off`
}

function usageLabel(row) {
  const used = Number(row.usedCount) || 0
  const max = Number(row.maxUses) || 0
  if (max <= 0) return `${used} / ∞`
  return `${used} / ${max}`
}

function expiryLabel(row) {
  if (!row.expiresAt) return 'No expiry'
  try {
    return new Date(row.expiresAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

function validateForm(form, { editId, rows }) {
  const errors = {}
  const code = String(form.code || '')
    .trim()
    .toUpperCase()

  if (!code) {
    errors.code = 'Coupon code is required'
  } else if (!CODE_PATTERN.test(code)) {
    errors.code = 'Use 2–32 characters: letters, numbers, _ or -'
  } else {
    const duplicate = rows.find(
      (r) => String(r.code || '').toUpperCase() === code && r.id !== editId
    )
    if (duplicate) errors.code = 'This coupon code already exists'
  }

  const type = form.type === 'flat' ? 'flat' : 'percent'
  const value = Number(form.value)
  if (!Number.isFinite(value) || value <= 0) {
    errors.value = 'Enter a discount greater than 0'
  } else if (type === 'percent' && value > 100) {
    errors.value = 'Percent cannot exceed 100'
  }

  const minOrder = Number(form.minOrder)
  if (!Number.isFinite(minOrder) || minOrder < 0) {
    errors.minOrder = 'Must be 0 or greater'
  }

  const maxUses = Number(form.maxUses)
  if (!Number.isFinite(maxUses) || maxUses < 0 || !Number.isInteger(maxUses)) {
    errors.maxUses = 'Use a whole number ≥ 0 (0 = unlimited)'
  }

  if (form.expiresAt) {
    if (form.expiresAt < todayIsoDate() && form.active) {
      errors.expiresAt = 'Expiry cannot be in the past for an active coupon'
    }
  }

  return errors
}

function AdminCoupons() {
  const { authFetch } = useAdminAuth()
  const { toast } = useAdminToast()
  const [rows, setRows] = useState([])
  const [form, setForm] = useState(emptyForm())
  const [fieldErrors, setFieldErrors] = useState({})
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [togglingId, setTogglingId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const load = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      setRows(await listCoupons(authFetch))
    } catch (e) {
      setError(e?.message || 'Failed to load coupons')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [authFetch])

  useEffect(() => {
    load()
  }, [load])

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((row) => {
      const status = couponStatus(row)
      if (statusFilter !== 'all' && status !== statusFilter) return false
      if (!q) return true
      return (
        String(row.code || '')
          .toLowerCase()
          .includes(q) ||
        String(row.type || '')
          .toLowerCase()
          .includes(q) ||
        discountLabel(row).toLowerCase().includes(q)
      )
    })
  }, [rows, search, statusFilter])

  const stats = useMemo(() => {
    let active = 0
    let expired = 0
    let inactive = 0
    for (const row of rows) {
      const s = couponStatus(row)
      if (s === 'active') active += 1
      else if (s === 'expired') expired += 1
      else if (s === 'inactive') inactive += 1
    }
    return { total: rows.length, active, expired, inactive }
  }, [rows])

  const resetForm = () => {
    setEditId(null)
    setForm(emptyForm())
    setFieldErrors({})
  }

  const startEdit = (row) => {
    setEditId(row.id)
    setFieldErrors({})
    setForm({
      code: row.code || '',
      type: row.type === 'flat' ? 'flat' : 'percent',
      value: String(row.value ?? 0),
      minOrder: String(row.minOrder ?? 0),
      maxUses: String(row.maxUses ?? 0),
      active: row.active !== false,
      expiresAt: row.expiresAt ? String(row.expiresAt).slice(0, 10) : '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validateForm(form, { editId, rows })
    if (Object.keys(errors).length) {
      setFieldErrors(errors)
      toast(Object.values(errors)[0], 'error')
      return
    }

    setSaving(true)
    setFieldErrors({})
    try {
      const body = {
        code: form.code.trim().toUpperCase(),
        type: form.type === 'flat' ? 'flat' : 'percent',
        value: Number(form.value),
        minOrder: Number(form.minOrder) || 0,
        maxUses: Number(form.maxUses) || 0,
        active: form.active,
        expiresAt: form.expiresAt || null,
      }
      if (editId) {
        await updateCoupon(authFetch, editId, body)
        toast('Coupon updated.')
      } else {
        await createCoupon(authFetch, body)
        toast('Coupon created.')
      }
      resetForm()
      await load()
    } catch (err) {
      const apiErrors = err?.errors || err?.data?.errors
      if (Array.isArray(apiErrors) && apiErrors.length) {
        const mapped = {}
        for (const item of apiErrors) {
          if (item?.field) mapped[item.field] = item.message
        }
        setFieldErrors(mapped)
      }
      toast(err?.message || 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (row) => {
    if (togglingId) return
    const nextActive = row.active === false
    if (nextActive && isExpired(row)) {
      toast('Renew the expiry date before enabling this coupon.', 'error')
      startEdit(row)
      return
    }
    setTogglingId(row.id)
    try {
      await updateCoupon(authFetch, row.id, { active: nextActive })
      toast(nextActive ? 'Coupon enabled.' : 'Coupon disabled.')
      await load()
    } catch (e) {
      toast(e?.message || 'Update failed', 'error')
    } finally {
      setTogglingId(null)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteCoupon(authFetch, deleteTarget.id)
      if (editId === deleteTarget.id) resetForm()
      setDeleteTarget(null)
      toast('Coupon deleted.')
      await load()
    } catch (e) {
      toast(e?.message || 'Delete failed', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const tableColumns = [
    { key: 'code', label: 'Code' },
    { key: 'discount', label: 'Discount' },
    { key: 'minOrder', label: 'Min order' },
    { key: 'usage', label: 'Usage' },
    { key: 'expires', label: 'Expires' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: '' },
  ]

  return (
    <div className="max-w-5xl pb-24">
      <AdminPageHeader
        title="Coupons"
        description={
          <>
            Create and manage discount codes for the India GST storefront
            {!loading ? (
              <span className="font-medium text-ink">
                {' '}
                · {stats.total} total · {stats.active} active
              </span>
            ) : null}
          </>
        }
      />

      <AdminErrorBanner message={error} onRetry={load} />

      <form onSubmit={handleSubmit} className="lux-card mb-6 overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#f0e6d6] bg-[#faf7f2] px-5 py-4">
          <div>
            <h2 className="admin-section-title text-base">
              {editId ? 'Edit coupon' : 'New coupon'}
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              Codes are saved uppercase. Set max uses to 0 for unlimited redemptions.
            </p>
          </div>
          {editId ? (
            <button type="button" className="text-xs text-muted hover:text-ink" onClick={resetForm}>
              Cancel edit
            </button>
          ) : null}
        </div>

        <div className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsField label="Coupon code *" htmlFor="coupon-code" error={fieldErrors.code}>
              <input
                id="coupon-code"
                className={`${INPUT_CLASS} font-mono tracking-wide uppercase`}
                value={form.code}
                onChange={(e) => setField('code', e.target.value.toUpperCase())}
                placeholder="e.g. FESTIVE20"
                autoComplete="off"
                spellCheck={false}
                maxLength={32}
                required
              />
            </SettingsField>

            <SettingsField label="Discount type *" htmlFor="coupon-type">
              <select
                id="coupon-type"
                className={INPUT_CLASS}
                value={form.type}
                onChange={(e) => setField('type', e.target.value)}
              >
                <option value="percent">Percent off (%)</option>
                <option value="flat">Fixed amount (₹)</option>
              </select>
            </SettingsField>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <SettingsField
              label={form.type === 'flat' ? 'Amount (₹) *' : 'Percent *'}
              htmlFor="coupon-value"
              error={fieldErrors.value}
              hint={form.type === 'percent' ? '1–100' : 'Discount in rupees'}
            >
              <input
                id="coupon-value"
                className={INPUT_CLASS}
                type="number"
                min="0"
                step={form.type === 'percent' ? '1' : '0.01'}
                max={form.type === 'percent' ? '100' : undefined}
                value={form.value}
                onChange={(e) => setField('value', e.target.value)}
                required
              />
            </SettingsField>

            <SettingsField
              label="Min order (₹)"
              htmlFor="coupon-min-order"
              error={fieldErrors.minOrder}
              hint="0 = no minimum"
            >
              <input
                id="coupon-min-order"
                className={INPUT_CLASS}
                type="number"
                min="0"
                step="1"
                value={form.minOrder}
                onChange={(e) => setField('minOrder', e.target.value)}
              />
            </SettingsField>

            <SettingsField
              label="Max uses"
              htmlFor="coupon-max-uses"
              error={fieldErrors.maxUses}
              hint="0 = unlimited"
            >
              <input
                id="coupon-max-uses"
                className={INPUT_CLASS}
                type="number"
                min="0"
                step="1"
                value={form.maxUses}
                onChange={(e) => setField('maxUses', e.target.value)}
              />
            </SettingsField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsField
              label="Expires on"
              htmlFor="coupon-expires"
              error={fieldErrors.expiresAt}
              hint="Leave blank for no expiry"
            >
              <input
                id="coupon-expires"
                className={INPUT_CLASS}
                type="date"
                min={form.active ? todayIsoDate() : undefined}
                value={form.expiresAt}
                onChange={(e) => setField('expiresAt', e.target.value)}
              />
            </SettingsField>

            <div className="flex items-end">
              <label
                className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition ${
                  form.active
                    ? 'border-emerald-200 bg-emerald-50/60 text-ink'
                    : 'border-[#efe2d1] bg-[#faf7f2] text-muted'
                }`}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[#7a2c3a]"
                  checked={form.active}
                  onChange={(e) => setField('active', e.target.checked)}
                />
                <span>
                  <span className="block font-medium text-ink">Active</span>
                  <span className="block text-xs text-muted">
                    Inactive codes cannot be applied at checkout
                  </span>
                </span>
              </label>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#7a2c3a] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#6a2430] disabled:opacity-60"
            >
              {saving ? 'Saving…' : editId ? 'Save changes' : 'Create coupon'}
            </button>
            {editId ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-[#d8c4a7] px-4 py-2 text-sm hover:bg-[#faf7f2]"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </div>
      </form>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="admin-section-title text-base">All coupons</h2>
            <p className="text-xs text-muted">
              {filteredRows.length === rows.length
                ? `${rows.length} coupon${rows.length === 1 ? '' : 's'}`
                : `Showing ${filteredRows.length} of ${rows.length}`}
            </p>
          </div>
          <div className="flex w-full flex-wrap gap-3 sm:w-auto">
            <input
              type="search"
              className={`${INPUT_CLASS} w-full max-w-xs`}
              placeholder="Search by code…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search coupons"
            />
            <select
              className={`${INPUT_CLASS} w-full max-w-[11rem]`}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
              <option value="exhausted">Limit reached</option>
            </select>
          </div>
        </div>

        <AdminDataTable
          columns={tableColumns}
          loading={loading}
          emptyMessage={
            search || statusFilter !== 'all'
              ? 'No coupons match your search or filters.'
              : 'No coupons yet. Create your first code above.'
          }
        >
          {filteredRows.map((row) => {
            const status = couponStatus(row)
            const busy = togglingId === row.id
            return (
              <tr
                key={row.id}
                className={`border-b border-[#f0e6d6] last:border-0 transition-colors hover:bg-[#faf7f2] ${
                  editId === row.id ? 'bg-[#fff7f8]' : ''
                }`}
              >
                <td className="px-4 py-3">
                  <p className="font-mono text-sm font-semibold tracking-wide text-ink">{row.code}</p>
                </td>
                <td className="px-4 py-3 text-sm text-ink">{discountLabel(row)}</td>
                <td className="px-4 py-3 text-sm tabular-nums text-muted">
                  {Number(row.minOrder) > 0 ? formatInr(row.minOrder) : '—'}
                </td>
                <td className="px-4 py-3 text-sm tabular-nums text-muted">{usageLabel(row)}</td>
                <td className="px-4 py-3 text-sm text-muted">{expiryLabel(row)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(row)}
                      className="text-xs text-[#7a2c3a] hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => toggleActive(row)}
                      className="text-xs text-muted hover:text-ink disabled:opacity-50"
                    >
                      {busy ? '…' : row.active === false ? 'Enable' : 'Disable'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(row)}
                      className="text-xs text-red-700 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </AdminDataTable>
      </section>

      <AdminConfirmDialog
        open={!!deleteTarget}
        title="Delete coupon"
        message={`Delete code "${deleteTarget?.code}"? This cannot be undone. Orders that already used it keep their discount history.`}
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => (deleting ? null : setDeleteTarget(null))}
      />
    </div>
  )
}

export default AdminCoupons
