import { useState } from 'react'
import DataTable from '../../../shared/components/ui/DataTable.jsx'
import Panel from '../../../shared/components/ui/Panel.jsx'
import Button from '../../../shared/components/ui/Button.jsx'
import '../../hr-dashboard/HrDashboard.css'

const currency = (v) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(v ?? 0)

const GOVERNMENT_DEDUCTION_LABELS = new Set([
  'SSS Contribution',
  'PhilHealth Contribution',
  'Pag-IBIG Contribution',
  'Withholding Tax',
])

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
  const [selectedPayslip, setSelectedPayslip] = useState(null)

  const governmentDeductions = selectedPayslip?.deductions?.filter((item) =>
    GOVERNMENT_DEDUCTION_LABELS.has(item.label)
  ) ?? []
  const otherDeductions = selectedPayslip?.deductions?.filter((item) =>
    !GOVERNMENT_DEDUCTION_LABELS.has(item.label)
  ) ?? []

  return (
    <>
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
              header: 'Total Deductions',
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
              key: 'details',
              header: 'Details',
              align: 'center',
              render: (r) => (
                <Button size="sm" variant="ghost" onClick={() => setSelectedPayslip(r)}>
                  Details
                </Button>
              ),
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

      {selectedPayslip && (
        <div className="modal-overlay" onClick={() => setSelectedPayslip(null)}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{ width: 720, maxWidth: '96vw', maxHeight: '86vh', overflowY: 'auto' }}
          >
            <h3 style={{ margin: '0 0 8px' }}>Payslip Details</h3>
            <p style={{ margin: '0 0 12px', opacity: 0.7 }}>
              {selectedPayslip.periodLabel} · Issued {selectedPayslip.issuedAt ? new Date(selectedPayslip.issuedAt).toLocaleDateString() : 'Pending'}
            </p>

            <div className="payslip" style={{ marginTop: 12 }}>
              <div className="payslip__col">
                <p className="payslip__col-title">Earnings</p>
                <ul className="payslip__list">
                  <li>
                    <span>Basic Pay</span>
                    <span>{currency(selectedPayslip.basicPay)}</span>
                  </li>
                  {(selectedPayslip.allowances ?? []).map((item) => (
                    <li key={item.id ?? item.label}>
                      <span>{item.label}</span>
                      <span>{currency(item.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="payslip__col">
                <p className="payslip__col-title">Deductions</p>
                <ul className="payslip__list">
                  {(selectedPayslip.deductions ?? []).map((item) => (
                    <li key={item.id ?? item.label}>
                      <span>{item.label}</span>
                      <span>-{currency(item.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
              <strong>Government Contributions</strong>
              {governmentDeductions.length === 0 ? (
                <p style={{ margin: 0, opacity: 0.7 }}>No government deductions listed.</p>
              ) : (
                governmentDeductions.map((item) => (
                  <div key={item.id ?? item.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{item.label}</span>
                    <strong>-{currency(item.amount)}</strong>
                  </div>
                ))
              )}

              {otherDeductions.length > 0 && (
                <>
                  <strong style={{ marginTop: 8 }}>Other Deductions</strong>
                  {otherDeductions.map((item) => (
                    <div key={item.id ?? item.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{item.label}</span>
                      <strong>-{currency(item.amount)}</strong>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="payslip__summary" style={{ marginTop: 18 }}>
              <div>
                <p className="payslip__summary-label">Gross Pay</p>
                <p className="payslip__summary-value">{currency(selectedPayslip.grossPay)}</p>
              </div>
              <div>
                <p className="payslip__summary-label">Total Deductions</p>
                <p className="payslip__summary-value payslip__summary-value--neg">-{currency(selectedPayslip.totalDeductions)}</p>
              </div>
              <div className="payslip__summary-net">
                <p className="payslip__summary-label">Net Pay</p>
                <p className="payslip__summary-value payslip__summary-value--net">{currency(selectedPayslip.netPay)}</p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <Button size="sm" onClick={() => setSelectedPayslip(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
