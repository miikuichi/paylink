import './Badge.css'

/** tone: 'success' | 'warning' | 'error' | 'info' | 'gold' | 'neutral' */
const Badge = ({ children, tone = 'neutral', dot = false }) => {
  return (
    <span className={`badge badge--${tone}`}>
      {dot && <span className="badge__dot" />}
      {children}
    </span>
  )
}

export default Badge
