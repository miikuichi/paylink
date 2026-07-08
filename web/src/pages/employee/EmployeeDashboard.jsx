import { useState, useEffect } from "react";
import DashboardLayout from "../../shared/layouts/DashboardLayout.jsx";
import StatCard from "../../shared/components/ui/StatCard.jsx";
import Panel from "../../shared/components/ui/Panel.jsx";
import Badge from "../../shared/components/ui/Badge.jsx";
import Button from "../../shared/components/ui/Button.jsx";
import { GridIcon, WalletIcon, DocIcon, CalendarIcon, DownloadIcon } from "../../shared/icons/index.jsx";
import { useAuth } from "../../features/auth/AuthContext.jsx";
import { getMyPayrolls } from "../../features/payroll/api.js";
import {
  usePayslips,
  EmployeePayslipTable,
  PayslipDetailCard,
} from "../../features/payslips/index.js";
import "./Dashboard.css";

const currency = (v) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(
    v ?? 0,
  );

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

const EmployeeDashboard = () => {  const { user } = useAuth();
  const [activeKey, setActiveKey] = useState("overview");
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);

  const { payslips, refreshMyPayslips } = usePayslips();

  useEffect(() => {
    Promise.all([getMyPayrolls(), refreshMyPayslips()])
      .then(([pr]) => {
        setPayrolls(pr);
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
          </div>          <div className="dash-grid dash-grid--split">
            <PayslipDetailCard payslip={latestPayslip} />

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
      )}      {activeKey === "payslips" && <EmployeePayslipTable payslips={payslips} />}

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
