import Button from "../../../shared/components/ui/Button.jsx";

export function EditEmployeeModal({
  employee,
  rateValue,
  setRateValue,
  shiftStart,
  setShiftStart,
  shiftEnd,
  setShiftEnd,
  error,
  loading,
  onSubmit,
  onClose,
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: "0 0 16px" }}>Edit Employee Payroll Settings</h3>
        <p style={{ marginTop: 0, opacity: 0.7 }}>
          {employee?.firstName} {employee?.lastName} ({employee?.employeeNumber}
          )
        </p>
        {error && <p style={{ color: "red", marginBottom: 8 }}>{error}</p>}
        <form
          onSubmit={onSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 10 }}
        >
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>
              Basic Rate (PHP/month)
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={rateValue}
              onChange={(e) => setRateValue(e.target.value)}
              required
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #d1d5db",
              }}
            />
          </label>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Shift Start</span>
              <input
                type="time"
                value={shiftStart}
                onChange={(e) => setShiftStart(e.target.value)}
                required
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid #d1d5db",
                }}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Shift End</span>
              <input
                type="time"
                value={shiftEnd}
                onChange={(e) => setShiftEnd(e.target.value)}
                required
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid #d1d5db",
                }}
              />
            </label>
          </div>
          <p style={{ margin: 0, fontSize: 12, opacity: 0.65 }}>
            Shift schedule is used as a guide for hours and night differential
            during payroll processing.
          </p>
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              marginTop: 4,
            }}
          >
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={loading}>
              Save Settings
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
