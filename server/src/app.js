const express = require("express");
const generateRoutes = require("./routes/generateRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Express server is connected!" });
});

// Routes
app.use("/api/v1/generate", generateRoutes);

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(process.env.NODE_ENV === "development" && { error: err, stack: err.stack }),
  });
});

module.exports = app;

