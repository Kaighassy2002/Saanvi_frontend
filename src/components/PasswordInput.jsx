import React, { useState } from 'react'

/**
 * Password field with show/hide toggle (Font Awesome eye icons).
 */
export default function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  required,
  minLength,
  placeholder,
  className = 'royal-input',
  name,
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={visible ? 'text' : 'password'}
        className={`${className} pr-10`}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted hover:text-ink transition"
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        <i className={`fa-solid ${visible ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden />
      </button>
    </div>
  )
}
