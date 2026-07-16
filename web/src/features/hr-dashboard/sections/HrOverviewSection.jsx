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

const toDateKey = (value) => {
  if (!value) return ''
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const EVENT_META = {
  HOLIDAY: { label: 'Holiday', tone: 'error' },
  PAY_PERIOD: { label: 'Pay Period', tone: 'success' },
  PAYROLL: { label: 'Payroll', tone: 'gold' },
  PAYSLIP: { label: 'Payslip', tone: 'info' },
}

const buildOverviewEvents = ({ holidays, payPeriods, payrolls, payslips }) => {
  const events = []

  for (const holiday of holidays ?? []) {
    if (!holiday?.isActive) continue
    events.push({
      id: `holiday-${holiday.id}`,
      type: 'HOLIDAY',
      title: holiday.name,
      dateKey: toDateKey(holiday.holidayDate),
      meta: holiday.holidayType,
    })
  }

  for (const period of payPeriods ?? []) {
    events.push({
      id: `pay-period-start-${period.id}`,
      type: 'PAY_PERIOD',
      title: 'Pay Period Start',
      dateKey: toDateKey(period.startDate),
      meta: period.label,
    })
    events.push({
      id: `pay-period-end-${period.id}`,
      type: 'PAY_PERIOD',
      title: 'Pay Period End',
      dateKey: toDateKey(period.endDate),
      meta: period.label,
    })
  }

  for (const payroll of payrolls ?? []) {
    if (!payroll.processedAt) continue
    events.push({
      id: `payroll-${payroll.id}`,
      type: 'PAYROLL',
      title: `Payroll: ${payroll.employeeName}`,
      dateKey: toDateKey(payroll.processedAt),
      meta: payroll.payPeriodLabel,
    })
  }

  for (const payslip of payslips ?? []) {
    if (!payslip.issuedAt) continue
    events.push({
      id: `payslip-${payslip.id}`,
      type: 'PAYSLIP',
      title: `Payslip: ${payslip.employeeName}`,
      dateKey: toDateKey(payslip.issuedAt),
      meta: payslip.periodLabel,
    })
  }

  return events.filter((event) => event.dateKey)
}

/**
 * HR Overview section — displays stats, payroll summary, and employee directory.
 *
 * @param {object}   props
 * @param {boolean}  props.loading
 * @param {Array}    props.employees
 * @param {Array}    props.payrolls
 * @param {Array}    props.payPeriods
 * @param {Array}    props.holidays
 * @param {Array}    props.payslips
 * @param {string}   props.selectedPeriodId
 * @param {Function} props.onAddEmployee
 */
export function HrOverviewSection({
  loading,
  employees,
  payrolls,
  payPeriods,
  holidays,
  payslips,
  selectedPeriodId,
  onAddEmployee,
}) {
  const currentPeriod = payPeriods.find((p) => p.id === selectedPeriodId)
  const activeEmployees = employees.filter((e) => e.status === 'ACTIVE').length
  const totalNetPay = payrolls.reduce((sum, r) => sum + (r.netPay ?? 0), 0)
  const processedCount = payrolls.filter((r) => r.status === 'PROCESSED').length
  const todayKey = toDateKey(new Date())

  const overviewEvents = buildOverviewEvents({
    holidays,
    payPeriods,
    payrolls,
    payslips,
  })

  const eventsToday = overviewEvents
    .filter((event) => event.dateKey === todayKey)
    .sort((a, b) => a.title.localeCompare(b.title))

  const upcomingEvents = overviewEvents
    .filter((event) => event.dateKey > todayKey)
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey) || a.title.localeCompare(b.title))
    .slice(0, 8)

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
          title="Events and Holidays"
          subtitle="Today and upcoming timeline items"
        >
          <div className="overview-events-layout">
            <div className="overview-events-block">
              <h4 style={{ margin: '0 0 8px', fontSize: '0.86rem' }}>Today</h4>
              {eventsToday.length === 0 ? (
                <p style={{ opacity: 0.65, margin: 0 }}>No events or holidays today.</p>
              ) : (
                <ul className="overview-events-list overview-events-list--today">
                  {eventsToday.map((event) => (
                    <li key={event.id} className="overview-events-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <strong style={{ fontSize: '0.82rem' }}>{event.title}</strong>
                        <Badge tone={EVENT_META[event.type].tone}>{EVENT_META[event.type].label}</Badge>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--ink-500)' }}>{event.meta}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="overview-events-block">
              <h4 style={{ margin: '0 0 8px', fontSize: '0.86rem' }}>Upcoming</h4>
              {upcomingEvents.length === 0 ? (
                <p style={{ opacity: 0.65, margin: 0 }}>No upcoming events found.</p>
              ) : (
                <ul className="overview-events-list overview-events-list--upcoming">
                  {upcomingEvents.map((event) => (
                    <li key={event.id} className="overview-events-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <strong style={{ fontSize: '0.82rem' }}>{event.title}</strong>
                        <Badge tone={EVENT_META[event.type].tone}>{EVENT_META[event.type].label}</Badge>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--ink-500)' }}>
                        {event.dateKey} · {event.meta}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          {overviewEvents.length === 0 && (
            <p style={{ opacity: 0.5, textAlign: 'center', padding: 24 }}>
              No event data found yet.
            </p>
          )}
        </Panel>
      </div>
    </>
  )
}
