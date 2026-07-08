import StatCard from '../../../shared/components/ui/StatCard.jsx'
import Panel from '../../../shared/components/ui/Panel.jsx'
import DataTable from '../../../shared/components/ui/DataTable.jsx'
import Badge from '../../../shared/components/ui/Badge.jsx'
import Button from '../../../shared/components/ui/Button.jsx'
import {
  GridIcon,
  PeopleIcon,
  WalletIcon,
  DocIcon,
  PlusIcon,
} from '../../../shared/icons/index.jsx'

const currency = (v) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(v ?? 0)

const statusTone = (status) =>
  status === 'PROCESSED'
    ? 'success'
    : status === 'DRAFT'
      ? 'warning'
      : 'neutral'

/**
 * HR Overview section — displays stats, payroll summary, and employee directory.
 *
 * @param {object}   props
 * @param {boolean}  props.loading
 * @param {Array}    props.employees
 * @param {Array}    props.payrolls
 * @param {Array}    props.payPeriods
 * @param {string}   props.selectedPeriodId
 * @param {Function} props.onAddEmployee
 */
export function HrOverviewSection({
  loading,
  employees,
  payrolls,
  payPeriods,
  selectedPeriodId,
  onAddEmployee,
}) {
  const currentPeriod = payPeriods.find((p) => p.id === selectedPeriodId)
  const activeEmployees = employees.filter((e) => e.status === 'ACTIVE').length
  const totalNetPay = payrolls.reduce((sum, r) => sum + (r.netPay ?? 0), 0)
  const processedCount = payrolls.filter((r) => r.status === 'PROCESSED').length

  return (
    <>
      {!loading && employees.length === 0 && (
        <Panel
          title="No employees yet"
          subtitle="Create your first employee account to start payroll operations."
          actions={
            <Button
              variant="gold"
              size="sm"
              icon={<PlusIcon />}
              onClick={onAddEmployee}
            >
              New Employee
            </Button>
          }
        >
          <p style={{ opacity: 0.7, margin: 0 }}>
            After adding employees, you can create a pay period, run payroll, and generate payslips
            from this dashboard.
          </p>
        </Panel>
      )}

      <div className="dash-grid dash-grid--stats">
        <StatCard
          label="Active Employees"
          value={activeEmployees}
          tone="maroon"
          icon={<PeopleIcon />}
        />
        <StatCard
          label="Current Period Net Pay"
          value={currency(totalNetPay)}
          tone="gold"
          icon={<WalletIcon />}
          trend={currentPeriod?.label ?? '—'}
        />
        <StatCard
          label="Payrolls Processed"
          value={`${processedCount} / ${payrolls.length}`}
          tone="neutral"
          icon={<DocIcon />}
        />
        <StatCard
          label="Pay Period Status"
          value={currentPeriod?.status ?? '—'}
          tone="maroon"
          icon={<GridIcon />}
        />
      </div>

      <div className="dash-grid dash-grid--split">
        <Panel
          title="Payroll Summary"
          subtitle={`Net pay for ${currentPeriod?.label ?? '—'}`}
        >
          <DataTable
            columns={[
              { key: 'employeeName', header: 'Employee' },
              { key: 'employeeNumber', header: 'ID' },
              {
                key: 'grossPay',
                header: 'Gross Pay',
                align: 'right',
                render: (r) => currency(r.grossPay),
              },
              {
                key: 'totalDeductions',
                header: 'Deductions',
                align: 'right',
                render: (r) => currency(r.totalDeductions),
              },
              {
                key: 'netPay',
                header: 'Net Pay',
                align: 'right',
                render: (r) => <strong>{currency(r.netPay)}</strong>,
              },
              {
                key: 'status',
                header: 'Status',
                align: 'center',
                render: (r) => (
                  <Badge tone={statusTone(r.status)} dot>
                    {r.status}
                  </Badge>
                ),
              },
            ]}
            rows={payrolls}
          />
          {payrolls.length === 0 && (
            <p style={{ opacity: 0.5, textAlign: 'center', padding: 24 }}>
              No payroll records for this period yet.
            </p>
          )}
        </Panel>

        <Panel
          title="Employee Directory"
          subtitle="Quick view of active roster"
        >
          <ul className="employee-list">
            {employees.map((emp) => (
              <li key={emp.id} className="employee-list__item">
                <span className="employee-list__avatar">
                  {(emp.firstName?.[0] ?? '') + (emp.lastName?.[0] ?? '')}
                </span>
                <div className="employee-list__info">
                  <p className="employee-list__name">
                    {emp.firstName} {emp.lastName}
                  </p>
                  <p className="employee-list__role">
                    {emp.position} · {emp.department}
                  </p>
                </div>
                <Badge
                  tone={emp.status === 'ACTIVE' ? 'success' : 'neutral'}
                >
                  {emp.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                </Badge>
              </li>
            ))}
          </ul>
          {employees.length === 0 && (
            <p style={{ opacity: 0.5, textAlign: 'center', padding: 24 }}>
              No employees found.
            </p>
          )}
        </Panel>
      </div>
    </>
  )
}
