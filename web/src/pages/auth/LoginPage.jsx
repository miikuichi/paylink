import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout.jsx";
import TextField from "../../components/ui/TextField.jsx";
import Button from "../../components/ui/Button.jsx";
import Alert from "../../components/ui/Alert.jsx";
import { useAuth } from "../../auth/AuthContext.jsx";
import "./AuthForm.css";

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.7" />
    <path
      d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect
      x="5"
      y="10.5"
      width="14"
      height="9.5"
      rx="2.2"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M8 10.5V8a4 4 0 1 1 8 0v2.5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.username.trim() || !form.password) {
      setError("Please enter both your username and password.");
      return;
    }

    setLoading(true);
    try {
      const user = await login(form.username, form.password);
      navigate(
        user.role === "ADMIN" ? "/hr/dashboard" : "/employee/dashboard",
        { replace: true },
      );
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your PayLink dashboard."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link to="/register" className="auth-form__link">
            Create one
          </Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {error && <Alert tone="error">{error}</Alert>}

        <TextField
          label="Username"
          name="username"
          placeholder="e.g. hr.admin"
          icon={<UserIcon />}
          value={form.username}
          onChange={handleChange("username")}
          autoComplete="username"
          required
        />

        <TextField
          label="Password"
          type="password"
          name="password"
          placeholder="Enter your password"
          icon={<LockIcon />}
          value={form.password}
          onChange={handleChange("password")}
          autoComplete="current-password"
          required
        />

        <div className="auth-form__row-between">
          <label className="auth-form__checkbox">
            <input type="checkbox" />
            <span>Remember me</span>
          </label>
          <a href="#" className="auth-form__link auth-form__link--muted">
            Forgot password?
          </a>
        </div>

        <Button type="submit" fullWidth loading={loading}>
          Sign In
        </Button>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
