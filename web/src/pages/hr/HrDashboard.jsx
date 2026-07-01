import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import Panel from "../../components/ui/Panel.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import { getEmployees, createEmployee } from "../../api/employees.js";
import {
  getPayPeriods,
  createPayPeriod,
  getPayrollsByPeriod,
  processPayroll,
} from "../../api/payroll.js";
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

  const [employees, setEmployees] = useState([]);
  const [payPeriods, setPayPeriods] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [empForm, setEmpForm] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    position: "",
    department: "",
    basicRate: "",
  });
  const [empFormError, setEmpFormError] = useState("");
  const [empFormLoading, setEmpFormLoading] = useState(false);

  const [showAddPeriod, setShowAddPeriod] = useState(false);
  const [periodForm, setPeriodForm] = useState({ startDate: "", endDate: "" });
  const [periodFormError, setPeriodFormError] = useState("");
  const [periodFormLoading, setPeriodFormLoading] = useState(false);

  const [processError, setProcessError] = useState("");
  const [processLoading, setProcessLoading] = useState(false);

  const loadBase = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [emps, periods] = await Promise.all([
        getEmployees(),
        getPayPeriods(),
      ]);
      setEmployees(emps);
      setPayPeriods(periods);
      if (periods.length > 0)
        setSelectedPeriodId((prev) => prev ?? periods[0].id);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBase();
  }, [loadBase]);

  useEffect(() => {
    if (!selectedPeriodId) return;
    Promise.all([
      getPayrollsByPeriod(selectedPeriodId),
      getPayslipsByPeriod(selectedPeriodId),
    ])
      .then(([pr, ps]) => {
        setPayrolls(pr);
        setPayslips(ps);
      })
      .catch(() => {});
  }, [selectedPeriodId]);

  const currentPeriod = payPeriods.find((p) => p.id === selectedPeriodId);
  const activeEmployees = employees.filter((e) => e.status === "ACTIVE").length;
  const totalNetPay = payrolls.reduce((sum, r) => sum + (r.netPay ?? 0), 0);
  const processedCount = payrolls.filter(
    (r) => r.status === "PROCESSED",
  ).length;

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setEmpFormError("");
    setEmpFormLoading(true);
    try {
      await createEmployee({
        ...empForm,
        basicRate: parseFloat(empForm.basicRate),
      });
      setShowAddEmployee(false);
      setEmpForm({
        username: "",
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        position: "",
        department: "",
        basicRate: "",
      });
      setEmployees(await getEmployees());
    } catch (err) {
      setEmpFormError(err.message);
    } finally {
      setEmpFormLoading(false);
    }
  };

  const handleAddPeriod = async (e) => {
    e.preventDefault();
    setPeriodFormError("");
    setPeriodFormLoading(true);
    try {
      const created = await createPayPeriod(periodForm);
      setShowAddPeriod(false);
      setPeriodForm({ startDate: "", endDate: "" });
      setPayPeriods(await getPayPeriods());
      setSelectedPeriodId(created.id);
    } catch (err) {
      setPeriodFormError(err.message);
    } finally {
      setPeriodFormLoading(false);
    }
  };

  const handleProcessPayroll = async (employeeId) => {
    if (!selectedPeriodId) return;
    setProcessError("");
    setProcessLoading(true);
    try {
      await processPayroll({
        employeeId,
        payPeriodId: selectedPeriodId,
        additionalItems: [],
      });
      setPayrolls(await getPayrollsByPeriod(selectedPeriodId));
    } catch (err) {
      setProcessError(err.message);
    } finally {
      setProcessLoading(false);
    }
  };

  const handleGeneratePayslip = async (payrollId) => {
    try {
      await generatePayslip(payrollId);
      const [pr, ps] = await Promise.all([
        getPayrollsByPeriod(selectedPeriodId),
        getPayslipsByPeriod(selectedPeriodId),
      ]);
      setPayrolls(pr);
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
            </Panel>
          </div>
        </>
      )}

      {activeKey === "employees" && (
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
          <DataTable
            columns={[
              { key: "employeeNumber", header: "ID" },
              { key: "firstName", header: "First Name" },
              { key: "lastName", header: "Last Name" },
              { key: "position", header: "Position" },
              { key: "department", header: "Department" },
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
            ]}
            rows={employees}
          />
        </Panel>
      )}

      {activeKey === "payroll" && (
        <>
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              marginBottom: 16,
            }}
          >
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
            <Button
              variant="ghost"
              size="sm"
              icon={<PlusIcon />}
              onClick={() => setShowAddPeriod(true)}
            >
              New Period
            </Button>
          </div>
          {processError && (
            <p style={{ color: "red", marginBottom: 8 }}>{processError}</p>
          )}

          <Panel
            title="Process Payroll"
            subtitle="Computes SSS, PhilHealth, Pag-IBIG and withholding tax automatically"
          >
            <DataTable
              columns={[
                { key: "employeeNumber", header: "ID" },
                { key: "firstName", header: "First Name" },
                { key: "lastName", header: "Last Name" },
                {
                  key: "basicRate",
                  header: "Basic Rate",
                  align: "right",
                  render: (r) => currency(r.basicRate),
                },
                {
                  key: "payrollStatus",
                  header: "Action",
                  align: "center",
                  render: (r) => {
                    const existing = payrolls.find(
                      (p) => p.employeeId === r.id,
                    );
                    if (existing)
                      return (
                        <Badge tone={statusTone(existing.status)} dot>
                          {existing.status}
                        </Badge>
                      );
                    return (
                      <Button
                        size="sm"
                        variant="ghost"
                        loading={processLoading}
                        onClick={() => handleProcessPayroll(r.id)}
                      >
                        Run
                      </Button>
                    );
                  },
                },
              ]}
              rows={employees.filter((e) => e.status === "ACTIVE")}
            />
          </Panel>

          {payrolls.length > 0 && (
            <Panel
              title="Payroll Results"
              subtitle="Computed for this period"
              style={{ marginTop: 16 }}
            >
              <DataTable
                columns={[
                  { key: "employeeName", header: "Employee" },
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
                    key: "payslip",
                    header: "Payslip",
                    align: "center",
                    render: (r) =>
                      r.hasPayslip ? (
                        <Badge tone="success">Issued</Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleGeneratePayslip(r.id)}
                        >
                          Generate
                        </Button>
                      ),
                  },
                ]}
                rows={payrolls}
              />
            </Panel>
          )}
        </>
      )}

      {activeKey === "payslips" && (
        <>
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
      )}

      {showAddEmployee && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddEmployee(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 16px" }}>New Employee</h3>
            {empFormError && (
              <p style={{ color: "red", marginBottom: 8 }}>{empFormError}</p>
            )}
            <form
              onSubmit={handleAddEmployee}
              style={{ display: "flex", flexDirection: "column", gap: 10 }}
            >
              {[
                { label: "Username", field: "username" },
                { label: "Email", field: "email", type: "email" },
                { label: "Password", field: "password", type: "password" },
                { label: "First Name", field: "firstName" },
                { label: "Last Name", field: "lastName" },
                { label: "Position", field: "position" },
                { label: "Department", field: "department" },
                {
                  label: "Basic Rate (₱/month)",
                  field: "basicRate",
                  type: "number",
                },
              ].map(({ label, field, type = "text" }) => (
                <label
                  key={field}
                  style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
                  <input
                    type={type}
                    value={empForm[field]}
                    onChange={(e) =>
                      setEmpForm((f) => ({ ...f, [field]: e.target.value }))
                    }
                    required
                    style={{
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: "1px solid #d1d5db",
                    }}
                  />
                </label>
              ))}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  justifyContent: "flex-end",
                  marginTop: 4,
                }}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddEmployee(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" loading={empFormLoading}>
                  Save Employee
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddPeriod && (
        <div className="modal-overlay" onClick={() => setShowAddPeriod(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 16px" }}>New Pay Period</h3>
            {periodFormError && (
              <p style={{ color: "red", marginBottom: 8 }}>{periodFormError}</p>
            )}
            <form
              onSubmit={handleAddPeriod}
              style={{ display: "flex", flexDirection: "column", gap: 10 }}
            >
              {[
                { label: "Start Date", field: "startDate" },
                { label: "End Date", field: "endDate" },
              ].map(({ label, field }) => (
                <label
                  key={field}
                  style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
                  <input
                    type="date"
                    value={periodForm[field]}
                    onChange={(e) =>
                      setPeriodForm((f) => ({ ...f, [field]: e.target.value }))
                    }
                    required
                    style={{
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: "1px solid #d1d5db",
                    }}
                  />
                </label>
              ))}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  justifyContent: "flex-end",
                  marginTop: 4,
                }}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddPeriod(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" loading={periodFormLoading}>
                  Create Period
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default HrDashboard;
