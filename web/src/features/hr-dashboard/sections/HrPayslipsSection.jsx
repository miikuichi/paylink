import Panel from '../../../shared/components/ui/Panel.jsx'
import Button from '../../../shared/components/ui/Button.jsx'
import { PlusIcon } from '../../../shared/icons/index.jsx'
import {
  PayPeriodSelector,
  AddPayPeriodModal,
} from '../../payroll/index.js'
import { HrPayslipTable } from '../../payslips/index.js'

/**
 * HR Payslips section — pay-period selector and payslip table.
 *
 * @param {object}   props
 * @param {Array}    props.payPeriods
 * @param {string}   props.selectedPeriodId
 * @param {Function} props.onSelectPeriod
 * @param {Array}    props.payslips
 * @param {Function} props.onAddPeriod
 * @param {object}   props.currentPeriod
 */
export function HrPayslipsSection({
  payPeriods,
  selectedPeriodId,
  onSelectPeriod,
  payslips,
  onAddPeriod,
  currentPeriod,
  onRevokePayslip,
}) {
  return (
    <>
      {payPeriods.length === 0 && (
        <Panel
          title="No pay periods yet"
          subtitle="Create a pay period to issue and view payslips."
        >
          <p style={{ opacity: 0.7, margin: 0 }}>
            Payslips are generated from processed payrolls within a specific pay period.
          </p>
        </Panel>
      )}
      <PayPeriodSelector
        payPeriods={payPeriods}
        selectedPeriodId={selectedPeriodId}
        onSelect={onSelectPeriod}
        onAddPeriod={onAddPeriod}
      />
      <HrPayslipTable
        payslips={payslips}
        subtitle={`Issued for ${currentPeriod?.label ?? '—'}`}
        onRevokePayslip={onRevokePayslip}
      />
    </>
  )
}
