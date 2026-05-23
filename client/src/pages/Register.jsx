import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      return toast.warn("Password must be at least 6 characters long.");
    }
    setSubmitting(true);
    try {
      const { data } = await api.post("/auth/register", form);
      toast.success(data.message || "Account created.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card text-center">
        <div className="brand-icon">
          <i className="bi bi-person-plus" />
        </div>
        <h2>Create account</h2>
        <p className="subtitle">Start by registering a new user</p>

        <form onSubmit={onSubmit} className="text-start" noValidate>
          <div className="mb-3 input-icon">
            <i className="bi bi-person" />
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="Full name"
              value={form.name}
              onChange={onChange}
              required
            />
          </div>

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
              placeholder="Password (min 6 characters)"
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

          <button
            type="submit"
            className="btn btn-brand w-100"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Creating account...
              </>
            ) : (
              <>
                <i className="bi bi-check2-circle me-2" />
                Create account
              </>
            )}
          </button>
        </form>

        <p className="mt-4 mb-0 text-muted">
          Already have an account?{" "}
          <Link to="/login" className="muted-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
