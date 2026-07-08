import { useState } from 'react'
import Badge from '../../../shared/components/ui/Badge.jsx'
import Button from '../../../shared/components/ui/Button.jsx'
import { generatePayslip } from '../api.js'

/**
 * Self-contained "Generate Payslip" action cell.
 * Renders an "Issued" badge when the payslip already exists, otherwise
 * renders a Generate button that calls the API with its own loading state.
 *
 * @param {object}   props
 * @param {string}   props.payrollId   - ID of the payroll record to generate a payslip for
 * @param {boolean}  props.hasPayslip  - Whether a payslip has already been issued
 * @param {Function} [props.onSuccess] - Called (awaited) after a successful generate
 */
export function GeneratePayslipAction({ payrollId, hasPayslip, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (hasPayslip) return <Badge tone="success">Issued</Badge>

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    try {
      await generatePayslip(payrollId)
      if (onSuccess) await onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <Button size="sm" variant="ghost" loading={loading} onClick={handleGenerate}>
        Generate
      </Button>
      {error && (
        <span style={{ color: 'var(--color-error, red)', fontSize: 11 }}>{error}</span>
      )}
    </span>
  )
}
