import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios";

// Verifies the token on mount, then lets the user choose a new password.
function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("checking"); // "checking" | "valid" | "invalid"
  const [statusMessage, setStatusMessage] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const verify = async () => {
      try {
        const { data } = await api.get(`/auth/verify-reset-token/${token}`);
        if (cancelled) return;
        if (data.valid) {
          setStatus("valid");
          setMaskedEmail(data.email || "");
        } else {
          setStatus("invalid");
          setStatusMessage(data.message || "Invalid or expired link.");
        }
      } catch (err) {
        if (cancelled) return;
        setStatus("invalid");
        setStatusMessage(
          err.response?.data?.message ||
            "This password reset link is invalid or has expired."
        );
      }
    };
    verify();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      return toast.warn("Password must be at least 6 characters long.");
    }
    if (form.password !== form.confirm) {
      return toast.warn("Passwords do not match.");
    }
    setSubmitting(true);
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, {
        password: form.password,
      });
      toast.success(data.message || "Password updated.");
      setDone(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Could not reset password. Please request a new link.";
      toast.error(msg);
      if (err.response?.status === 400) {
        // token likely expired between page load and submit
        setStatus("invalid");
        setStatusMessage(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card text-center">
        <div className="brand-icon">
          <i className="bi bi-shield-lock" />
        </div>
        <h2>Reset password</h2>

        {status === "checking" && (
          <div className="py-4">
            <div className="spinner-border text-primary" role="status" />
            <p className="text-muted mt-3 mb-0">Verifying your reset link...</p>
          </div>
        )}

        {status === "invalid" && (
          <>
            <div className="alert alert-danger status-msg mt-3" role="alert">
              <i className="bi bi-exclamation-triangle-fill" />
              <span>{statusMessage}</span>
            </div>
            <p className="text-muted">
              Reset links are valid for a limited time. Please request a new
              one.
            </p>
            <Link to="/forgot-password" className="btn btn-brand w-100">
              <i className="bi bi-arrow-clockwise me-2" />
              Request a new link
            </Link>
            <p className="mt-3 mb-0">
              <Link to="/login" className="muted-link">
                Back to sign in
              </Link>
            </p>
          </>
        )}

        {status === "valid" && !done && (
          <>
            <p className="subtitle">
              {maskedEmail
                ? `Choose a new password for ${maskedEmail}.`
                : "Choose a new password for your account."}
            </p>

            <form onSubmit={onSubmit} className="text-start" noValidate>
              <div className="mb-3 input-icon">
                <i className="bi bi-key" />
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  className="form-control"
                  placeholder="New password (min 6 characters)"
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

              <div className="mb-3 input-icon">
                <i className="bi bi-check2-square" />
                <input
                  type={showPass ? "text" : "password"}
                  name="confirm"
                  className="form-control"
                  placeholder="Confirm new password"
                  value={form.confirm}
                  onChange={onChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-brand w-100"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-shield-check me-2" />
                    Update password
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {done && (
          <div className="alert alert-success status-msg mt-3" role="alert">
            <i className="bi bi-check-circle-fill" />
            <span>Password updated! Redirecting you to sign in...</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
