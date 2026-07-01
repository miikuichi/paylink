import { useState } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import StatCard from '../../components/ui/StatCard.jsx'
import Panel from '../../components/ui/Panel.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Button from '../../components/ui/Button.jsx'
import { CURRENT_PAY_PERIOD, EMPLOYEES, PAYROLL_SUMMARY, currency } from '../../data/mockPayroll.js'
import './Dashboard.css'

const NAV_ITEMS = [
  { key: 'overview', label: 'Overview', icon: <GridIcon /> },
  { key: 'employees', label: 'Employees', icon: <PeopleIcon /> },
  { key: 'payroll', label: 'Payroll', icon: <WalletIcon /> },
  { key: 'payslips', label: 'Payslips', icon: <DocIcon /> },
]

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
function PeopleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 19c1-3 3-4.5 5.5-4.5s4.5 1.5 5.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="17" cy="8.5" r="2.3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M15.5 14.6c2 .2 3.5 1.6 4.3 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
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
function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

const statusTone = (status) => (status === 'PROCESSED' ? 'success' : status === 'DRAFT' ? 'warning' : 'neutral')

const HrDashboard = () => {
  const [activeKey, setActiveKey] = useState('overview')

  const totalNetPay = PAYROLL_SUMMARY.reduce((sum, r) => sum + r.netPay, 0)
  const activeEmployees = EMPLOYEES.filter((e) => e.status === 'ACTIVE').length
  const processedCount = PAYROLL_SUMMARY.filter((r) => r.status === 'PROCESSED').length

  return (
    <DashboardLayout
      navItems={NAV_ITEMS}
      activeKey={activeKey}
      onNavigate={setActiveKey}
      pageTitle="HR Overview"
      pageSubtitle={`Pay period: ${CURRENT_PAY_PERIOD.label}`}
      headerActions={
        <Button variant="gold" size="sm" icon={<PlusIcon />}>
          New Employee
        </Button>
      }
    >
      <div className="dash-grid dash-grid--stats">
        <StatCard
          label="Active Employees"
          value={activeEmployees}
          tone="maroon"
          icon={<PeopleIcon />}
          trend="+2 this month"
        />
        <StatCard
          label="Current Period Net Pay"
          value={currency(totalNetPay)}
          tone="gold"
          icon={<WalletIcon />}
          trend={`${CURRENT_PAY_PERIOD.label}`}
        />
        <StatCard
          label="Payrolls Processed"
          value={`${processedCount} / ${PAYROLL_SUMMARY.length}`}
          tone="neutral"
          icon={<DocIcon />}
        />
        <StatCard
          label="Pay Period Status"
          value={CURRENT_PAY_PERIOD.status === 'PROCESSED' ? 'Closed' : 'Open'}
          tone="maroon"
          icon={<GridIcon />}
        />
      </div>

      <div className="dash-grid dash-grid--split">
        <Panel
          title="Payroll Summary"
          subtitle={`Employee net pay for ${CURRENT_PAY_PERIOD.label}`}
          actions={
            <Button variant="ghost" size="sm">
              View all
            </Button>
          }
        >
          <DataTable
            columns={[
              { key: 'employee', header: 'Employee' },
              { key: 'employeeNumber', header: 'ID' },
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
            rows={PAYROLL_SUMMARY}
          />
        </Panel>

        <Panel title="Employee Directory" subtitle="Quick view of active roster">
          <ul className="employee-list">
            {EMPLOYEES.map((emp) => (
              <li key={emp.id} className="employee-list__item">
                <span className="employee-list__avatar">{emp.name.split(' ').map((n) => n[0]).join('')}</span>
                <div className="employee-list__info">
                  <p className="employee-list__name">{emp.name}</p>
                  <p className="employee-list__role">{emp.position} · {emp.department}</p>
                </div>
                <Badge tone={emp.status === 'ACTIVE' ? 'success' : 'neutral'}>{emp.status === 'ACTIVE' ? 'Active' : 'Inactive'}</Badge>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </DashboardLayout>
  )
}

export default HrDashboard
