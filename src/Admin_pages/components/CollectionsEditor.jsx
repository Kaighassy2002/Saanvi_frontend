import React, { useMemo, useState } from 'react'
import { productImageUrl } from '../../utils/cloudinaryImage'
import AdminSingleImageUpload from './AdminSingleImageUpload'
import { INPUT_CLASS, SettingsField } from './AdminSettingsUi'

export const emptyCollectionForm = () => ({
  name: '',
  slug: '',
  description: '',
  heroImage: '',
  productIds: [],
  published: true,
  sortOrder: '0',
  startsAt: '',
  endsAt: '',
  metaTitle: '',
  metaDescription: '',
})

function slugifyPreview(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

function toDateInput(value) {
  if (!value) return ''
  try {
    return String(value).slice(0, 10)
  } catch {
    return ''
  }
}

export function rowToForm(row) {
  return {
    name: row.name || '',
    slug: row.slug || '',
    description: row.description || '',
    heroImage: row.heroImage || '',
    productIds: Array.isArray(row.productIds) ? row.productIds.map(String) : [],
    published: row.published !== false,
    sortOrder: String(row.sortOrder ?? 0),
    startsAt: toDateInput(row.startsAt),
    endsAt: toDateInput(row.endsAt),
    metaTitle: row.metaTitle || '',
    metaDescription: row.metaDescription || '',
  }
}

export function buildCollectionBody(form) {
  return {
    name: form.name.trim(),
    slug: form.slug.trim() || slugifyPreview(form.name),
    description: form.description.trim(),
    heroImage: form.heroImage.trim(),
    productIds: form.productIds,
    published: !!form.published,
    sortOrder: Number(form.sortOrder) || 0,
    startsAt: form.startsAt || null,
    endsAt: form.endsAt || null,
    metaTitle: form.metaTitle.trim(),
    metaDescription: form.metaDescription.trim(),
  }
}

function SelectedOrderList({ productsById, selectedIds, onReorder, onRemove }) {
  const [dragIndex, setDragIndex] = useState(null)

  const onDragStart = (index) => setDragIndex(index)
  const onDragOver = (e, index) => {
    e.preventDefault()
    if (dragIndex == null || dragIndex === index) return
    const next = [...selectedIds]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(index, 0, moved)
    setDragIndex(index)
    onReorder(next)
  }
  const onDragEnd = () => setDragIndex(null)

  if (!selectedIds.length) {
    return <p className="text-xs text-muted">Select products below, then drag to set display order.</p>
  }

  return (
    <ul className="space-y-2 mb-4">
      {selectedIds.map((id, index) => {
        const item = productsById.get(id)
        return (
          <li
            key={id}
            draggable
            onDragStart={() => onDragStart(index)}
            onDragOver={(e) => onDragOver(e, index)}
            onDragEnd={onDragEnd}
            className={`flex items-center gap-3 rounded-lg border px-3 py-2 bg-white cursor-grab active:cursor-grabbing ${
              dragIndex === index ? 'border-gold bg-[#fdf6ee]' : 'border-[#efe2d1]'
            }`}
          >
            <span className="text-[10px] text-muted w-5 tabular-nums">{index + 1}</span>
            {item?.image ? (
              <img
                src={productImageUrl(item.image, 'thumb')}
                alt=""
                className="h-10 w-10 rounded object-contain bg-[#f8f2e7]"
              />
            ) : (
              <div className="h-10 w-10 rounded bg-[#f4e8db]" />
            )}
            <p className="min-w-0 flex-1 truncate text-xs font-medium text-ink">{item?.name || id}</p>
            <button
              type="button"
              className="text-[11px] text-red-700 hover:underline"
              onClick={() => onRemove(id)}
            >
              Remove
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function ProductPicker({ items, selectedIds, onToggle }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 max-h-72 overflow-y-auto pr-1">
      {items.map((item) => {
        const selected = selectedIds.includes(item.id)
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onToggle(item.id)}
            className={`lux-card p-2 text-left transition border-2 ${
              selected ? 'border-gold bg-[#fdf6ee]' : 'border-transparent hover:border-[#e8d5c0]'
            }`}
          >
            {item.image ? (
              <img
                src={productImageUrl(item.image, 'thumb')}
                alt={item.name}
                className="mb-1.5 aspect-[4/5] w-full max-h-24 rounded-md bg-[#f8f2e7] object-contain"
              />
            ) : (
              <div className="mb-1.5 h-16 w-full rounded-md bg-[#f4e8db]" />
            )}
            <p className="text-[10px] font-medium leading-snug text-ink line-clamp-2 sm:text-xs">{item.name}</p>
          </button>
        )
      })}
    </div>
  )
}

function CollectionFormFields({
  form,
  setForm,
  authFetch,
  products,
  onSubmit,
  onCancel,
  saving,
  submitLabel,
  fieldErrors = {},
}) {
  const productsById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const toggleProduct = (id) => {
    setForm((prev) => {
      const ids = prev.productIds || []
      const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
      return { ...prev, productIds: next }
    })
  }

  const slugHint = form.slug.trim() || slugifyPreview(form.name) || 'auto-from-name'

  return (
    <form onSubmit={onSubmit} className="space-y-4 border-t border-[#f0e6d6] pt-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <SettingsField label="Collection name *" htmlFor="col-name" error={fieldErrors.name}>
          <input
            id="col-name"
            className={INPUT_CLASS}
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder="e.g. Onam Collection 2026"
            required
          />
        </SettingsField>
        <SettingsField
          label="URL slug *"
          htmlFor="col-slug"
          error={fieldErrors.slug}
          hint={`Storefront URL: /collections/${slugHint}`}
        >
          <input
            id="col-slug"
            className={`${INPUT_CLASS} font-mono text-xs`}
            value={form.slug}
            onChange={(e) => setField('slug', e.target.value.toLowerCase())}
            placeholder="onam-collection-2026"
          />
        </SettingsField>
      </div>

      <AdminSingleImageUpload
        imageUrl={form.heroImage}
        onChange={(url) => setField('heroImage', url)}
        authFetch={authFetch}
        purpose="hero"
        label="Hero / banner image"
        hint="Shown on the collection detail page and listing cards."
      />

      <SettingsField label="Description" htmlFor="col-desc">
        <textarea
          id="col-desc"
          className={INPUT_CLASS}
          rows={3}
          value={form.description}
          onChange={(e) => setField('description', e.target.value)}
          placeholder="Short story for this edit"
        />
      </SettingsField>

      <div className="grid gap-4 sm:grid-cols-3">
        <SettingsField label="Sort order" htmlFor="col-sort" hint="Lower = earlier on homepage">
          <input
            id="col-sort"
            className={INPUT_CLASS}
            type="number"
            value={form.sortOrder}
            onChange={(e) => setField('sortOrder', e.target.value)}
          />
        </SettingsField>
        <SettingsField label="Starts on" htmlFor="col-start" hint="Optional schedule">
          <input
            id="col-start"
            className={INPUT_CLASS}
            type="date"
            value={form.startsAt}
            onChange={(e) => setField('startsAt', e.target.value)}
          />
        </SettingsField>
        <SettingsField label="Ends on" htmlFor="col-end" error={fieldErrors.endsAt}>
          <input
            id="col-end"
            className={INPUT_CLASS}
            type="date"
            value={form.endsAt}
            onChange={(e) => setField('endsAt', e.target.value)}
          />
        </SettingsField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SettingsField label="SEO title" htmlFor="col-meta-title" hint="Max ~70 characters">
          <input
            id="col-meta-title"
            className={INPUT_CLASS}
            maxLength={70}
            value={form.metaTitle}
            onChange={(e) => setField('metaTitle', e.target.value)}
            placeholder="Defaults to collection name"
          />
        </SettingsField>
        <SettingsField label="SEO description" htmlFor="col-meta-desc" hint="Max ~160 characters">
          <input
            id="col-meta-desc"
            className={INPUT_CLASS}
            maxLength={160}
            value={form.metaDescription}
            onChange={(e) => setField('metaDescription', e.target.value)}
            placeholder="Defaults to description"
          />
        </SettingsField>
      </div>

      <label
        className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm ${
          form.published ? 'border-emerald-200 bg-emerald-50/60' : 'border-[#efe2d1] bg-[#faf7f2]'
        }`}
      >
        <input
          type="checkbox"
          className="h-4 w-4 accent-[#7a2c3a]"
          checked={form.published}
          onChange={(e) => setField('published', e.target.checked)}
        />
        <span>
          <span className="block font-medium text-ink">{form.published ? 'Published' : 'Draft'}</span>
          <span className="block text-xs text-muted">
            Published collections appear automatically in Homepage → Featured Collections
          </span>
        </span>
      </label>

      <div className="border-t border-[#f0e6d6] pt-3">
        <p className="text-xs font-medium text-ink mb-2">
          Products ({form.productIds.length}) — drag to reorder
        </p>
        {fieldErrors.productIds ? (
          <p className="text-xs text-red-700 mb-2">{fieldErrors.productIds}</p>
        ) : null}
        <SelectedOrderList
          productsById={productsById}
          selectedIds={form.productIds}
          onReorder={(next) => setField('productIds', next)}
          onRemove={(id) => toggleProduct(id)}
        />
        {products.length === 0 ? (
          <p className="text-sm text-muted">No published products available.</p>
        ) : (
          <ProductPicker items={products} selectedIds={form.productIds} onToggle={toggleProduct} />
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#7a2c3a] px-4 py-2 text-sm font-medium text-white hover:bg-[#6a2430] disabled:opacity-60"
        >
          {saving ? 'Saving…' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-[#d8c4a7] px-4 py-2 text-sm text-muted hover:bg-[#fdfaf6]"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

function statusPill(status) {
  const map = {
    live: 'bg-emerald-100 text-emerald-800',
    draft: 'bg-stone-200 text-stone-600',
    scheduled: 'bg-sky-100 text-sky-800',
    ended: 'bg-amber-100 text-amber-900',
  }
  return map[status] || map.draft
}

function CollectionsEditor({
  collections,
  products,
  authFetch,
  saving,
  onCreate,
  onUpdate,
  onDelete,
  search,
  statusFilter,
}) {
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyCollectionForm())
  const [fieldErrors, setFieldErrors] = useState({})

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return collections.filter((row) => {
      const status = row.status || (row.published === false ? 'draft' : 'live')
      if (statusFilter !== 'all' && status !== statusFilter) return false
      if (!q) return true
      return (
        String(row.name || '').toLowerCase().includes(q) ||
        String(row.slug || '').toLowerCase().includes(q) ||
        String(row.description || '').toLowerCase().includes(q)
      )
    })
  }, [collections, search, statusFilter])

  const closeEditor = () => {
    setEditingId(null)
    setForm(emptyCollectionForm())
    setFieldErrors({})
  }

  const startEdit = (row) => {
    setEditingId(row.id)
    setForm(rowToForm(row))
    setFieldErrors({})
  }

  const startNew = () => {
    setEditingId('new')
    setForm(emptyCollectionForm())
    setFieldErrors({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const body = buildCollectionBody(form)
    if (!body.name) {
      setFieldErrors({ name: 'Collection name is required' })
      return
    }
    try {
      if (editingId === 'new') await onCreate(body)
      else if (editingId) await onUpdate(editingId, body)
      closeEditor()
    } catch (err) {
      const apiErrors = err?.errors || err?.data?.errors
      if (Array.isArray(apiErrors) && apiErrors.length) {
        const mapped = {}
        for (const item of apiErrors) {
          if (item?.field) mapped[item.field] = item.message
        }
        setFieldErrors(mapped)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#e8d5c0] bg-[#faf7f2] px-4 py-3">
        <p className="text-xs text-muted">
          Publish a collection and it appears on the homepage Featured Collections section. Cards link
          to <span className="font-mono text-ink">/collections/your-slug</span>. Use sort order to
          control display order. Product catalog remains at{' '}
          <span className="font-mono text-ink">/shop</span>.
        </p>
      </div>

      {editingId === 'new' ? (
        <div className="lux-card p-4">
          <h3 className="admin-section-title mb-3 text-base">New collection</h3>
          <CollectionFormFields
            form={form}
            setForm={setForm}
            authFetch={authFetch}
            products={products}
            onSubmit={handleSubmit}
            onCancel={closeEditor}
            saving={saving}
            submitLabel="Create & publish"
            fieldErrors={fieldErrors}
          />
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <p className="text-sm text-muted">
          {collections.length === 0 ? 'No collections yet. Add one below.' : 'No collections match your filters.'}
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((row) => {
            const isEditing = editingId === row.id
            const productCount = row.productCount ?? (row.productIds?.length || 0)
            const status = row.status || (row.published === false ? 'draft' : 'live')
            return (
              <li key={row.id} className="lux-card overflow-hidden">
                <div className="flex gap-3 p-4">
                  {row.heroImage ? (
                    <img
                      src={productImageUrl(row.heroImage, 'hero')}
                      alt=""
                      className="h-16 w-24 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg bg-[#f4e8db] text-[10px] text-muted">
                      No image
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-ink">{row.name}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${statusPill(status)}`}>
                        {status}
                      </span>
                    </div>
                    <p className="text-xs text-muted truncate">/collections/{row.slug || '—'}</p>
                    <p className="mt-1 text-[11px] text-muted">
                      {productCount} product{productCount === 1 ? '' : 's'} · {Number(row.viewCount) || 0} views ·
                      sort {row.sortOrder ?? 0}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    {row.slug && status === 'live' ? (
                      <a
                        href={`/collections/${encodeURIComponent(row.slug)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-[#d8c4a7] px-2.5 py-1 text-center text-xs font-medium text-ink hover:bg-[#fdfaf6]"
                      >
                        View
                      </a>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => (isEditing ? closeEditor() : startEdit(row))}
                      className="rounded-lg border border-[#d8c4a7] px-2.5 py-1 text-xs font-medium text-ink hover:bg-[#fdfaf6]"
                    >
                      {isEditing ? 'Close' : 'Edit'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(row)}
                      className="rounded-lg border border-red-200 px-2.5 py-1 text-xs text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {isEditing ? (
                  <div className="border-t border-[#f0e6d6] px-4 pb-4">
                    <CollectionFormFields
                      form={form}
                      setForm={setForm}
                      authFetch={authFetch}
                      products={products}
                      onSubmit={handleSubmit}
                      onCancel={closeEditor}
                      saving={saving}
                      submitLabel="Save changes"
                      fieldErrors={fieldErrors}
                    />
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}

      {editingId !== 'new' ? (
        <button
          type="button"
          onClick={startNew}
          className="w-full rounded-lg border border-dashed border-[#d8c4a7] px-4 py-2.5 text-sm text-muted hover:border-gold hover:text-ink"
        >
          + Add collection
        </button>
      ) : null}
    </div>
  )
}

export default CollectionsEditor
