import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../shared/layouts/AuthLayout.jsx";
import TextField from "../../shared/components/ui/TextField.jsx";
import Button from "../../shared/components/ui/Button.jsx";
import Alert from "../../shared/components/ui/Alert.jsx";
import { useAuth } from "../../auth/AuthContext.jsx";
import "./AuthForm.css";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
  role: "EMPLOYEE",
  agree: false,
};

function validate(form) {
  const errors = {};
  if (!form.firstName.trim()) errors.firstName = "First name is required.";
  if (!form.lastName.trim()) errors.lastName = "Last name is required.";

  if (!form.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!form.username.trim()) {
    errors.username = "Username is required.";
  } else if (form.username.trim().length < 3) {
    errors.username = "Username must be at least 3 characters.";
  }

  if (!form.password) {
    errors.password = "Password is required.";
  } else if (form.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (form.confirmPassword !== form.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  if (!form.agree) {
    errors.agree = true;
  }

  return errors;
}

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    const value = field === "agree" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      await register(form);
      setSuccess(true);
      setTimeout(() => navigate("/login", { replace: true }), 1400);
    } catch (err) {
      setSubmitError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join PayLink to manage or view payroll with ease."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="auth-form__link">
            Sign in
          </Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {submitError && <Alert tone="error">{submitError}</Alert>}
        {success && (
          <Alert tone="success">
            Account created! Redirecting you to sign in…
          </Alert>
        )}

        <div className="auth-form__name-row">
          <TextField
            label="First name"
            placeholder="Juan"
            value={form.firstName}
            onChange={handleChange("firstName")}
            error={errors.firstName}
            required
          />
          <TextField
            label="Last name"
            placeholder="Dela Cruz"
            value={form.lastName}
            onChange={handleChange("lastName")}
            error={errors.lastName}
            required
          />
        </div>

        <TextField
          label="Email address"
          type="email"
          placeholder="you@company.com"
          value={form.email}
          onChange={handleChange("email")}
          error={errors.email}
          autoComplete="email"
          required
        />

        <TextField
          label="Username"
          placeholder="Choose a username"
          value={form.username}
          onChange={handleChange("username")}
          error={errors.username}
          autoComplete="username"
          required
        />

        <div className="auth-form__name-row">
          <TextField
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={handleChange("password")}
            error={errors.password}
            autoComplete="new-password"
            required
          />
          <TextField
            label="Confirm password"
            type="password"
            placeholder="Re-enter password"
            value={form.confirmPassword}
            onChange={handleChange("confirmPassword")}
            error={errors.confirmPassword}
            autoComplete="new-password"
            required
          />
        </div>

        <div className="field">
          <label className="field__label">I am registering as</label>
          <div className="auth-form__role-group">
            <button
              type="button"
              className={`auth-form__role-card ${form.role === "EMPLOYEE" ? "auth-form__role-card--active" : ""}`}
              onClick={() => setForm((f) => ({ ...f, role: "EMPLOYEE" }))}
            >
              <span className="auth-form__role-title">Employee</span>
              <span className="auth-form__role-desc">
                View my payslips & payroll history
              </span>
            </button>
            <button
              type="button"
              className={`auth-form__role-card ${form.role === "ADMIN" ? "auth-form__role-card--active" : ""}`}
              onClick={() => setForm((f) => ({ ...f, role: "ADMIN" }))}
            >
              <span className="auth-form__role-title">HR / Admin</span>
              <span className="auth-form__role-desc">
                Manage employees & process payroll
              </span>
            </button>
          </div>
        </div>

        <label className="auth-form__terms">
          <input
            type="checkbox"
            checked={form.agree}
            onChange={handleChange("agree")}
          />
          <span>
            I agree to the PayLink Terms of Service and acknowledge the Privacy
            Policy regarding payroll data handling.
          </span>
        </label>
        {errors.agree && (
          <Alert tone="warning">Please accept the terms to continue.</Alert>
        )}

        <Button type="submit" fullWidth loading={loading}>
          Create Account
        </Button>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
