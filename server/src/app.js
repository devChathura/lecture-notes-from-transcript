const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const generateRoutes = require("./routes/generateRoutes");

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const isLiveGenerationEnabled =
  process.env.ENABLE_LIVE_GENERATION === "true" ||
  (!isProduction && process.env.ENABLE_LIVE_GENERATION !== "false");
const configuredOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const developmentOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];
const allowedOrigins =
  configuredOrigins.length > 0 ? configuredOrigins : isProduction ? [] : developmentOrigins;
const parsePositiveInteger = (value, fallback) => {
  const parsedValue = Number.parseInt(value, 10);
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
};
const trustProxyHops = Number.parseInt(process.env.TRUST_PROXY_HOPS, 10);

app.disable("x-powered-by");

if (Number.isInteger(trustProxyHops) && trustProxyHops > 0) {
  app.set("trust proxy", trustProxyHops);
}

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
    ...(isProduction ? {} : { strictTransportSecurity: false }),
  }),
);
app.use(express.json({ limit: "32kb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "32kb",
    parameterLimit: 20,
  }),
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: false,
    maxAge: 600,
  }),
);

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Express server is connected!" });
});

// Routes
const generationLimiter = rateLimit({
  windowMs: parsePositiveInteger(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  limit: parsePositiveInteger(process.env.RATE_LIMIT_MAX, 10),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler(_req, res) {
    res.status(429).json({
      status: "fail",
      message: "Too many generation requests. Please try again later.",
    });
  },
});

app.use(
  "/api/v1/generate",
  (req, res, next) => {
    if (isLiveGenerationEnabled) {
      next();
      return;
    }

    res.status(503).json({
      status: "error",
      message: "Live AI generation is disabled on this deployment.",
    });
  },
  generationLimiter,
  generateRoutes,
);

app.use((req, res) => {
  res.status(404).json({
    status: "fail",
    message: "The requested endpoint was not found.",
  });
});

app.use((err, req, res, _next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    err.statusCode = 413;
    err.message = "The uploaded file is too large. Maximum size is 5MB.";
  } else if (
    ["LIMIT_FILE_COUNT", "LIMIT_FIELD_COUNT", "LIMIT_PART_COUNT", "LIMIT_UNEXPECTED_FILE"].includes(
      err.code,
    )
  ) {
    err.statusCode = 400;
    err.message = "The upload request is invalid.";
  } else if (err.type === "entity.too.large") {
    err.statusCode = 413;
    err.message = "The request body is too large.";
  }

  err.statusCode = err.statusCode || 500;
  err.status = err.status || (`${err.statusCode}`.startsWith("4") ? "fail" : "error");

  if (err.statusCode >= 500 && process.env.NODE_ENV !== "test") {
    const logEntry = {
      method: req.method,
      path: req.originalUrl,
      statusCode: err.statusCode,
      code: err.code,
      message: err.message,
    };

    if (process.env.NODE_ENV === "development") {
      console.error("[API error]", logEntry, err.stack);
    } else {
      console.error("[API error]", logEntry);
    }
  }

  const isOperational = err.isOperational === true;
  const publicMessage =
    !isProduction || isOperational || err.statusCode < 500
      ? err.message
      : "Something went wrong while processing the request.";

  res.status(err.statusCode).json({
    status: err.status,
    message: publicMessage,
    ...(process.env.NODE_ENV === "development" && {
      error: {
        name: err.name,
        code: err.code,
      },
      stack: err.stack,
    }),
  });
});

module.exports = app;
