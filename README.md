# Password Reset Flow

A full-stack password reset application with email verification, link expiry, and secure token storage.

- **Frontend:** React (Vite) + Bootstrap 5 + Bootstrap Icons + Google Fonts (Poppins)
- **Backend:** Node.js + Express + MongoDB (Mongoose) + Nodemailer
- **Security:** Reset tokens are random 32-byte hex strings; only their SHA-256 hash is stored, and they expire after 15 minutes.
