import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../shared/layouts/DashboardLayout.jsx";
import {
  useEmployees,
  AddEmployeeModal,
  EditEmployeeModal,
} from "../employees/index.js";
import { usePayroll, AddPayPeriodModal } from "../payroll/index.js";
import { usePayslips } from "../payslips/index.js";
import { useHolidays } from "../holidays/hooks/useHolidays.js";
import {
  GridIcon,
  PeopleIcon,
  WalletIcon,
  DocIcon,
  CalendarIcon,
} from "../../shared/icons/index.jsx";
import { HrOverviewSection } from "./sections/HrOverviewSection.jsx";
import { HrEmployeesSection } from "./sections/HrEmployeesSection.jsx";
import { HrPayrollSection } from "./sections/HrPayrollSection.jsx";
import { HrPayslipsSection } from "./sections/HrPayslipsSection.jsx";
import { HrCalendarSection } from "./sections/HrCalendarSection.jsx";
import ConfirmModal from "../../shared/components/ui/ConfirmModal.jsx";
import "./HrDashboard.css";

const NAV_ITEMS = [
  { key: "overview", label: "Overview", icon: <GridIcon /> },
  { key: "employees", label: "Employees", icon: <PeopleIcon /> },
  { key: "payroll", label: "Payroll", icon: <WalletIcon /> },
  { key: "payslips", label: "Payslips", icon: <DocIcon /> },
  { key: "calendar", label: "Calendar", icon: <CalendarIcon /> },
];

const HrDashboard = () => {
  const [activeKey, setActiveKey] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revokeTargetPayslipId, setRevokeTargetPayslipId] = useState(null);
  const [revokeLoading, setRevokeLoading] = useState(false);

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
    editShiftStart,
    setEditShiftStart,
    editShiftEnd,
    setEditShiftEnd,
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

  const { payslips, refreshPayslipsByPeriod, handleRevokePayslip } =
    usePayslips();
  const {
    holidays,
    loading: holidaysLoading,
    error: holidaysError,
    refreshHolidays,
    handleCreateHoliday,
    handleUpdateHoliday,
    handleDeactivateHoliday,
  } = useHolidays();
  const [includeInactiveHolidays, setIncludeInactiveHolidays] = useState(false);

  const loadBase = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [, periods] = await Promise.all([
        refreshEmployees(),
        refreshPayPeriods(),
        refreshHolidays(includeInactiveHolidays),
      ]);
      if (periods.length > 0)
        setSelectedPeriodId((prev) => prev ?? periods[0].id);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [
    refreshEmployees,
    refreshPayPeriods,
    refreshHolidays,
    includeInactiveHolidays,
  ]);

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

  const handleRevokeClick = (payslipId) => {
    setRevokeTargetPayslipId(payslipId);
  };

  const handleRevokeConfirm = async () => {
    if (!revokeTargetPayslipId) {
      return;
    }
    setRevokeLoading(true);
    try {
      await handleRevokePayslip(revokeTargetPayslipId, async () => {
        await Promise.all([
          refreshPayrolls(selectedPeriodId),
          refreshPayslipsByPeriod(selectedPeriodId),
        ]);
      });
      setRevokeTargetPayslipId(null);
    } finally {
      setRevokeLoading(false);
    }
  };

  const currentPeriod = payPeriods.find((p) => p.id === selectedPeriodId);
  const pageTitleByTab = {
    overview: "HR Overview",
    employees: "Employee Management",
    payroll: "Payroll Operations",
    payslips: "Payslip Records",
    calendar: "Calendar and Events",
  };
  const pageSubtitleByTab = {
    overview: currentPeriod
      ? `Pay period: ${currentPeriod.label}`
      : "No pay period selected",
    employees: "Manage employee profiles, rates, and shifts",
    payroll: "Process payroll and compute earnings and deductions",
    payslips: "Review and revoke issued payslips",
    calendar: "Plan holidays and track payroll timeline events",
  };

  return (
    <DashboardLayout
      navItems={NAV_ITEMS}
      activeKey={activeKey}
      onNavigate={setActiveKey}
      pageTitle={pageTitleByTab[activeKey] ?? "HR Dashboard"}
      pageSubtitle={pageSubtitleByTab[activeKey] ?? ""}
    >
      {error && <p style={{ color: "red", marginBottom: 12 }}>{error}</p>}
      {loading && <p style={{ opacity: 0.5 }}>Loading…</p>}

      {activeKey === "overview" && (
        <HrOverviewSection
          loading={loading}
          employees={employees}
          payrolls={payrolls}
          payPeriods={payPeriods}
          holidays={holidays}
          payslips={payslips}
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
          onProcessPayroll={(empId, options) =>
            handleProcessPayroll(empId, selectedPeriodId, options)
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
          onRevokePayslip={handleRevokeClick}
        />
      )}

      {activeKey === "calendar" && (
        <HrCalendarSection
          holidays={holidays}
          holidaysLoading={holidaysLoading}
          holidaysError={holidaysError}
          payPeriods={payPeriods}
          payrolls={payrolls}
          payslips={payslips}
          includeInactiveHolidays={includeInactiveHolidays}
          setIncludeInactiveHolidays={setIncludeInactiveHolidays}
          onRefreshHolidays={refreshHolidays}
          onCreateHoliday={handleCreateHoliday}
          onUpdateHoliday={handleUpdateHoliday}
          onDeactivateHoliday={handleDeactivateHoliday}
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
          shiftStart={editShiftStart}
          setShiftStart={setEditShiftStart}
          shiftEnd={editShiftEnd}
          setShiftEnd={setEditShiftEnd}
          error={editRateError}
          loading={editRateLoading}
          onSubmit={handleUpdateRate}
          onClose={() => setShowEditEmployee(false)}
        />
      )}

      <ConfirmModal
        open={Boolean(revokeTargetPayslipId)}
        title="Revoke Payslip"
        message="Revoke this payslip? This action is used for correcting payroll input issues."
        confirmLabel="Revoke"
        confirmTone="danger"
        loading={revokeLoading}
        onConfirm={handleRevokeConfirm}
        onCancel={() => {
          if (!revokeLoading) {
            setRevokeTargetPayslipId(null);
          }
        }}
      />
    </DashboardLayout>
  );
};

export default HrDashboard;
