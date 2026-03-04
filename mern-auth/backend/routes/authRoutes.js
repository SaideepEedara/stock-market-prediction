const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

/* ========= SIGNUP ========= */
router.post("/signup", async (req, res) => {
  try {
    console.log("🔥 Signup body:", req.body);

    let { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    email = email.trim().toLowerCase();

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      name: name.trim(),
      email,
      password: hashed,
    });

    return res.json({ msg: "Signup successful" });
  } catch (err) {
    console.error("❌ Signup error:", err);
    return res.status(500).json({ error: err.message });
  }
});

/* ========= LOGIN ========= */
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password required" });
    }

    email = email.trim().toLowerCase();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({ token });
  } catch (err) {
    console.error("❌ Login error:", err);
    return res.status(500).json({ error: err.message });
  }
});

/* ========= GOOGLE LOGIN ========= */
router.post("/google-login", async (req, res) => {
  try {
    let { name, email, googleId } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({ msg: "Google auth failed" });
    }

    email = email.trim().toLowerCase();

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name?.trim() || "Google User",
        email,
        googleId,
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({ token });
  } catch (err) {
    console.error("❌ Google login error:", err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;