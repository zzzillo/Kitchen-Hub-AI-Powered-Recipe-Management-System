require("dotenv").config(); // Load .env variables
const path = require("path");
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./db/connection");
const userRoutes = require("./routes/users");
const recipeRoutes = require("./routes/recipes");

const app = express();
const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET; // keep this in .env

connectDB();

// Middleware
app.use(cors({
    origin: "http://localhost:5173", // your frontend
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
})); // Allow frontend requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Backend with MongoDB Atlas is running!");
});

// Routes
app.use("/users", userRoutes);
app.use("/recipes", recipeRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
