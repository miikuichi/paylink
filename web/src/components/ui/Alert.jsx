import './Alert.css'

/** tone: 'error' | 'success' | 'info' | 'warning' */
const ICONS = {
  error: '⚠',
  success: '✓',
  info: 'ℹ',
  warning: '!',
}

const Alert = ({ tone = 'info', children }) => {
  return (
    <div className={`alert alert--${tone}`} role="alert">
      <span className="alert__icon">{ICONS[tone]}</span>
      <span className="alert__text">{children}</span>
    </div>
  )
}

export default Alert
