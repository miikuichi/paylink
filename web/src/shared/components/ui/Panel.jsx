import './Panel.css'

const Panel = ({ title, subtitle, actions, children, className = '' }) => {
  return (
    <section className={`panel ${className}`}>
      {(title || actions) && (
        <header className="panel__header">
          <div>
            {title && <h3 className="panel__title">{title}</h3>}
            {subtitle && <p className="panel__subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="panel__actions">{actions}</div>}
        </header>
      )}
      <div className="panel__body">{children}</div>
    </section>
  )
}

export default Panel
