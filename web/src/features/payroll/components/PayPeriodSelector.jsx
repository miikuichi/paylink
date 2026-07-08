import Button from '../../../shared/components/ui/Button.jsx'
import { PlusIcon } from '../../../shared/icons/index.jsx'

export function PayPeriodSelector({ payPeriods, selectedPeriodId, onSelect, onAddPeriod }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
      <select
        value={selectedPeriodId ?? ''}
        onChange={(e) => onSelect(Number(e.target.value))}
        style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db' }}
      >
        {payPeriods.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label} ({p.status})
          </option>
        ))}
      </select>
      <Button variant="ghost" size="sm" icon={<PlusIcon />} onClick={onAddPeriod}>
        New Period
      </Button>
    </div>
  )
}
