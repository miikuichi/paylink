import DataTable from '../../../shared/components/ui/DataTable.jsx'
import Badge from '../../../shared/components/ui/Badge.jsx'
import Button from '../../../shared/components/ui/Button.jsx'
import Panel from '../../../shared/components/ui/Panel.jsx'
import { GeneratePayslipAction } from '../../payslips/components/GeneratePayslipAction.jsx'

const currency = (v) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(v ?? 0)

const statusTone = (s) => (s === 'PROCESSED' ? 'success' : s === 'DRAFT' ? 'warning' : 'neutral')

export function PayrollTable({ employees, payrolls, processLoading, onProcess }) {
  return (
    <Panel
      title="Process Payroll"
      subtitle="Computes SSS, PhilHealth, Pag-IBIG and withholding tax automatically"
    >
      <DataTable
        columns={[
          { key: 'employeeNumber', header: 'ID' },
          { key: 'firstName', header: 'First Name' },
          { key: 'lastName', header: 'Last Name' },
          {
            key: 'basicRate',
            header: 'Basic Rate',
            align: 'right',
            render: (r) => currency(r.basicRate),
          },
          {
            key: 'payrollStatus',
            header: 'Action',
            align: 'center',
            render: (r) => {
              const existing = payrolls.find((p) => p.employeeId === r.id)
              if (existing)
                return (
                  <Badge tone={statusTone(existing.status)} dot>
                    {existing.status}
                  </Badge>
                )
              return (
                <Button
                  size="sm"
                  variant="ghost"
                  loading={processLoading}
                  onClick={() => onProcess(r.id)}
                >
                  Run
                </Button>
              )
            },
          },
        ]}
        rows={employees.filter((e) => e.status === 'ACTIVE')}
      />
      {employees.filter((e) => e.status === 'ACTIVE').length === 0 && (
        <p style={{ opacity: 0.5, textAlign: 'center', padding: 24 }}>
          No active employees available for payroll processing.
        </p>
      )}
    </Panel>
  )
}

export function PayrollResultsTable({ payrolls, onAfterGenerate }) {
  if (payrolls.length === 0) return null
  return (
    <Panel title="Payroll Results" subtitle="Computed for this period" style={{ marginTop: 16 }}>
      <DataTable
        columns={[
          { key: 'employeeName', header: 'Employee' },
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
            key: 'payslip',
            header: 'Payslip',
            align: 'center',
            render: (r) => (
              <GeneratePayslipAction
                payrollId={r.id}
                hasPayslip={r.hasPayslip}
                onSuccess={onAfterGenerate}
              />
            ),
          },
        ]}
        rows={payrolls}
      />
    </Panel>
  )
}
