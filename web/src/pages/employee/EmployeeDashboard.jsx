import { useState, useEffect } from "react";
import DashboardLayout from "../../shared/layouts/DashboardLayout.jsx";
import StatCard from "../../shared/components/ui/StatCard.jsx";
import Panel from "../../shared/components/ui/Panel.jsx";
import DataTable from "../../shared/components/ui/DataTable.jsx";
import Badge from "../../shared/components/ui/Badge.jsx";
import Button from "../../shared/components/ui/Button.jsx";
import { useAuth } from "../../features/auth/AuthContext.jsx";
import { getMyPayrolls } from "../../api/payroll.js";
import { getMyPayslips } from "../../api/payslips.js";
import "./Dashboard.css";

const currency = (v) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(
    v ?? 0,
  );

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
function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect
        x="4"
        y="5.5"
        width="16"
        height="14.5"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M4 9.5h16M8 3.5v3M16 3.5v3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 4v11m0 0 4-4m-4 4-4-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 19.5h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

const NAV_ITEMS = [
  { key: "overview", label: "Overview", icon: <GridIcon /> },
  { key: "payslips", label: "My Payslips", icon: <DocIcon /> },
  { key: "history", label: "Payroll History", icon: <WalletIcon /> },
];

const statusTone = (status) =>
  status === "PROCESSED"
    ? "success"
    : status === "DRAFT"
      ? "warning"
      : "neutral";

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [activeKey, setActiveKey] = useState("overview");
  const [payrolls, setPayrolls] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyPayrolls(), getMyPayslips()])
      .then(([pr, ps]) => {
        setPayrolls(pr);
        setPayslips(ps);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const latestPayslip = payslips[0] ?? null;
  const latestNetPay = payrolls[0]?.netPay ?? 0;
  const ytdNetPay = payrolls
    .slice(0, 4)
    .reduce((sum, r) => sum + (r.netPay ?? 0), 0);
  const displayName =
    user?.firstName?.trim() ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "there";

  return (
    <DashboardLayout
      navItems={NAV_ITEMS}
      activeKey={activeKey}
      onNavigate={setActiveKey}
      pageTitle={`Welcome back, ${displayName}`}
      pageSubtitle={user?.position}
      headerActions={
        <Button variant="gold" size="sm" icon={<DownloadIcon />}>
          Download Payslip
        </Button>
      }
    >
      {loading && <p style={{ opacity: 0.5 }}>Loading…</p>}

      {activeKey === "overview" && (
        <>
          {!loading && payrolls.length === 0 && payslips.length === 0 && (
            <Panel
              title="No payroll data yet"
              subtitle="Your HR/admin team still needs to process your first payroll for the selected pay period."
            >
              <p style={{ opacity: 0.7, margin: 0 }}>
                Once payroll is processed, your latest net pay, payslip
                breakdown, and payroll history will appear here.
              </p>
            </Panel>
          )}

          <div className="dash-grid dash-grid--stats">
            <StatCard
              label="Latest Net Pay"
              value={currency(latestNetPay)}
              tone="gold"
              icon={<WalletIcon />}
              trend={payrolls[0]?.payPeriodLabel}
            />
            <StatCard
              label="Payslips Available"
              value={payslips.length}
              tone="maroon"
              icon={<DocIcon />}
            />
            <StatCard
              label="Net Pay (Last 4 Periods)"
              value={currency(ytdNetPay)}
              tone="neutral"
              icon={<CalendarIcon />}
            />
            <StatCard
              label="Employment Status"
              value={user?.employeeNumber ? "Active" : "—"}
              tone="maroon"
              icon={<GridIcon />}
            />
          </div>

          <div className="dash-grid dash-grid--split">
            {latestPayslip ? (
              <Panel
                title="Latest Payslip"
                subtitle={`${latestPayslip.periodLabel} · Issued ${new Date(latestPayslip.issuedAt).toLocaleDateString()}`}
                actions={
                  <Button variant="ghost" size="sm" icon={<DownloadIcon />}>
                    Download
                  </Button>
                }
              >
                <div className="payslip">
                  <div className="payslip__col">
                    <p className="payslip__col-title">Earnings</p>
                    <ul className="payslip__list">
                      <li>
                        <span>Basic Pay</span>
                        <span>{currency(latestPayslip.basicPay)}</span>
                      </li>
                      {latestPayslip.allowances?.map((item) => (
                        <li key={item.id}>
                          <span>{item.label}</span>
                          <span>{currency(item.amount)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="payslip__col">
                    <p className="payslip__col-title">Deductions</p>
                    <ul className="payslip__list">
                      {latestPayslip.deductions?.map((item) => (
                        <li key={item.id}>
                          <span>{item.label}</span>
                          <span>-{currency(item.amount)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="payslip__summary">
                  <div>
                    <p className="payslip__summary-label">Gross Pay</p>
                    <p className="payslip__summary-value">
                      {currency(latestPayslip.grossPay)}
                    </p>
                  </div>
                  <div>
                    <p className="payslip__summary-label">Total Deductions</p>
                    <p className="payslip__summary-value payslip__summary-value--neg">
                      -{currency(latestPayslip.totalDeductions)}
                    </p>
                  </div>
                  <div className="payslip__summary-net">
                    <p className="payslip__summary-label">Net Pay</p>
                    <p className="payslip__summary-value payslip__summary-value--net">
                      {currency(latestPayslip.netPay)}
                    </p>
                  </div>
                </div>
              </Panel>
            ) : (
              <Panel title="Latest Payslip" subtitle="No payslip available yet">
                <p style={{ opacity: 0.5, padding: 24, textAlign: "center" }}>
                  No payslips issued yet.
                </p>
              </Panel>
            )}

            <Panel title="Quick Info" subtitle="Your employment details">
              <ul className="info-list">
                <li>
                  <span className="info-list__label">Employee ID</span>
                  <span className="info-list__value">
                    {user?.employeeNumber}
                  </span>
                </li>
                <li>
                  <span className="info-list__label">Department</span>
                  <span className="info-list__value">{user?.department}</span>
                </li>
                <li>
                  <span className="info-list__label">Position</span>
                  <span className="info-list__value">{user?.position}</span>
                </li>
                <li>
                  <span className="info-list__label">Email</span>
                  <span className="info-list__value">{user?.email}</span>
                </li>
              </ul>
            </Panel>
          </div>
        </>
      )}

      {activeKey === "payslips" && (
        <Panel title="My Payslips" subtitle="All your issued payslips">
          <DataTable
            columns={[
              { key: "periodLabel", header: "Pay Period" },
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
              No payslips yet.
            </p>
          )}
        </Panel>
      )}

      {activeKey === "history" && (
        <Panel title="Payroll History" subtitle="Your last pay periods">
          <DataTable
            columns={[
              { key: "payPeriodLabel", header: "Pay Period" },
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
                  <Badge
                    tone={r.status === "PROCESSED" ? "success" : "warning"}
                    dot
                  >
                    {r.status}
                  </Badge>
                ),
              },
            ]}
            rows={payrolls}
          />
        </Panel>
      )}
    </DashboardLayout>
  );
};

export default EmployeeDashboard;
