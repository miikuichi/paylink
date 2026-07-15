import { useState } from "react";
import Panel from "../../../shared/components/ui/Panel.jsx";
import Button from "../../../shared/components/ui/Button.jsx";
import { PlusIcon } from "../../../shared/icons/index.jsx";
import { EmployeeTable } from "../../employees/index.js";

/**
 * HR Employees section — displays employee roster and add action.
 *
 * @param {object}   props
 * @param {Array}    props.employees
 * @param {Function} props.onEditRate
 * @param {Function} props.onAddEmployee
 */
export function HrEmployeesSection({ employees, onEditRate, onAddEmployee }) {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <Panel
      title="Employees"
      subtitle="All registered employees"
      actions={
        <div className="employee-panel-actions">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search employee"
            className="employee-table-search"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<PlusIcon />}
            onClick={onAddEmployee}
          >
            Add
          </Button>
        </div>
      }
    >
      <div className="employee-directory-scroll">
        <EmployeeTable
          employees={employees}
          onEditRate={onEditRate}
          searchTerm={searchTerm}
        />
      </div>
    </Panel>
  );
}
