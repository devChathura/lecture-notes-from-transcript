const express = require("express");
const cors = require("cors");
const generateRoutes = require("./routes/generateRoutes");

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  }),
);

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Express server is connected!" });
});

// Routes
app.use("/api/v1/generate", generateRoutes);

app.use((err, req, res, _next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    err.statusCode = 413;
    err.message = "The uploaded file is too large. Maximum size is 5MB.";
  }

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(process.env.NODE_ENV === "development" && { error: err, stack: err.stack }),
  });
});

module.exports = app;
