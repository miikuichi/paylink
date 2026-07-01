import { useId, useState } from 'react'
import './TextField.css'

const EyeIcon = ({ off }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {off ? (
      <path
        d="M3 3l18 18M10.6 10.7a2.5 2.5 0 0 0 3.5 3.5M6.6 6.8C4.5 8.2 3 10 3 12c0 0 3 6 9 6 1.6 0 3-.4 4.2-1M9.9 4.2A9.7 9.7 0 0 1 12 4c6 0 9 6 9 6 0 0-.6 1.2-1.7 2.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ) : (
      <>
        <path
          d="M3 12c0 0 3-6 9-6s9 6 9 6-3 6-9 6-9-6-9-6Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.7" />
      </>
    )}
  </svg>
)

const TextField = ({
  label,
  type = 'text',
  error,
  hint,
  icon,
  value,
  onChange,
  placeholder,
  required = false,
  autoComplete,
  name,
  disabled = false,
}) => {
  const id = useId()
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const resolvedType = isPassword && showPassword ? 'text' : type

  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      {label && (
        <label htmlFor={id} className="field__label">
          {label} {required && <span className="field__required">*</span>}
        </label>
      )}
      <div className="field__control">
        {icon && <span className="field__icon">{icon}</span>}
        <input
          id={id}
          name={name}
          type={resolvedType}
          className="field__input"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          style={{ paddingLeft: icon ? 42 : undefined, paddingRight: isPassword ? 42 : undefined }}
        />
        {isPassword && (
          <button
            type="button"
            className="field__toggle"
            onClick={() => setShowPassword((s) => !s)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <EyeIcon off={showPassword} />
          </button>
        )}
      </div>
      {error ? (
        <span className="field__message field__message--error">{error}</span>
      ) : hint ? (
        <span className="field__message">{hint}</span>
      ) : null}
    </div>
  )
}

export default TextField
