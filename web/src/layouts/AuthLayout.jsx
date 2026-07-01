import Logo from '../components/ui/Logo.jsx'
import './AuthLayout.css'

const HIGHLIGHTS = [
  {
    title: 'Centralized records',
    desc: 'Employee, payroll, and payslip data unified in one secure system.',
  },
  {
    title: 'Accurate computations',
    desc: 'Gross pay, deductions, and net pay calculated consistently every period.',
  },
  {
    title: 'Access anywhere',
    desc: 'Web for HR administration, mobile for employees on the go.',
  },
]

const AuthLayout = ({ title, subtitle, children, footer }) => {
  return (
    <div className="auth-layout">
      <aside className="auth-layout__panel animate-in">
        <div className="auth-layout__panel-glow" aria-hidden="true" />
        <div className="auth-layout__panel-content">
          <Logo light size={48} />
          <h1 className="auth-layout__headline">
            Payroll, simplified.
            <br />
            Trust, built in.
          </h1>
          <p className="auth-layout__subhead">
            PayLink brings HR and employees together on one clean, reliable payroll platform.
          </p>

          <ul className="auth-layout__highlights">
            {HIGHLIGHTS.map((item) => (
              <li key={item.title} className="auth-layout__highlight">
                <span className="auth-layout__highlight-dot" />
                <div>
                  <p className="auth-layout__highlight-title">{item.title}</p>
                  <p className="auth-layout__highlight-desc">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="auth-layout__form-side">
        <div className="auth-layout__form-wrap animate-in">
          <div className="auth-layout__form-header">
            <div className="auth-layout__mobile-logo">
              <Logo size={38} />
            </div>
            <h2 className="auth-layout__title">{title}</h2>
            {subtitle && <p className="auth-layout__subtitle">{subtitle}</p>}
          </div>

          {children}

          {footer && <div className="auth-layout__footer">{footer}</div>}
        </div>
      </main>
    </div>
  )
}

export default AuthLayout
