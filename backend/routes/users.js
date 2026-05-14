const crypto = require("crypto");
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const { Resend } = require("resend");
const { getDB } = require("../db/connection");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "";
const RESET_CODE_TTL_MINUTES = 15;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;
const resendClient = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable");
}

function normalizeUsername(value) {
  return String(value || "").trim();
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function validateUsername(username) {
  if (!username) {
    return "Username is required";
  }

  if (!/^[a-zA-Z0-9._-]{3,32}$/.test(username)) {
    return "Username must be 3-32 characters and use only letters, numbers, dots, underscores, or hyphens";
  }

  return null;
}

function validateEmail(email) {
  if (!email) {
    return "Email is required";
  }

  if (!EMAIL_REGEX.test(email)) {
    return "Please enter a valid email address";
  }

  return null;
}

function validatePassword(password) {
  if (!password) {
    return "Password is required";
  }

  if (password.length < 8 || password.length > 72) {
    return "Password must be 8-72 characters long";
  }

  return null;
}

function issueToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: "24h",
  });
}

function buildAuthResponse(user, message = "Login successful") {
  return {
    success: true,
    message,
    token: issueToken(user),
    user: {
      id: user.id,
      username: user.username,
      email: user.email || "",
    },
  };
}

function sha256(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

function generateResetCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function generateRandomPassword() {
  return crypto.randomBytes(24).toString("hex");
}

function sanitizeUsernameBase(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 24);
}

async function findUserByUsername(db, username) {
  const { data, error } = await db
    .from("users")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function findUserByEmail(db, email) {
  const { data, error } = await db
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function findUserByGoogleSub(db, googleSub) {
  const { data, error } = await db
    .from("users")
    .select("*")
    .eq("google_sub", googleSub)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function findUserByLoginIdentifier(db, identifier) {
  if (!identifier) return null;
  if (identifier.includes("@")) {
    return findUserByEmail(db, normalizeEmail(identifier));
  }
  return findUserByUsername(db, normalizeUsername(identifier));
}

async function createUniqueUsernameFromEmail(db, email) {
  const localPart = normalizeEmail(email).split("@")[0] || "cook";
  const baseSeed = sanitizeUsernameBase(localPart) || "cook";
  const base = baseSeed.length >= 3 ? baseSeed : `${baseSeed}chef`.slice(0, 24);

  for (let index = 0; index < 10; index += 1) {
    const candidate = index === 0 ? base : `${base.slice(0, 24)}${index}`;
    const existing = await findUserByUsername(db, candidate);
    if (!existing) {
      return candidate;
    }
  }

  while (true) {
    const suffix = crypto.randomBytes(3).toString("hex");
    const candidate = `${base.slice(0, 20)}${suffix}`.slice(0, 32);
    const existing = await findUserByUsername(db, candidate);
    if (!existing) {
      return candidate;
    }
  }
}

async function sendPasswordResetCode(email, code) {
  if (!resendClient || !RESEND_FROM_EMAIL) {
    console.log(`[auth] Password reset code for ${email}: ${code}`);
    return {
      success: true,
      message: "Password reset code generated for local development. Check the backend logs.",
    };
  }

  const { error } = await resendClient.emails.send({
    from: RESEND_FROM_EMAIL,
    to: [email],
    subject: "Kitchen Hub password reset code",
    text: `Your Kitchen Hub password reset code is ${code}. It expires in ${RESET_CODE_TTL_MINUTES} minutes.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#243d2c">
        <h2 style="margin-bottom:8px;">Kitchen Hub</h2>
        <p>Your password reset code is:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:4px;margin:16px 0;">${code}</p>
        <p>This code expires in ${RESET_CODE_TTL_MINUTES} minutes.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(error.message || "Failed to send reset email");
  }

  return {
    success: true,
    message: "Password reset code sent. Check your email.",
  };
}

async function verifyGoogleCredential(credential) {
  if (!googleClient) {
    return { error: "Google login is not configured on the server yet." };
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload?.sub || !payload?.email) {
    return { error: "Google account data is incomplete." };
  }

  if (!payload.email_verified) {
    return { error: "Please use a verified Google account." };
  }

  return {
    profile: {
      googleSub: payload.sub,
      email: normalizeEmail(payload.email),
      name: payload.name || "",
    },
  };
}

function isValidResetCodeRecord(user, code) {
  if (!user || !user.password_reset_code_hash || !user.password_reset_code_expires_at) {
    return false;
  }

  const expiresAt = new Date(user.password_reset_code_expires_at).getTime();
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    return false;
  }

  return sha256(code) === user.password_reset_code_hash;
}

// Register User
router.post("/register", async (req, res) => {
  try {
    const username = normalizeUsername(req.body.username);
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");
    const db = getDB();

    const usernameError = validateUsername(username);
    if (usernameError) {
      return res.status(400).json({ success: false, message: usernameError });
    }

    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(400).json({ success: false, message: emailError });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ success: false, message: passwordError });
    }

    const existingUsername = await findUserByUsername(db, username);
    if (existingUsername) {
      return res.status(400).json({ success: false, message: "Username already in use" });
    }

    const existingEmail = await findUserByEmail(db, email);
    if (existingEmail) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const { error: insertError } = await db.from("users").insert({
      username,
      email,
      password: hashed,
    });

    if (insertError) {
      throw insertError;
    }

    res.json({ success: true, message: "User registered" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Login User
router.post("/login", async (req, res) => {
  try {
    const identifier = normalizeUsername(req.body.username);
    const password = String(req.body.password || "");
    const db = getDB();

    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: "Email or username and password are required" });
    }

    const user = await findUserByLoginIdentifier(db, identifier);
    if (!user || !user.password) {
      return res.status(401).json({ success: false, error: "Invalid login credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Invalid login credentials" });
    }

    res.json(buildAuthResponse(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

router.post("/google-login", async (req, res) => {
  try {
    const credential = String(req.body.credential || "");
    if (!credential) {
      return res.status(400).json({ success: false, error: "Google credential is required" });
    }

    const verification = await verifyGoogleCredential(credential);
    if (verification.error) {
      return res.status(400).json({ success: false, error: verification.error });
    }

    const db = getDB();
    const { googleSub, email } = verification.profile;
    let user = await findUserByGoogleSub(db, googleSub);

    if (!user) {
      user = await findUserByEmail(db, email);
    }

    if (!user) {
      const username = await createUniqueUsernameFromEmail(db, email);
      const password = await bcrypt.hash(generateRandomPassword(), 10);
      const { data: createdUser, error: insertError } = await db
        .from("users")
        .insert({
          username,
          email,
          google_sub: googleSub,
          password,
        })
        .select("*")
        .single();

      if (insertError) {
        throw insertError;
      }

      user = createdUser;
    } else {
      const updates = {};
      if (!user.email) updates.email = email;
      if (!user.google_sub) updates.google_sub = googleSub;

      if (Object.keys(updates).length > 0) {
        const { data: updatedUser, error: updateError } = await db
          .from("users")
          .update(updates)
          .eq("id", user.id)
          .select("*")
          .single();

        if (updateError) {
          throw updateError;
        }

        user = updatedUser;
      }
    }

    res.json(buildAuthResponse(user, "Google login successful"));
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Google login failed" });
  }
});

router.post("/password-reset/request", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(400).json({ success: false, error: emailError });
    }

    const db = getDB();
    const user = await findUserByEmail(db, email);
    if (!user) {
      return res.json({
        success: true,
        message: "If an account exists for that email, a reset code has been sent.",
      });
    }

    const code = generateResetCode();
    const codeHash = sha256(code);
    const expiresAt = new Date(Date.now() + RESET_CODE_TTL_MINUTES * 60 * 1000).toISOString();

    const { error: updateError } = await db
      .from("users")
      .update({
        password_reset_code_hash: codeHash,
        password_reset_code_expires_at: expiresAt,
      })
      .eq("id", user.id);

    if (updateError) {
      throw updateError;
    }

    const result = await sendPasswordResetCode(email, code);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Unable to start password reset" });
  }
});

router.post("/password-reset/verify", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const code = String(req.body.code || "").trim();

    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(400).json({ success: false, error: emailError });
    }

    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ success: false, error: "Reset code must be 6 digits" });
    }

    const db = getDB();
    const user = await findUserByEmail(db, email);

    if (!isValidResetCodeRecord(user, code)) {
      return res.status(400).json({ success: false, error: "Invalid or expired reset code" });
    }

    res.json({ success: true, message: "Code verified." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Unable to verify reset code" });
  }
});

router.post("/password-reset/confirm", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const code = String(req.body.code || "").trim();
    const newPassword = String(req.body.newPassword || "");

    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(400).json({ success: false, error: emailError });
    }

    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ success: false, error: "Reset code must be 6 digits" });
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ success: false, error: passwordError });
    }

    const db = getDB();
    const user = await findUserByEmail(db, email);
    if (!isValidResetCodeRecord(user, code)) {
      return res.status(400).json({ success: false, error: "Invalid or expired reset code" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const { error: updateError } = await db
      .from("users")
      .update({
        password: passwordHash,
        password_reset_code_hash: null,
        password_reset_code_expires_at: null,
      })
      .eq("id", user.id);

    if (updateError) {
      throw updateError;
    }

    res.json({ success: true, message: "Password has been reset successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Unable to reset password" });
  }
});

// Protected Route
router.get("/me", requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const { data: user, error } = await db
      .from("users")
      .select("id, username, email")
      .eq("id", req.user.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      user: user || {
        id: req.user.id,
        username: req.user.username,
        email: "",
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
