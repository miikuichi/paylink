import Button from '../../../shared/components/ui/Button.jsx'

export function EditEmployeeModal({
  employee,
  rateValue,
  setRateValue,
  error,
  loading,
  onSubmit,
  onClose,
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 16px' }}>Edit Employee Rate</h3>
        <p style={{ marginTop: 0, opacity: 0.7 }}>
          {employee?.firstName} {employee?.lastName} ({employee?.employeeNumber})
        </p>
        {error && <p style={{ color: 'red', marginBottom: 8 }}>{error}</p>}
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Basic Rate (PHP/month)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={rateValue}
              onChange={(e) => setRateValue(e.target.value)}
              required
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db' }}
            />
          </label>
          <p style={{ margin: 0, fontSize: 12, opacity: 0.65 }}>
            Minimum enforced rate is based on the PH city minimum wage baseline.
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={loading}>
              Save Rate
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
