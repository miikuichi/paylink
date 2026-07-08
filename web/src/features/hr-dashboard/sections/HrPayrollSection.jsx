import Panel from '../../../shared/components/ui/Panel.jsx'
import Button from '../../../shared/components/ui/Button.jsx'
import { PlusIcon } from '../../../shared/icons/index.jsx'
import {
  PayPeriodSelector,
  PayrollTable,
  PayrollResultsTable,
} from '../../payroll/index.js'

/**
 * HR Payroll section — pay-period selector, payroll processing, and results.
 *
 * @param {object}   props
 * @param {Array}    props.employees
 * @param {Array}    props.payPeriods
 * @param {string}   props.selectedPeriodId
 * @param {Function} props.onSelectPeriod
 * @param {Array}    props.payrolls
 * @param {boolean}  props.processLoading
 * @param {string}   props.processError
 * @param {Function} props.onProcessPayroll
 * @param {Function} props.onAddPeriod
 * @param {Function} props.onAfterGenerate
 */
export function HrPayrollSection({
  employees,
  payPeriods,
  selectedPeriodId,
  onSelectPeriod,
  payrolls,
  processLoading,
  processError,
  onProcessPayroll,
  onAddPeriod,
  onAfterGenerate,
}) {
  return (
    <>
      {payPeriods.length === 0 && (
        <Panel
          title="No pay periods yet"
          subtitle="Create a pay period before processing payroll."
          actions={
            <Button
              variant="gold"
              size="sm"
              icon={<PlusIcon />}
              onClick={onAddPeriod}
            >
              New Period
            </Button>
          }
        >
          <p style={{ opacity: 0.7, margin: 0 }}>
            Once a period exists, run payroll for active employees and generate payslips.
          </p>
        </Panel>
      )}

      <PayPeriodSelector
        payPeriods={payPeriods}
        selectedPeriodId={selectedPeriodId}
        onSelect={onSelectPeriod}
        onAddPeriod={onAddPeriod}
      />

      {processError && <p style={{ color: 'red', marginBottom: 8 }}>{processError}</p>}

      <PayrollTable
        employees={employees}
        payrolls={payrolls}
        processLoading={processLoading}
        onProcess={onProcessPayroll}
      />

      <PayrollResultsTable
        payrolls={payrolls}
        onAfterGenerate={onAfterGenerate}
      />
    </>
  )
}
