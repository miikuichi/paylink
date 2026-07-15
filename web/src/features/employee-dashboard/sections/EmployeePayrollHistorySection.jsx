import DataTable from "../../../shared/components/ui/DataTable.jsx";
import Panel from "../../../shared/components/ui/Panel.jsx";

const currency = (v) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(
    v ?? 0,
  );

/**
 * Employee Payslip History section — displays historical payslip records.
 *
 * @param {object} props
 * @param {Array}  props.payslips
 */
export function EmployeePayrollHistorySection({ payslips }) {
  return (
    <Panel
      title="Payslip History"
      subtitle="Your issued payslips by pay period"
    >
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
          {
            key: "issuedAt",
            header: "Issued",
            render: (r) =>
              r.issuedAt
                ? new Date(r.issuedAt).toLocaleDateString()
                : "Pending",
          },
        ]}
        rows={payslips}
      />
    </Panel>
  );
}
