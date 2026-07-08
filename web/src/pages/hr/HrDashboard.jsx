import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../shared/layouts/DashboardLayout.jsx";
import StatCard from "../../shared/components/ui/StatCard.jsx";
import Panel from "../../shared/components/ui/Panel.jsx";
import DataTable from "../../shared/components/ui/DataTable.jsx";
import Badge from "../../shared/components/ui/Badge.jsx";
import Button from "../../shared/components/ui/Button.jsx";
import {
  useEmployees,
  EmployeeTable,
  AddEmployeeModal,
  EditEmployeeModal,
} from "../../features/employees/index.js";
import {
  usePayroll,
  PayPeriodSelector,
  PayrollTable,
  PayrollResultsTable,
  AddPayPeriodModal,
} from "../../features/payroll/index.js";
import { getPayslipsByPeriod, generatePayslip } from "../../api/payslips.js";
import "./Dashboard.css";

const currency = (v) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(
    v ?? 0,
  );

const NAV_ITEMS = [
  { key: "overview", label: "Overview", icon: <GridIcon /> },
  { key: "employees", label: "Employees", icon: <PeopleIcon /> },
  { key: "payroll", label: "Payroll", icon: <WalletIcon /> },
  { key: "payslips", label: "Payslips", icon: <DocIcon /> },
];

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect
        x="4"
        y="4"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <rect
        x="13"
        y="4"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <rect
        x="4"
        y="13"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <rect
        x="13"
        y="13"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}
function PeopleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M3.5 19c1-3 3-4.5 5.5-4.5s4.5 1.5 5.5 4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle
        cx="17"
        cy="8.5"
        r="2.3"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M15.5 14.6c2 .2 3.5 1.6 4.3 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
function WalletIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect
        x="3.5"
        y="6.5"
        width="17"
        height="12"
        rx="2.2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M3.5 10.5h17" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16.5" cy="14" r="1.2" fill="currentColor" />
    </svg>
  );
}
function DocIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5A1.5 1.5 0 0 1 7 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M14 3.5V8h4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 12h6M9 15.5h6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const statusTone = (status) =>
  status === "PROCESSED"
    ? "success"
    : status === "DRAFT"
      ? "warning"
      : "neutral";

const HrDashboard = () => {
  const [activeKey, setActiveKey] = useState("overview");

  const {
    employees,
    setEmployees,
    refresh: refreshEmployees,
    showAddEmployee,
    setShowAddEmployee,
    empForm,
    setEmpForm,
    empFormError,
    empFormLoading,
    handleAddEmployee,
    showEditEmployee,
    setShowEditEmployee,
    editingEmployee,
    editRateValue,
    setEditRateValue,
    editRateError,
    editRateLoading,
    openEditRate,
    handleUpdateRate,
  } = useEmployees();
  const {
    payPeriods,
    setPayPeriods,
    payrolls,
    setPayrolls,
    selectedPeriodId,
    setSelectedPeriodId,
    refreshPayPeriods,
    refreshPayrolls,
    showAddPeriod,
    setShowAddPeriod,
    periodForm,
    setPeriodForm,
    periodFormError,
    periodFormLoading,
    handleAddPeriod,
    processError,
    processLoading,
    handleProcessPayroll,
  } = usePayroll();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");  const [payslips, setPayslips] = useState([]);
  const loadBase = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [, periods] = await Promise.all([
        refreshEmployees(),
        refreshPayPeriods(),
      ]);
      if (periods.length > 0)
        setSelectedPeriodId((prev) => prev ?? periods[0].id);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [refreshEmployees, refreshPayPeriods]);

  useEffect(() => {
    loadBase();
  }, [loadBase]);

  useEffect(() => {
    if (!selectedPeriodId) return;
    Promise.all([
      refreshPayrolls(selectedPeriodId),
      getPayslipsByPeriod(selectedPeriodId),
    ])
      .then(([, ps]) => setPayslips(ps))
      .catch(() => {});
  }, [selectedPeriodId]);

  const currentPeriod = payPeriods.find((p) => p.id === selectedPeriodId);
  const activeEmployees = employees.filter((e) => e.status === "ACTIVE").length;
  const totalNetPay = payrolls.reduce((sum, r) => sum + (r.netPay ?? 0), 0);
  const processedCount = payrolls.filter((r) => r.status === "PROCESSED").length;

  const handleGeneratePayslip = async (payrollId) => {
    try {
      await generatePayslip(payrollId);
      const [, ps] = await Promise.all([
        refreshPayrolls(selectedPeriodId),
        getPayslipsByPeriod(selectedPeriodId),
      ]);
      setPayslips(ps);
    } catch (err) {
      alert(err.message);
    }
  };
  return (
    <DashboardLayout
      navItems={NAV_ITEMS}
      activeKey={activeKey}
      onNavigate={setActiveKey}
      pageTitle="HR Overview"
      pageSubtitle={
        currentPeriod
          ? `Pay period: ${currentPeriod.label}`
          : "No pay period selected"
      }
      headerActions={
        <Button
          variant="gold"
          size="sm"
          icon={<PlusIcon />}
          onClick={() => setShowAddEmployee(true)}
        >
          New Employee
        </Button>
      }
    >
      {error && <p style={{ color: "red", marginBottom: 12 }}>{error}</p>}
      {loading && <p style={{ opacity: 0.5 }}>Loading…</p>}

      {activeKey === "overview" && (
        <>
          {!loading && employees.length === 0 && (
            <Panel
              title="No employees yet"
              subtitle="Create your first employee account to start payroll operations."
              actions={
                <Button
                  variant="gold"
                  size="sm"
                  icon={<PlusIcon />}
                  onClick={() => setShowAddEmployee(true)}
                >
                  New Employee
                </Button>
              }
            >
              <p style={{ opacity: 0.7, margin: 0 }}>
                After adding employees, you can create a pay period, run
                payroll, and generate payslips from this dashboard.
              </p>
            </Panel>
          )}

          <div className="dash-grid dash-grid--stats">
            <StatCard
              label="Active Employees"
              value={activeEmployees}
              tone="maroon"
              icon={<PeopleIcon />}
            />
            <StatCard
              label="Current Period Net Pay"
              value={currency(totalNetPay)}
              tone="gold"
              icon={<WalletIcon />}
              trend={currentPeriod?.label ?? "—"}
            />
            <StatCard
              label="Payrolls Processed"
              value={`${processedCount} / ${payrolls.length}`}
              tone="neutral"
              icon={<DocIcon />}
            />
            <StatCard
              label="Pay Period Status"
              value={currentPeriod?.status ?? "—"}
              tone="maroon"
              icon={<GridIcon />}
            />
          </div>

          <div className="dash-grid dash-grid--split">
            <Panel
              title="Payroll Summary"
              subtitle={`Net pay for ${currentPeriod?.label ?? "—"}`}
            >
              <DataTable
                columns={[
                  { key: "employeeName", header: "Employee" },
                  { key: "employeeNumber", header: "ID" },
                  {
                    key: "grossPay",
                    header: "Gross Pay",
                    align: "right",
                    render: (r) => currency(r.grossPay),
                  },
                  {
                    key: "totalDeductions",
                    header: "Deductions",
                    align: "right",
                    render: (r) => currency(r.totalDeductions),
                  },
                  {
                    key: "netPay",
                    header: "Net Pay",
                    align: "right",
                    render: (r) => <strong>{currency(r.netPay)}</strong>,
                  },
                  {
                    key: "status",
                    header: "Status",
                    align: "center",
                    render: (r) => (
                      <Badge tone={statusTone(r.status)} dot>
                        {r.status}
                      </Badge>
                    ),
                  },
                ]}
                rows={payrolls}
              />
              {payrolls.length === 0 && (
                <p style={{ opacity: 0.5, textAlign: "center", padding: 24 }}>
                  No payroll records for this period yet.
                </p>
              )}
            </Panel>

            <Panel
              title="Employee Directory"
              subtitle="Quick view of active roster"
            >
              <ul className="employee-list">
                {employees.map((emp) => (
                  <li key={emp.id} className="employee-list__item">
                    <span className="employee-list__avatar">
                      {(emp.firstName?.[0] ?? "") + (emp.lastName?.[0] ?? "")}
                    </span>
                    <div className="employee-list__info">
                      <p className="employee-list__name">
                        {emp.firstName} {emp.lastName}
                      </p>
                      <p className="employee-list__role">
                        {emp.position} · {emp.department}
                      </p>
                    </div>
                    <Badge
                      tone={emp.status === "ACTIVE" ? "success" : "neutral"}
                    >
                      {emp.status === "ACTIVE" ? "Active" : "Inactive"}
                    </Badge>
                  </li>
                ))}
              </ul>
              {employees.length === 0 && (
                <p style={{ opacity: 0.5, textAlign: "center", padding: 24 }}>
                  No employees found.
                </p>
              )}
            </Panel>
          </div>
        </>
      )}      {activeKey === "employees" && (
        <Panel
          title="Employees"
          subtitle="All registered employees"
          actions={
            <Button
              variant="ghost"
              size="sm"
              icon={<PlusIcon />}
              onClick={() => setShowAddEmployee(true)}
            >
              Add
            </Button>
          }
        >
          <EmployeeTable employees={employees} onEditRate={openEditRate} />
        </Panel>
      )}      {activeKey === "payroll" && (
        <>
          {payPeriods.length === 0 && (
            <Panel
              title="No pay periods yet"
              subtitle="Create a pay period before processing payroll."
              actions={
                <Button variant="gold" size="sm" icon={<PlusIcon />} onClick={() => setShowAddPeriod(true)}>
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
            onSelect={setSelectedPeriodId}
            onAddPeriod={() => setShowAddPeriod(true)}
          />

          {processError && <p style={{ color: "red", marginBottom: 8 }}>{processError}</p>}

          <PayrollTable
            employees={employees}
            payrolls={payrolls}
            processLoading={processLoading}
            onProcess={(empId) => handleProcessPayroll(empId, selectedPeriodId)}
          />

          <PayrollResultsTable payrolls={payrolls} onGeneratePayslip={handleGeneratePayslip} />
        </>
      )}

      {activeKey === "payslips" && (
        <>
          {payPeriods.length === 0 && (
            <Panel
              title="No pay periods yet"
              subtitle="Create a pay period to issue and view payslips."
            >
              <p style={{ opacity: 0.7, margin: 0 }}>
                Payslips are generated from processed payrolls within a specific
                pay period.
              </p>
            </Panel>
          )}

          <div style={{ marginBottom: 16 }}>
            <select
              value={selectedPeriodId ?? ""}
              onChange={(e) => setSelectedPeriodId(Number(e.target.value))}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #d1d5db",
              }}
            >
              {payPeriods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} ({p.status})
                </option>
              ))}
            </select>
          </div>
          <Panel
            title="Payslips"
            subtitle={`Issued for ${currentPeriod?.label ?? "—"}`}
          >
            <DataTable
              columns={[
                { key: "employeeNumber", header: "Employee ID" },
                { key: "employeeName", header: "Name" },
                { key: "position", header: "Position" },
                {
                  key: "grossPay",
                  header: "Gross Pay",
                  align: "right",
                  render: (r) => currency(r.grossPay),
                },
                {
                  key: "totalDeductions",
                  header: "Deductions",
                  align: "right",
                  render: (r) => currency(r.totalDeductions),
                },
                {
                  key: "netPay",
                  header: "Net Pay",
                  align: "right",
                  render: (r) => <strong>{currency(r.netPay)}</strong>,
                },
              ]}
              rows={payslips}
            />
            {payslips.length === 0 && (
              <p style={{ opacity: 0.5, textAlign: "center", padding: 24 }}>
                No payslips issued yet.
              </p>
            )}
          </Panel>
        </>
      )}      {showAddEmployee && (
        <AddEmployeeModal
          form={empForm}
          setForm={setEmpForm}
          error={empFormError}
          loading={empFormLoading}
          onSubmit={handleAddEmployee}
          onClose={() => setShowAddEmployee(false)}
        />
      )}      {showAddPeriod && (
        <AddPayPeriodModal
          form={periodForm}
          setForm={setPeriodForm}
          error={periodFormError}
          loading={periodFormLoading}
          onSubmit={handleAddPeriod}
          onClose={() => setShowAddPeriod(false)}
        />
      )}      {showEditEmployee && (
        <EditEmployeeModal
          employee={editingEmployee}
          rateValue={editRateValue}
          setRateValue={setEditRateValue}
          error={editRateError}
          loading={editRateLoading}
          onSubmit={handleUpdateRate}
          onClose={() => setShowEditEmployee(false)}
        />
      )}
    </DashboardLayout>
  );
};

export default HrDashboard;
