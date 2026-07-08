import Button from '../../../shared/components/ui/Button.jsx'

export function AddPayPeriodModal({ form, setForm, error, loading, onSubmit, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 16px' }}>New Pay Period</h3>
        {error && <p style={{ color: 'red', marginBottom: 8 }}>{error}</p>}
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Start Date', field: 'startDate' },
            { label: 'End Date', field: 'endDate' },
          ].map(({ label, field }) => (
            <label key={field} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
              <input
                type="date"
                value={form[field]}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                required
                style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db' }}
              />
            </label>
          ))}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={loading}>
              Create Period
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
