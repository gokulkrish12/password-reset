import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post("/auth/login", form);
      toast.success(data.message || "Logged in.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card text-center">
        <div className="brand-icon">
          <i className="bi bi-person-lock" />
        </div>
        <h2>Welcome back</h2>
        <p className="subtitle">Sign in to your account</p>

        <form onSubmit={onSubmit} className="text-start" noValidate>
          <div className="mb-3 input-icon">
            <i className="bi bi-envelope" />
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Email address"
              value={form.email}
              onChange={onChange}
              required
            />
          </div>

          <div className="mb-3 input-icon">
            <i className="bi bi-key" />
            <input
              type={showPass ? "text" : "password"}
              name="password"
              className="form-control"
              placeholder="Password"
              value={form.password}
              onChange={onChange}
              required
            />
            <button
              type="button"
              className="toggle-pass"
              onClick={() => setShowPass((v) => !v)}
              aria-label="Toggle password visibility"
            >
              <i className={`bi ${showPass ? "bi-eye-slash" : "bi-eye"}`} />
            </button>
          </div>

          <div className="d-flex justify-content-end mb-3">
            <Link to="/forgot-password" className="muted-link">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn-brand w-100"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Signing in...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right me-2" />
                Sign in
              </>
            )}
          </button>
        </form>

        <p className="mt-4 mb-0 text-muted">
          Don't have an account?{" "}
          <Link to="/register" className="muted-link">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
