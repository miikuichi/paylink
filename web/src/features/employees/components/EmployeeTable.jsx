import DataTable from '../../../shared/components/ui/DataTable.jsx'
import Badge from '../../../shared/components/ui/Badge.jsx'
import Button from '../../../shared/components/ui/Button.jsx'

const currency = (v) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(v ?? 0)

export function EmployeeTable({ employees, onEditRate }) {
  return (
    <>
      <DataTable
        columns={[
          { key: 'employeeNumber', header: 'ID' },
          { key: 'firstName', header: 'First Name' },
          { key: 'lastName', header: 'Last Name' },
          { key: 'position', header: 'Position' },
          { key: 'department', header: 'Department' },
          {
            key: 'shift',
            header: 'Shift',
            render: (r) => `${r.shiftStart ?? '09:00'} - ${r.shiftEnd ?? '18:00'}`,
          },
          {
            key: 'basicRate',
            header: 'Basic Rate',
            align: 'right',
            render: (r) => currency(r.basicRate),
          },
          {
            key: 'status',
            header: 'Status',
            align: 'center',
            render: (r) => (
              <Badge tone={r.status === 'ACTIVE' ? 'success' : 'neutral'}>
                {r.status}
              </Badge>
            ),
          },
          {
            key: 'actions',
            header: 'Actions',
            align: 'center',
            render: (r) => (
              <Button size="sm" variant="ghost" onClick={() => onEditRate(r)}>
                Edit Rate
              </Button>
            ),
          },
        ]}
        rows={employees}
      />
      {employees.length === 0 && (
        <p style={{ opacity: 0.5, textAlign: 'center', padding: 24 }}>
          No employees yet.
        </p>
      )}
    </>
  )
}
