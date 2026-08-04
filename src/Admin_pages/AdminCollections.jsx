import React, { useCallback, useEffect, useState } from 'react'
import { useAdminAuth } from '../context/AdminAuthProvider'
import {
  createCatalogCollection,
  deleteCatalogCollection,
  getCollectionAnalytics,
  listCatalogCollections,
  listProductsAll,
  updateCatalogCollection,
} from './services/adminApi'
import { useAdminToast } from './shared/AdminToastProvider'
import AdminPageHeader from './components/AdminPageHeader'
import AdminErrorBanner from './components/AdminErrorBanner'
import AdminConfirmDialog from './components/AdminConfirmDialog'
import CollectionsEditor from './components/CollectionsEditor'
import { INPUT_CLASS } from './components/AdminSettingsUi'

function AdminCollections() {
  const { authFetch } = useAdminAuth()
  const { toast } = useAdminToast()
  const [rows, setRows] = useState([])
  const [products, setProducts] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const load = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const [collections, allProducts, stats] = await Promise.all([
        listCatalogCollections(authFetch),
        listProductsAll(authFetch),
        getCollectionAnalytics(authFetch).catch(() => null),
      ])
      setRows(collections)
      setProducts(allProducts.filter((p) => p.published !== false))
      setAnalytics(stats)
    } catch (e) {
      setError(e?.message || 'Failed to load collections')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [authFetch])

  useEffect(() => {
    load()
  }, [load])

  const handleCreate = async (body) => {
    setSaving(true)
    try {
      await createCatalogCollection(authFetch, body)
      toast(body.published ? 'Collection published.' : 'Draft collection saved.')
      await load()
    } catch (err) {
      toast(err?.message || 'Save failed', 'error')
      throw err
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (id, body) => {
    setSaving(true)
    try {
      await updateCatalogCollection(authFetch, id, body)
      toast('Collection updated.')
      await load()
    } catch (err) {
      toast(err?.message || 'Save failed', 'error')
      throw err
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteCatalogCollection(authFetch, deleteTarget.id)
      setDeleteTarget(null)
      toast('Collection deleted.')
      await load()
    } catch (e) {
      toast(e?.message || 'Delete failed', 'error')
    }
  }

  const totals = analytics?.totals

  return (
    <div className="max-w-4xl pb-16">
      <AdminPageHeader
        title="Collections"
        description="Publish curated edits — they appear automatically on the homepage Featured Collections section."
      />

      <AdminErrorBanner message={error} onRetry={load} />

      {!loading ? (
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="rounded-lg border border-[#e8d5c0] bg-white px-4 py-2 text-sm">
            <span className="text-muted">Total</span>{' '}
            <span className="font-medium text-ink">{totals?.collections ?? rows.length}</span>
          </div>
          <div className="rounded-lg border border-[#e8d5c0] bg-white px-4 py-2 text-sm">
            <span className="text-muted">Live</span>{' '}
            <span className="font-medium text-ink">
              {totals?.live ?? rows.filter((r) => r.status === 'live').length}
            </span>
          </div>
          <div className="rounded-lg border border-[#e8d5c0] bg-white px-4 py-2 text-sm">
            <span className="text-muted">Drafts</span>{' '}
            <span className="font-medium text-ink">
              {totals?.draft ?? rows.filter((r) => r.status === 'draft').length}
            </span>
          </div>
          <div className="rounded-lg border border-[#e8d5c0] bg-white px-4 py-2 text-sm">
            <span className="text-muted">On homepage</span>{' '}
            <span className="font-medium text-ink">
              {totals?.homepage ?? rows.filter((r) => r.status === 'live').length}
            </span>
          </div>
          <div className="rounded-lg border border-[#e8d5c0] bg-white px-4 py-2 text-sm">
            <span className="text-muted">Views</span>{' '}
            <span className="font-medium text-ink">{totals?.views ?? 0}</span>
          </div>
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="search"
          className={`${INPUT_CLASS} w-full max-w-xs`}
          placeholder="Search collections…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search collections"
        />
        <select
          className={`${INPUT_CLASS} w-full max-w-[11rem]`}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="live">Live</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="ended">Ended</option>
        </select>
      </div>

      {loading ? (
        <p className="text-muted text-sm">Loading…</p>
      ) : (
        <CollectionsEditor
          collections={rows}
          products={products}
          authFetch={authFetch}
          saving={saving}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onDelete={setDeleteTarget}
          search={search}
          statusFilter={statusFilter}
        />
      )}

      <AdminConfirmDialog
        open={!!deleteTarget}
        title="Delete collection"
        message={`Delete "${deleteTarget?.name}"? Products stay in the catalog. This removes the curated page.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default AdminCollections
