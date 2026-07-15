import { useMemo, useState } from "react";
import DataTable from "../../../shared/components/ui/DataTable.jsx";
import Badge from "../../../shared/components/ui/Badge.jsx";
import Button from "../../../shared/components/ui/Button.jsx";
import Panel from "../../../shared/components/ui/Panel.jsx";
import { DownloadIcon } from "../../../shared/icons/index.jsx";
import { GeneratePayslipAction } from "../../payslips/components/GeneratePayslipAction.jsx";

const currency = (v) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(
    v ?? 0,
  );

const statusTone = (s) =>
  s === "PROCESSED" ? "success" : s === "DRAFT" ? "warning" : "neutral";

const getDeductionAmount = (items, label) => {
  const value = (items ?? [])
    .filter((item) => item.itemType === "DEDUCTION" && item.label === label)
    .reduce((sum, item) => sum + Number(item.amount ?? 0), 0);
  return round2(value);
};

const escapeCsvCell = (value) => {
  const text = String(value ?? "");
  if (text.includes('"') || text.includes(",") || text.includes("\n")) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
};

const buildPayrollCsv = (payrolls) => {
  const headers = [
    "Employee Name",
    "Employee Number",
    "Pay Period",
    "Status",
    "Gross Pay",
    "SSS Contribution",
    "PhilHealth Contribution",
    "Pag-IBIG Contribution",
    "Withholding Tax",
    "Additional Deductions",
    "Total Deductions",
    "Net Pay",
    "Processed At",
  ];

  const rows = payrolls.map((payroll) => {
    const sss = getDeductionAmount(payroll.items, "SSS Contribution");
    const philhealth = getDeductionAmount(
      payroll.items,
      "PhilHealth Contribution",
    );
    const pagibig = getDeductionAmount(payroll.items, "Pag-IBIG Contribution");
    const tax = getDeductionAmount(payroll.items, "Withholding Tax");
    const statutory = round2(sss + philhealth + pagibig + tax);
    const additionalDeductions = round2(
      Number(payroll.totalDeductions ?? 0) - statutory,
    );

    return [
      payroll.employeeName,
      payroll.employeeNumber,
      payroll.payPeriodLabel,
      payroll.status,
      round2(payroll.grossPay ?? 0).toFixed(2),
      sss.toFixed(2),
      philhealth.toFixed(2),
      pagibig.toFixed(2),
      tax.toFixed(2),
      additionalDeductions.toFixed(2),
      round2(payroll.totalDeductions ?? 0).toFixed(2),
      round2(payroll.netPay ?? 0).toFixed(2),
      payroll.processedAt ?? "",
    ];
  });

  const lines = [headers, ...rows].map((line) =>
    line.map(escapeCsvCell).join(","),
  );
  return lines.join("\n");
};

const downloadTextFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

const round2 = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const tableScrollStyle = {
  maxHeight: 360,
  overflowY: "auto",
};

const countDaysInclusive = (startDate, endDate) => {
  if (!startDate || !endDate) return 30;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 30;
  const millisPerDay = 1000 * 60 * 60 * 24;
  return Math.max(1, Math.floor((end - start) / millisPerDay) + 1);
};

const computeSssMonthly = (salary) => {
  const clipped = Math.max(4250, Math.min(30000, salary));
  const roundedBracket = Math.max(
    4500,
    Math.min(30000, Math.round(clipped / 500) * 500),
  );
  return round2(roundedBracket * 0.045);
};

const computePhilhealthMonthly = (salary) => {
  const clipped = Math.max(10000, Math.min(100000, salary));
  return round2(clipped * 0.025);
};

const computePagibigMonthly = (salary) => {
  if (salary <= 1500) return round2(salary * 0.01);
  return round2(Math.min(salary * 0.02, 100));
};

const computeTaxMonthly = (salary, sss, philhealth, pagibig) => {
  const taxable = salary - sss - philhealth - pagibig;
  if (taxable <= 20833) return 0;
  if (taxable <= 33333) return round2((taxable - 20833) * 0.2);
  if (taxable <= 66667) return round2(2500 + (taxable - 33333) * 0.25);
  if (taxable <= 166667) return round2(10833.33 + (taxable - 66667) * 0.3);
  if (taxable <= 666667) return round2(40833.33 + (taxable - 166667) * 0.32);
  return round2(200833.33 + (taxable - 666667) * 0.35);
};

const estimatePreview = (basicRate, startDate, endDate, additionalItems) => {
  const monthlyBasicRate = Number(basicRate ?? 0);
  const days = countDaysInclusive(startDate, endDate);
  const ratio = days / 30;

  const normalizedItems = additionalItems
    .map((item) => ({
      itemType: item.itemType,
      label: String(item.label ?? "").trim(),
      amount: Number(item.amount),
    }))
    .filter(
      (item) => item.label && Number.isFinite(item.amount) && item.amount > 0,
    );

  const extraAllowances = normalizedItems
    .filter((item) => item.itemType === "ALLOWANCE")
    .reduce((sum, item) => sum + item.amount, 0);

  const extraDeductions = normalizedItems
    .filter((item) => item.itemType === "DEDUCTION")
    .reduce((sum, item) => sum + item.amount, 0);

  const basicPay = round2(monthlyBasicRate * ratio);
  const grossPay = round2(basicPay + extraAllowances);

  const sssMonthly = computeSssMonthly(monthlyBasicRate);
  const philhealthMonthly = computePhilhealthMonthly(monthlyBasicRate);
  const pagibigMonthly = computePagibigMonthly(monthlyBasicRate);
  const taxMonthly = computeTaxMonthly(
    monthlyBasicRate,
    sssMonthly,
    philhealthMonthly,
    pagibigMonthly,
  );

  const sss = round2(sssMonthly * ratio);
  const philhealth = round2(philhealthMonthly * ratio);
  const pagibig = round2(pagibigMonthly * ratio);
  const withholdingTax = round2(taxMonthly * ratio);

  const statutory = [
    { label: "SSS Contribution", amount: sss },
    { label: "PhilHealth Contribution", amount: philhealth },
    { label: "Pag-IBIG Contribution", amount: pagibig },
    { label: "Withholding Tax", amount: withholdingTax },
  ];
  const statutoryTotal = round2(
    statutory.reduce((sum, item) => sum + item.amount, 0),
  );
  const totalDeductions = round2(statutoryTotal + extraDeductions);
  const netPay = round2(grossPay - totalDeductions);

  return {
    days,
    ratio,
    basicPay,
    grossPay,
    statutory,
    statutoryTotal,
    extraAllowances: round2(extraAllowances),
    extraDeductions: round2(extraDeductions),
    totalDeductions,
    netPay,
    additionalItems: normalizedItems,
  };
};

export function PayrollTable({
  employees,
  payrolls,
  payPeriod,
  processLoading,
  onProcess,
}) {
  const [previewEmployee, setPreviewEmployee] = useState(null);
  const [additionalItems, setAdditionalItems] = useState([]);

  const preview = useMemo(() => {
    if (!previewEmployee || !payPeriod) return null;
    return estimatePreview(
      previewEmployee.basicRate,
      payPeriod.startDate,
      payPeriod.endDate,
      additionalItems,
    );
  }, [previewEmployee, payPeriod, additionalItems]);

  const openPreview = (employee) => {
    setPreviewEmployee(employee);
    setAdditionalItems([]);
  };

  const addItem = (itemType) => {
    setAdditionalItems((prev) => [
      ...prev,
      { itemType, label: "", amount: "" },
    ]);
  };

  const updateItem = (index, field, value) => {
    setAdditionalItems((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const removeItem = (index) => {
    setAdditionalItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const closePreview = () => {
    setPreviewEmployee(null);
    setAdditionalItems([]);
  };

  const handleConfirmProcess = async () => {
    if (!previewEmployee || !preview) return;
    await onProcess(previewEmployee.id, preview.additionalItems);
    closePreview();
  };

  const handleRunNow = async (employeeId) => {
    await onProcess(employeeId, []);
  };

  return (
    <>
      <Panel
        title="Process Payroll"
        subtitle="Computes SSS, PhilHealth, Pag-IBIG and withholding tax automatically"
      >
        <div style={tableScrollStyle}>
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
                  const existing = payrolls.find((p) => p.employeeId === r.id);
                  if (existing)
                    return (
                      <Badge tone={statusTone(existing.status)} dot>
                        {existing.status}
                      </Badge>
                    );
                  return (
                    <div style={{ display: "inline-flex", gap: 8, flexWrap: "wrap" }}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openPreview(r)}
                        disabled={!payPeriod || processLoading}
                      >
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        loading={processLoading}
                        onClick={() => handleRunNow(r.id)}
                        disabled={!payPeriod}
                      >
                        Run
                      </Button>
                    </div>
                  );
                },
              },
            ]}
            rows={employees.filter((e) => e.status === "ACTIVE")}
          />
        </div>
        {employees.filter((e) => e.status === "ACTIVE").length === 0 && (
          <p style={{ opacity: 0.5, textAlign: "center", padding: 24 }}>
            No active employees available for payroll processing.
          </p>
        )}
      </Panel>

      {previewEmployee && preview && (
        <div className="modal-overlay" onClick={closePreview}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{ width: 640, maxWidth: "96vw", maxHeight: "88vh", overflowY: "auto" }}
          >
            <h3 style={{ margin: "0 0 8px" }}>
              Payroll Preview: {previewEmployee.firstName}{" "}
              {previewEmployee.lastName}
            </h3>
            <p style={{ margin: "0 0 16px", opacity: 0.7, fontSize: 13 }}>
              This preview follows the current PH payroll rules and final values
              are computed by the backend.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                marginBottom: 16,
                fontSize: 13,
              }}
            >
              <div>
                Period days: <strong>{preview.days}</strong>
              </div>
              <div>
                Proration ratio: <strong>{preview.ratio.toFixed(4)}</strong>
              </div>
              <div>
                Basic pay (prorated):{" "}
                <strong>{currency(preview.basicPay)}</strong>
              </div>
              <div>
                Gross pay estimate:{" "}
                <strong>{currency(preview.grossPay)}</strong>
              </div>
            </div>

            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: 10,
                marginBottom: 12,
              }}
            >
              <strong style={{ fontSize: 13 }}>Additional Items</strong>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => addItem("ALLOWANCE")}
                >
                  Add Allowance
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => addItem("DEDUCTION")}
                >
                  Add Deduction
                </Button>
              </div>
              {additionalItems.length === 0 && (
                <p style={{ margin: "8px 0 0", opacity: 0.65, fontSize: 13 }}>
                  No extra items. Statutory deductions only.
                </p>
              )}
              {additionalItems.map((item, index) => (
                <div
                  key={`${item.itemType}-${index}`}
                  style={{
                    marginTop: 8,
                    display: "grid",
                    gridTemplateColumns: "140px 1fr 140px auto",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <select
                    value={item.itemType}
                    onChange={(e) =>
                      updateItem(index, "itemType", e.target.value)
                    }
                    style={{
                      padding: "6px 8px",
                      borderRadius: 6,
                      border: "1px solid #d1d5db",
                    }}
                  >
                    <option value="ALLOWANCE">Allowance</option>
                    <option value="DEDUCTION">Deduction</option>
                  </select>
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => updateItem(index, "label", e.target.value)}
                    placeholder="Label"
                    style={{
                      padding: "6px 8px",
                      borderRadius: 6,
                      border: "1px solid #d1d5db",
                    }}
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.amount}
                    onChange={(e) =>
                      updateItem(index, "amount", e.target.value)
                    }
                    placeholder="Amount"
                    style={{
                      padding: "6px 8px",
                      borderRadius: 6,
                      border: "1px solid #d1d5db",
                    }}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeItem(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>

            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: 10,
                marginBottom: 12,
              }}
            >
              <strong style={{ fontSize: 13 }}>Estimated Deductions</strong>
              <div
                style={{ marginTop: 8, display: "grid", gap: 6, fontSize: 13 }}
              >
                {preview.statutory.map((line) => (
                  <div
                    key={line.label}
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span>{line.label}</span>
                    <strong>{currency(line.amount)}</strong>
                  </div>
                ))}
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Additional Deductions</span>
                  <strong>{currency(preview.extraDeductions)}</strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderTop: "1px solid #e5e7eb",
                    paddingTop: 6,
                  }}
                >
                  <span>Total Deductions</span>
                  <strong>{currency(preview.totalDeductions)}</strong>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Net Pay Estimate</span>
                  <strong>{currency(preview.netPay)}</strong>
                </div>
              </div>
            </div>

            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <Button variant="ghost" size="sm" onClick={closePreview}>
                Cancel
              </Button>
              <Button
                size="sm"
                loading={processLoading}
                onClick={handleConfirmProcess}
              >
                Confirm & Process
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function PayrollResultsTable({ payrolls, onAfterGenerate }) {
  const [expandedPayrollId, setExpandedPayrollId] = useState(null);

  const handleDownloadAll = () => {
    if (payrolls.length === 0) return;
    const csv = buildPayrollCsv(payrolls);
    const periodLabel = String(payrolls[0]?.payPeriodLabel ?? "selected-period")
      .replaceAll(" ", "_")
      .replaceAll("/", "-")
      .replaceAll(":", "-")
      .replaceAll("–", "-");
    downloadTextFile(
      csv,
      `payroll-summary-${periodLabel}.csv`,
      "text/csv;charset=utf-8;",
    );
  };

  if (payrolls.length === 0) return null;
  return (
    <Panel
      title="Payroll Results"
      subtitle="Computed for this period"
      actions={
        <Button
          size="sm"
          variant="ghost"
          icon={<DownloadIcon />}
          onClick={handleDownloadAll}
        >
          Download All (CSV)
        </Button>
      }
      style={{ marginTop: 16 }}
    >
      <div style={tableScrollStyle}>
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
              key: "deductionBreakdown",
              header: "Breakdown",
              render: (r) => {
                const deductionItems = (r.items ?? []).filter(
                  (item) => item.itemType === "DEDUCTION",
                );
                const isExpanded = expandedPayrollId === r.id;
                return (
                  <div style={{ display: "grid", gap: 6 }}>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setExpandedPayrollId((prev) =>
                          prev === r.id ? null : r.id,
                        )
                      }
                    >
                      {isExpanded ? "Hide" : "Show"} Deductions
                    </Button>
                    {isExpanded && (
                      <div
                        style={{
                          border: "1px solid #e5e7eb",
                          borderRadius: 6,
                          padding: "6px 8px",
                          fontSize: 12,
                        }}
                      >
                        {deductionItems.length === 0 ? (
                          <span style={{ opacity: 0.7 }}>
                            No deduction line items.
                          </span>
                        ) : (
                          deductionItems.map((item) => (
                            <div
                              key={item.id ?? item.label}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 12,
                              }}
                            >
                              <span>{item.label}</span>
                              <strong>{currency(item.amount)}</strong>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              },
            },
            {
              key: "payslip",
              header: "Payslip",
              align: "center",
              render: (r) => (
                <GeneratePayslipAction
                  payrollId={r.id}
                  hasPayslip={r.hasPayslip}
                  onSuccess={onAfterGenerate}
                />
              ),
            },
          ]}
          rows={payrolls}
        />
      </div>
    </Panel>
  );
}
