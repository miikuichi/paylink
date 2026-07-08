import StatCard from '../../../shared/components/ui/StatCard.jsx'
import Panel from '../../../shared/components/ui/Panel.jsx'
import {
  GridIcon,
  WalletIcon,
  DocIcon,
  CalendarIcon,
} from '../../../shared/icons/index.jsx'
import { PayslipDetailCard } from '../../payslips/index.js'

const currency = (v) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(v ?? 0)

/**
 * Employee Overview section — stat cards, latest payslip, and quick info panel.
 *
 * @param {object}   props
 * @param {boolean}  props.loading
 * @param {Array}    props.payrolls
 * @param {Array}    props.payslips
 * @param {object}   props.user
 */
export function EmployeeOverviewSection({
  loading,
  payrolls,
  payslips,
  user,
}) {
  const latestPayslip = payslips[0] ?? null
  const latestNetPay = payrolls[0]?.netPay ?? 0
  const ytdNetPay = payrolls
    .slice(0, 4)
    .reduce((sum, r) => sum + (r.netPay ?? 0), 0)

  return (
    <>
      {!loading && payrolls.length === 0 && payslips.length === 0 && (
        <Panel
          title="No payroll data yet"
          subtitle="Your HR/admin team still needs to process your first payroll for the selected pay period."
        >
          <p style={{ opacity: 0.7, margin: 0 }}>
            Once payroll is processed, your latest net pay, payslip breakdown, and payroll history
            will appear here.
          </p>
        </Panel>
      )}

      <div className="dash-grid dash-grid--stats">
        <StatCard
          label="Latest Net Pay"
          value={currency(latestNetPay)}
          tone="gold"
          icon={<WalletIcon />}
          trend={payrolls[0]?.payPeriodLabel}
        />
        <StatCard
          label="Payslips Available"
          value={payslips.length}
          tone="maroon"
          icon={<DocIcon />}
        />
        <StatCard
          label="Net Pay (Last 4 Periods)"
          value={currency(ytdNetPay)}
          tone="neutral"
          icon={<CalendarIcon />}
        />
        <StatCard
          label="Employment Status"
          value={user?.employeeNumber ? 'Active' : '—'}
          tone="maroon"
          icon={<GridIcon />}
        />
      </div>

      <div className="dash-grid dash-grid--split">
        <PayslipDetailCard payslip={latestPayslip} />

        <Panel title="Quick Info" subtitle="Your employment details">
          <ul className="info-list">
            <li>
              <span className="info-list__label">Employee ID</span>
              <span className="info-list__value">
                {user?.employeeNumber}
              </span>
            </li>
            <li>
              <span className="info-list__label">Department</span>
              <span className="info-list__value">{user?.department}</span>
            </li>
            <li>
              <span className="info-list__label">Position</span>
              <span className="info-list__value">{user?.position}</span>
            </li>
            <li>
              <span className="info-list__label">Email</span>
              <span className="info-list__value">{user?.email}</span>
            </li>
          </ul>
        </Panel>
      </div>
    </>
  )
}
