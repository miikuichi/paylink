import Button from "../../../shared/components/ui/Button.jsx";

const FIELDS = [
  { label: "Username", field: "username" },
  { label: "Email", field: "email", type: "email" },
  { label: "Password", field: "password", type: "password" },
  { label: "First Name", field: "firstName" },
  { label: "Last Name", field: "lastName" },
  { label: "Position", field: "position" },
  { label: "Department", field: "department" },
  { label: "Basic Rate (₱/month)", field: "basicRate", type: "number" },
  { label: "Shift Start", field: "shiftStart", type: "time" },
  { label: "Shift End", field: "shiftEnd", type: "time" },
];

export function AddEmployeeModal({
  form,
  setForm,
  error,
  loading,
  onSubmit,
  onClose,
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: "0 0 16px" }}>New Employee</h3>
        {error && <p style={{ color: "red", marginBottom: 8 }}>{error}</p>}
        <form
          onSubmit={onSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 10 }}
        >
          {FIELDS.map(({ label, field, type = "text" }) => (
            <label
              key={field}
              style={{ display: "flex", flexDirection: "column", gap: 4 }}
            >
              <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
              <input
                type={type}
                value={form[field]}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [field]: e.target.value }))
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
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={loading}>
              Save Employee
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
