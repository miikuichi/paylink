import DataTable from '../../../shared/components/ui/DataTable.jsx'
import Panel from '../../../shared/components/ui/Panel.jsx'
import Badge from '../../../shared/components/ui/Badge.jsx'

const currency = (v) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(v ?? 0)

const statusTone = (status) =>
  status === 'PROCESSED'
    ? 'success'
    : status === 'DRAFT'
      ? 'warning'
      : 'neutral'

/**
 * Employee Payroll History section — displays payroll records table.
 *
 * @param {object} props
 * @param {Array}  props.payrolls
 */
export function EmployeePayrollHistorySection({ payrolls }) {
  return (
    <Panel title="Payroll History" subtitle="Your last pay periods">
      <DataTable
        columns={[
          { key: 'payPeriodLabel', header: 'Pay Period' },
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
              <Badge
                tone={statusTone(r.status)}
                dot
              >
                {r.status}
              </Badge>
            ),
          },
        ]}
        rows={payrolls}
      />
    </Panel>
  )
}
