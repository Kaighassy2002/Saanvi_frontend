import React from 'react'
import { Link } from 'react-router-dom'
import SharedPasswordInput from '../../components/PasswordInput'

export function SettingsSection({ title, description, children, action }) {
  return (
    <section className="rounded-xl border border-[#e8d5c0] bg-white overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#f0e6d6] px-5 py-4 bg-[#faf7f2]">
        <div>
          <h3 className="admin-section-title text-base">{title}</h3>
          {description ? <p className="text-xs text-muted mt-0.5 max-w-xl">{description}</p> : null}
        </div>
        {action || null}
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </section>
  )
}

export function SettingsField({ label, hint, error, children, htmlFor }) {
  return (
    <label className="block" htmlFor={htmlFor}>
      <span className="block text-xs font-medium text-ink mb-1">{label}</span>
      {children}
      {error ? <p className="text-xs text-red-700 mt-1">{error}</p> : null}
      {hint && !error ? <p className="text-xs text-muted mt-1">{hint}</p> : null}
    </label>
  )
}

export function IntegrationCard({ name, configured, icon = 'fa-solid fa-plug' }) {
  return (
    <article
      className={`admin-integration-card ${
        configured ? 'admin-integration-card--connected' : 'admin-integration-card--idle'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`admin-integration-card__icon ${
            configured ? 'admin-integration-card__icon--on' : 'admin-integration-card__icon--off'
          }`}
          aria-hidden
        >
          <i className={icon} />
        </div>
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{name}</p>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
            configured ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200/80 text-stone-600'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${configured ? 'bg-emerald-500' : 'bg-stone-400'}`}
          />
          {configured ? 'Connected' : 'Disconnected'}
        </span>
      </div>
    </article>
  )
}

export function MerchandisingHint() {
  return (
    <p className="text-xs text-muted rounded-lg bg-[#faf7f2] border border-[#efe2d1] px-3 py-2">
      Homepage hero, featured products, and category tiles are managed in{' '}
      <Link to="/admin/merchandising" className="text-[#7a2c3a] font-medium hover:underline">
        Merchandising
      </Link>
      .
    </p>
  )
}

export const INPUT_CLASS =
  'w-full rounded-lg border border-[#e8d5c0] bg-white px-3 py-2 text-sm focus:border-[#9f7a2c] focus:outline-none focus:ring-1 focus:ring-[#9f7a2c]/30'

export const SELECT_CLASS = INPUT_CLASS

/** Admin settings password field — defaults to INPUT_CLASS styling. */
export function PasswordInput(props) {
  return <SharedPasswordInput className={INPUT_CLASS} {...props} />
}
