import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../shared/layouts/DashboardLayout.jsx";
import Button from "../../shared/components/ui/Button.jsx";
import {
  useEmployees,
  AddEmployeeModal,
  EditEmployeeModal,
} from "../employees/index.js";
import { usePayroll, AddPayPeriodModal } from "../payroll/index.js";
import { usePayslips } from "../payslips/index.js";
import {
  GridIcon,
  PeopleIcon,
  WalletIcon,
  DocIcon,
  PlusIcon,
} from "../../shared/icons/index.jsx";
import { HrOverviewSection } from "./sections/HrOverviewSection.jsx";
import { HrEmployeesSection } from "./sections/HrEmployeesSection.jsx";
import { HrPayrollSection } from "./sections/HrPayrollSection.jsx";
import { HrPayslipsSection } from "./sections/HrPayslipsSection.jsx";
import "./HrDashboard.css";

const NAV_ITEMS = [
  { key: "overview", label: "Overview", icon: <GridIcon /> },
  { key: "employees", label: "Employees", icon: <PeopleIcon /> },
  { key: "payroll", label: "Payroll", icon: <WalletIcon /> },
  { key: "payslips", label: "Payslips", icon: <DocIcon /> },
];

const HrDashboard = () => {
  const [activeKey, setActiveKey] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const {
    employees,
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
    payrolls,
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

  const { payslips, refreshPayslipsByPeriod } = usePayslips();

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
      refreshPayslipsByPeriod(selectedPeriodId),
    ]).catch(() => {});
  }, [selectedPeriodId, refreshPayrolls, refreshPayslipsByPeriod]);

  const handleAfterGenerate = async () => {
    await Promise.all([
      refreshPayrolls(selectedPeriodId),
      refreshPayslipsByPeriod(selectedPeriodId),
    ]);
  };

  const currentPeriod = payPeriods.find((p) => p.id === selectedPeriodId);

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
        <HrOverviewSection
          loading={loading}
          employees={employees}
          payrolls={payrolls}
          payPeriods={payPeriods}
          selectedPeriodId={selectedPeriodId}
          onAddEmployee={() => setShowAddEmployee(true)}
        />
      )}

      {activeKey === "employees" && (
        <HrEmployeesSection
          employees={employees}
          onEditRate={openEditRate}
          onAddEmployee={() => setShowAddEmployee(true)}
        />
      )}

      {activeKey === "payroll" && (
        <HrPayrollSection
          employees={employees}
          payPeriods={payPeriods}
          selectedPeriodId={selectedPeriodId}
          currentPeriod={currentPeriod}
          onSelectPeriod={setSelectedPeriodId}
          payrolls={payrolls}
          processLoading={processLoading}
          processError={processError}
          onProcessPayroll={(empId, additionalItems) =>
            handleProcessPayroll(empId, selectedPeriodId, additionalItems)
          }
          onAddPeriod={() => setShowAddPeriod(true)}
          onAfterGenerate={handleAfterGenerate}
        />
      )}

      {activeKey === "payslips" && (
        <HrPayslipsSection
          payPeriods={payPeriods}
          selectedPeriodId={selectedPeriodId}
          onSelectPeriod={setSelectedPeriodId}
          payslips={payslips}
          onAddPeriod={() => setShowAddPeriod(true)}
          currentPeriod={currentPeriod}
        />
      )}

      {showAddEmployee && (
        <AddEmployeeModal
          form={empForm}
          setForm={setEmpForm}
          error={empFormError}
          loading={empFormLoading}
          onSubmit={handleAddEmployee}
          onClose={() => setShowAddEmployee(false)}
        />
      )}

      {showAddPeriod && (
        <AddPayPeriodModal
          form={periodForm}
          setForm={setPeriodForm}
          error={periodFormError}
          loading={periodFormLoading}
          onSubmit={handleAddPeriod}
          onClose={() => setShowAddPeriod(false)}
        />
      )}

      {showEditEmployee && (
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
