const nodemailer = require("nodemailer");

const buildTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT) || 465,
    secure: String(process.env.EMAIL_SECURE || "true") === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Render's free tier blocks outbound SMTP (ports 25/465/587), so in production
// we send via Brevo's HTTPS API. Locally (no BREVO_API_KEY) we still use SMTP.
const sendViaBrevo = async ({ to, subject, html, text }) => {
  const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { email: fromEmail, name: "Password Reset" },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo API ${res.status}: ${body}`);
  }
  return res.json();
};

const sendEmail = async ({ to, subject, html, text }) => {
  if (process.env.BREVO_API_KEY) {
    return sendViaBrevo({ to, subject, html, text });
  }
  const transporter = buildTransporter();
  return transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  });
};

const buildResetEmail = ({ name, resetUrl, expiryMinutes }) => {
  const safeName = name || "there";
  const html = `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #2c3e50;">
    <h2 style="color:#0d6efd; margin-bottom: 8px;">Reset your password</h2>
    <p>Hi ${safeName},</p>
    <p>We received a request to reset the password for your account. Click the button below to choose a new one.</p>
    <p style="text-align:center; margin: 28px 0;">
      <a href="${resetUrl}"
         style="background:#0d6efd; color:#fff; padding:12px 24px; border-radius:6px;
                text-decoration:none; font-weight:bold; display:inline-block;">
        Reset Password
      </a>
    </p>
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all;"><a href="${resetUrl}">${resetUrl}</a></p>
    <p><strong>This link will expire in ${expiryMinutes} minutes.</strong></p>
    <hr style="border:none; border-top:1px solid #e0e0e0; margin: 24px 0;">
    <p style="font-size: 12px; color:#7f8c8d;">
      If you didn't request a password reset, you can safely ignore this email.
    </p>
  </div>`;
  const text = `Hi ${safeName},

We received a request to reset your password. Use the link below (valid for ${expiryMinutes} minutes):
${resetUrl}

If you didn't request this, ignore this email.`;
  return { html, text };
};

module.exports = { sendEmail, buildResetEmail };
