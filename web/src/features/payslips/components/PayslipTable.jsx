import DataTable from '../../../shared/components/ui/DataTable.jsx'
import Panel from '../../../shared/components/ui/Panel.jsx'

const currency = (v) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(v ?? 0)

/** HR variant — shows employeeNumber, employeeName, position, gross, deductions, net */
export function HrPayslipTable({ payslips, title, subtitle }) {
  return (
    <Panel title={title ?? 'Payslips'} subtitle={subtitle}>
      <DataTable
        columns={[
          { key: 'employeeNumber', header: 'Employee ID' },
          { key: 'employeeName', header: 'Name' },
          { key: 'position', header: 'Position' },
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
        ]}
        rows={payslips}
      />
      {payslips.length === 0 && (
        <p style={{ opacity: 0.5, textAlign: 'center', padding: 24 }}>
          No payslips issued yet.
        </p>
      )}
    </Panel>
  )
}

/** Employee variant — shows periodLabel, gross, deductions, net */
export function EmployeePayslipTable({ payslips }) {
  return (
    <Panel title="My Payslips" subtitle="All your issued payslips">
      <DataTable
        columns={[
          { key: 'periodLabel', header: 'Pay Period' },
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
        ]}
        rows={payslips}
      />
      {payslips.length === 0 && (
        <p style={{ opacity: 0.5, textAlign: 'center', padding: 24 }}>
          No payslips yet.
        </p>
      )}
    </Panel>
  )
}
