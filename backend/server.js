const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { connectDB } = require("./db/connection");
const userRoutes = require("./routes/users");
const recipeRoutes = require("./routes/recipes");

const app = express();
const PORT = process.env.PORT;
const frontendOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (!PORT) {
  throw new Error("Missing PORT environment variable");
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many login attempts. Please try again later." },
});
const recipeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 180,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests. Please slow down." },
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(cors({
    origin: frontendOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

app.get("/", (req, res) => {
  res.send("Backend with Supabase is running!");
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// Routes
app.use("/auth/login", authLimiter);
app.use("/auth/register", authLimiter);
app.use("/auth/google-login", authLimiter);
app.use("/auth/password-reset/request", authLimiter);
app.use("/auth/password-reset/verify", authLimiter);
app.use("/auth/password-reset/confirm", authLimiter);
app.use("/auth", userRoutes);
app.use("/recipes", recipeLimiter, recipeRoutes);

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
