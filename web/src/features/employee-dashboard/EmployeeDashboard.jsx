import { useState, useEffect } from "react";
import DashboardLayout from "../../shared/layouts/DashboardLayout.jsx";
import Button from "../../shared/components/ui/Button.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { getMyPayrolls } from "../payroll/api.js";
import { usePayslips } from "../payslips/index.js";
import {
  GridIcon,
  WalletIcon,
  DocIcon,
  DownloadIcon,
} from "../../shared/icons/index.jsx";
import { EmployeeOverviewSection } from "./sections/EmployeeOverviewSection.jsx";
import { EmployeePayslipsSection } from "./sections/EmployeePayslipsSection.jsx";
import { EmployeePayrollHistorySection } from "./sections/EmployeePayrollHistorySection.jsx";
import "./EmployeeDashboard.css";

const NAV_ITEMS = [
  { key: "overview", label: "Overview", icon: <GridIcon /> },
  { key: "payslips", label: "My Payslips", icon: <DocIcon /> },
  { key: "history", label: "Payroll History", icon: <WalletIcon /> },
];

const EmployeeDashboard = () => {
  const { user } = useAuth();
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
      pageSubtitle={user?.position}      headerActions={
        <Button variant="gold" size="sm" icon={<DownloadIcon />}>
          Download Payslip
        </Button>
      }
    >
      {loading && <p style={{ opacity: 0.5 }}>Loading…</p>}

      {activeKey === "overview" && (
        <EmployeeOverviewSection
          loading={loading}
          payrolls={payrolls}
          payslips={payslips}
          user={user}
        />
      )}

      {activeKey === "payslips" && (
        <EmployeePayslipsSection payslips={payslips} />
      )}

      {activeKey === "history" && (
        <EmployeePayrollHistorySection payrolls={payrolls} />
      )}
    </DashboardLayout>
  );
};

export default EmployeeDashboard;
