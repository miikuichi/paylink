import Panel from '../../../shared/components/ui/Panel.jsx'
import Button from '../../../shared/components/ui/Button.jsx'
import { DownloadIcon } from '../../../shared/icons/index.jsx'

const currency = (v) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(v ?? 0)

export function PayslipDetailCard({ payslip }) {
  if (!payslip) {
    return (
      <Panel title="Latest Payslip" subtitle="No payslip available yet">
        <p style={{ opacity: 0.5, padding: 24, textAlign: 'center' }}>
          No payslips issued yet.
        </p>
      </Panel>
    )
  }

  return (
    <Panel
      title="Latest Payslip"
      subtitle={`${payslip.periodLabel} · Issued ${new Date(payslip.issuedAt).toLocaleDateString()}`}
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
            <li>
              <span>Basic Pay</span>
              <span>{currency(payslip.basicPay)}</span>
            </li>
            {payslip.allowances?.map((item) => (
              <li key={item.id}>
                <span>{item.label}</span>
                <span>{currency(item.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="payslip__col">
          <p className="payslip__col-title">Deductions</p>
          <ul className="payslip__list">
            {payslip.deductions?.map((item) => (
              <li key={item.id}>
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
          <p className="payslip__summary-value">{currency(payslip.grossPay)}</p>
        </div>
        <div>
          <p className="payslip__summary-label">Total Deductions</p>
          <p className="payslip__summary-value payslip__summary-value--neg">
            -{currency(payslip.totalDeductions)}
          </p>
        </div>
        <div className="payslip__summary-net">
          <p className="payslip__summary-label">Net Pay</p>
          <p className="payslip__summary-value payslip__summary-value--net">
            {currency(payslip.netPay)}
          </p>
        </div>
      </div>
    </Panel>
  )
}
