import Panel from '../../../shared/components/ui/Panel.jsx'
import Button from '../../../shared/components/ui/Button.jsx'
import { PlusIcon } from '../../../shared/icons/index.jsx'
import { EmployeeTable } from '../../employees/index.js'

/**
 * HR Employees section — displays employee roster and add action.
 *
 * @param {object}   props
 * @param {Array}    props.employees
 * @param {Function} props.onEditRate
 * @param {Function} props.onAddEmployee
 */
export function HrEmployeesSection({
  employees,
  onEditRate,
  onAddEmployee,
}) {
  return (
    <Panel
      title="Employees"
      subtitle="All registered employees"
      actions={
        <Button
          variant="ghost"
          size="sm"
          icon={<PlusIcon />}
          onClick={onAddEmployee}
        >
          Add
        </Button>
      }
    >
      <div className="employee-directory-scroll">
        <EmployeeTable employees={employees} onEditRate={onEditRate} />
      </div>
    </Panel>
  )
}
