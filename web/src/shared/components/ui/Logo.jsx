import './Logo.css'

const Logo = ({ size = 44, showWordmark = true, light = false }) => {
  return (
    <div className="logo">
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="logo__mark"
      >
        <defs>
          <linearGradient id="logoGradMaroon" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#841B2B" />
            <stop offset="1" stopColor="#4E0F1E" />
          </linearGradient>
          <linearGradient id="logoGradGold" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#E4C567" />
            <stop offset="1" stopColor="#B8862F" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="46" height="46" rx="14" fill="url(#logoGradMaroon)" />
        <rect x="1" y="1" width="46" height="46" rx="14" stroke="url(#logoGradGold)" strokeWidth="1.5" />
        <path
          d="M15 33V16.6c0-.9.7-1.6 1.6-1.6h6.7c4 0 7 2.7 7 6.7s-3 6.7-7 6.7h-3.8V33"
          stroke="url(#logoGradGold)"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="23" cy="21.7" r="2.2" fill="url(#logoGradGold)" />
      </svg>
      {showWordmark && (
        <span className={`logo__wordmark ${light ? 'logo__wordmark--light' : ''}`}>
          Pay<span className="logo__wordmark-accent">Link</span>
        </span>
      )}
    </div>
  )
}

export default Logo
