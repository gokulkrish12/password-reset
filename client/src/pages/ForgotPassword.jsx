import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      toast.success(data.message || "Reset link sent.");
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not send reset link.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card text-center">
        <div className="brand-icon">
          <i className="bi bi-envelope-arrow-up" />
        </div>
        <h2>Forgot password?</h2>
        <p className="subtitle">
          Enter your email and we'll send you a link to reset your password.
        </p>

        {sent ? (
          <div className="alert alert-success status-msg" role="alert">
            <i className="bi bi-check-circle-fill" />
            <span>
              If an account exists for <strong>{email}</strong>, a reset link
              has been emailed. Check your inbox (and spam folder).
            </span>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="text-start" noValidate>
            <div className="mb-3 input-icon">
              <i className="bi bi-envelope" />
              <input
                type="email"
                className="form-control"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  Sending...
                </>
              ) : (
                <>
                  <i className="bi bi-send me-2" />
                  Send reset link
                </>
              )}
            </button>
          </form>
        )}

        <p className="mt-4 mb-0 text-muted">
          <Link to="/login" className="muted-link">
            <i className="bi bi-arrow-left me-1" />
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
