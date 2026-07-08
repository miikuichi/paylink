import './StatCard.css'

/** tone: 'maroon' | 'gold' | 'neutral' */
const StatCard = ({ label, value, icon, tone = 'maroon', trend }) => {
  return (
    <div className={`stat-card stat-card--${tone}`}>
      <div className="stat-card__icon">{icon}</div>
      <div className="stat-card__body">
        <p className="stat-card__label">{label}</p>
        <p className="stat-card__value">{value}</p>
        {trend && <p className="stat-card__trend">{trend}</p>}
      </div>
    </div>
  )
}

export default StatCard
