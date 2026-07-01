import { useState } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import StatCard from '../../components/ui/StatCard.jsx'
import Panel from '../../components/ui/Panel.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Button from '../../components/ui/Button.jsx'
import { useAuth } from '../../auth/AuthContext.jsx'
import { MY_LATEST_PAYSLIP, MY_PAYROLL_HISTORY, currency } from '../../data/mockPayroll.js'
import './Dashboard.css'

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}
function WalletIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3.5" y="6.5" width="17" height="12" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 10.5h17" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16.5" cy="14" r="1.2" fill="currentColor" />
    </svg>
  )
}
function DocIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5A1.5 1.5 0 0 1 7 3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 3.5V8h4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 12h6M9 15.5h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}
function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="5.5" width="16" height="14.5" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 9.5h16M8 3.5v3M16 3.5v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 4v11m0 0 4-4m-4 4-4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 19.5h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

const NAV_ITEMS = [
  { key: 'overview', label: 'Overview', icon: <GridIcon /> },
  { key: 'payslips', label: 'My Payslips', icon: <DocIcon /> },
  { key: 'history', label: 'Payroll History', icon: <WalletIcon /> },
]

const statusTone = (status) => (status === 'PROCESSED' ? 'success' : status === 'DRAFT' ? 'warning' : 'neutral')

const EmployeeDashboard = () => {
  const { user } = useAuth()
  const [activeKey, setActiveKey] = useState('overview')

  const latestNetPay = MY_PAYROLL_HISTORY[0]?.netPay ?? 0
  const ytdNetPay = MY_PAYROLL_HISTORY.reduce((sum, r) => sum + r.netPay, 0)

  return (
    <DashboardLayout
      navItems={NAV_ITEMS}
      activeKey={activeKey}
      onNavigate={setActiveKey}
      pageTitle={`Welcome back, ${user?.firstName ?? 'there'}`}
      pageSubtitle={user?.position}
      headerActions={
        <Button variant="gold" size="sm" icon={<DownloadIcon />}>
          Download Payslip
        </Button>
      }
    >
      <div className="dash-grid dash-grid--stats">
        <StatCard label="Latest Net Pay" value={currency(latestNetPay)} tone="gold" icon={<WalletIcon />} trend={MY_PAYROLL_HISTORY[0]?.period} />
        <StatCard label="Payslips Available" value={MY_PAYROLL_HISTORY.length} tone="maroon" icon={<DocIcon />} />
        <StatCard label="Net Pay (Last 4 Periods)" value={currency(ytdNetPay)} tone="neutral" icon={<CalendarIcon />} />
        <StatCard label="Employment Status" value="Active" tone="maroon" icon={<GridIcon />} />
      </div>

      <div className="dash-grid dash-grid--split">
        <Panel
          title="Latest Payslip"
          subtitle={`${MY_LATEST_PAYSLIP.period} · Issued ${MY_LATEST_PAYSLIP.issuedAt}`}
          actions={
            <Button variant="ghost" size="sm" icon={<DownloadIcon />}>
              Download
            </Button>
          }
        >
          <div className="payslip">
            <div className="payslip__col">
              <p className="payslip__col-title">Earnings</p>
              <ul className="payslip__list">
                {MY_LATEST_PAYSLIP.earnings.map((item) => (
                  <li key={item.label}>
                    <span>{item.label}</span>
                    <span>{currency(item.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="payslip__col">
              <p className="payslip__col-title">Deductions</p>
              <ul className="payslip__list">
                {MY_LATEST_PAYSLIP.deductions.map((item) => (
                  <li key={item.label}>
                    <span>{item.label}</span>
                    <span>-{currency(item.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="payslip__summary">
            <div>
              <p className="payslip__summary-label">Gross Pay</p>
              <p className="payslip__summary-value">{currency(MY_LATEST_PAYSLIP.grossPay)}</p>
            </div>
            <div>
              <p className="payslip__summary-label">Total Deductions</p>
              <p className="payslip__summary-value payslip__summary-value--neg">
                -{currency(MY_LATEST_PAYSLIP.totalDeductions)}
              </p>
            </div>
            <div className="payslip__summary-net">
              <p className="payslip__summary-label">Net Pay</p>
              <p className="payslip__summary-value payslip__summary-value--net">{currency(MY_LATEST_PAYSLIP.netPay)}</p>
            </div>
          </div>
        </Panel>

        <Panel title="Quick Info" subtitle="Your employment details">
          <ul className="info-list">
            <li>
              <span className="info-list__label">Employee ID</span>
              <span className="info-list__value">{user?.employeeNumber}</span>
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

      <Panel title="Payroll History" subtitle="Your last few pay periods">
        <DataTable
          columns={[
            { key: 'period', header: 'Pay Period' },
            { key: 'grossPay', header: 'Gross Pay', align: 'right', render: (r) => currency(r.grossPay) },
            { key: 'deductions', header: 'Deductions', align: 'right', render: (r) => currency(r.deductions) },
            { key: 'netPay', header: 'Net Pay', align: 'right', render: (r) => <strong>{currency(r.netPay)}</strong> },
            {
              key: 'status',
              header: 'Status',
              align: 'center',
              render: (r) => <Badge tone={statusTone(r.status)} dot>{r.status === 'PROCESSED' ? 'Processed' : 'Draft'}</Badge>,
            },
          ]}
          rows={MY_PAYROLL_HISTORY}
        />
      </Panel>
    </DashboardLayout>
  )
}

export default EmployeeDashboard
