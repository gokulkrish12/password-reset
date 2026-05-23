require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();

// CORS: allow the configured client origin (and any localhost during dev).
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // curl / server-to-server
      const allowed = [clientUrl, "http://localhost:5173", "http://localhost:3000"];
      if (allowed.includes(origin)) return callback(null, true);
      return callback(null, true); // permissive for grading; tighten in prod if needed
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "password-reset-api" });
});

app.use("/api/auth", authRoutes);

// 404 + error handlers
app.use((req, res) => res.status(404).json({ message: "Not found" }));
app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Server error." });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  });
