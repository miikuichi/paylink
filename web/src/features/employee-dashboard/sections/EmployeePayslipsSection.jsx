import { EmployeePayslipTable } from '../../payslips/index.js'

/**
 * Employee Payslips section — displays employee's payslip table.
 *
 * @param {object} props
 * @param {Array}  props.payslips
 */
export function EmployeePayslipsSection({ payslips }) {
  return <EmployeePayslipTable payslips={payslips} />
}
