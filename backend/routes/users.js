const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { getDB } = require("../db/connection");

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// Register User
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const db = getDB();
    const collection = db.collection("users");

    // Check if username already exists
    const existing = await collection.findOne({ username });
    if (existing) {
      return res.status(400).json({ success: false, message: "Username already in use" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    const user = { username, password: hashed };
    await collection.insertOne(user);

    res.json({ success: true, message: "User registered" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Login User
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const db = getDB();
    const collection = db.collection("users");

    const user = await collection.findOne({ username });
    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Invalid username or password" });
    }

    // Create JWT
    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user._id, username: user.username },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Protected Route
router.get("/me", (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ success: true, user: decoded });
  } catch (err) {
    res.status(401).json({ success: false, error: "Invalid token" });
  }
});

module.exports = router;
