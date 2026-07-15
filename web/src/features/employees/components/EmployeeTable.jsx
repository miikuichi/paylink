import { useMemo, useState } from "react";
import DataTable from "../../../shared/components/ui/DataTable.jsx";
import Badge from "../../../shared/components/ui/Badge.jsx";
import Button from "../../../shared/components/ui/Button.jsx";

const currency = (v) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(
    v ?? 0,
  );

const SORTABLE_COLUMNS = [
  "employeeNumber",
  "firstName",
  "lastName",
  "position",
  "department",
  "shift",
];

const normalizeText = (value) => String(value ?? "").toLowerCase().trim();

const getShiftText = (employee) =>
  `${employee.shiftStart ?? "09:00"} - ${employee.shiftEnd ?? "18:00"}`;

const getSortValue = (employee, key) => {
  if (key === "shift") {
    return getShiftText(employee);
  }
  return employee[key] ?? "";
};

export function EmployeeTable({ employees, onEditRate, searchTerm = "" }) {
  const [sortKey, setSortKey] = useState("employeeNumber");
  const [sortDirection, setSortDirection] = useState("asc");

  const toggleSort = (key) => {
    if (!SORTABLE_COLUMNS.includes(key)) return;
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection("asc");
  };

  const visibleEmployees = useMemo(() => {
    const q = normalizeText(searchTerm);

    const filtered = employees.filter((employee) => {
      if (!q) return true;
      const searchable = [
        employee.employeeNumber,
        employee.firstName,
        employee.lastName,
        employee.position,
        employee.department,
        getShiftText(employee),
      ]
        .map(normalizeText)
        .join(" ");
      return searchable.includes(q);
    });

    const sorted = [...filtered].sort((a, b) => {
      const aValue = normalizeText(getSortValue(a, sortKey));
      const bValue = normalizeText(getSortValue(b, sortKey));

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [employees, searchTerm, sortKey, sortDirection]);

  const headerLabel = (label, key) => {
    if (!SORTABLE_COLUMNS.includes(key)) return label;
    const arrow = sortKey === key ? (sortDirection === "asc" ? " ↑" : " ↓") : " ↕";
    return `${label}${arrow}`;
  };

  return (
    <>
      <DataTable
        columns={[
          {
            key: "employeeNumber",
            header: headerLabel("ID", "employeeNumber"),
            onHeaderClick: () => toggleSort("employeeNumber"),
          },
          {
            key: "firstName",
            header: headerLabel("First Name", "firstName"),
            onHeaderClick: () => toggleSort("firstName"),
          },
          {
            key: "lastName",
            header: headerLabel("Last Name", "lastName"),
            onHeaderClick: () => toggleSort("lastName"),
          },
          {
            key: "position",
            header: headerLabel("Position", "position"),
            onHeaderClick: () => toggleSort("position"),
          },
          {
            key: "department",
            header: headerLabel("Department", "department"),
            onHeaderClick: () => toggleSort("department"),
          },
          {
            key: "shift",
            header: headerLabel("Shift", "shift"),
            onHeaderClick: () => toggleSort("shift"),
            render: (r) => getShiftText(r),
          },
          {
            key: "basicRate",
            header: "Basic Rate",
            align: "right",
            render: (r) => currency(r.basicRate),
          },
          {
            key: "status",
            header: "Status",
            align: "center",
            render: (r) => (
              <Badge tone={r.status === "ACTIVE" ? "success" : "neutral"}>
                {r.status}
              </Badge>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            align: "center",
            render: (r) => (
              <Button size="sm" variant="ghost" onClick={() => onEditRate(r)}>
                Edit Rate
              </Button>
            ),
          },
        ]}
        rows={visibleEmployees}
      />
      {visibleEmployees.length === 0 && (
        <p style={{ opacity: 0.5, textAlign: "center", padding: 24 }}>
          {employees.length === 0 ? "No employees yet." : "No matching employees."}
        </p>
      )}
    </>
  );
}
