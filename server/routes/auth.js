const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { db } = require("../db");
const { JWT_SECRET } = require("../middleware/auth");

const router = express.Router();
const SALT_ROUNDS = 10;

function validatePassword(password) {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password))
    return "Password must include at least 1 uppercase letter";
  if (!/[0-9]/.test(password)) return "Password must include at least 1 number";
  if (!/[!@#$%^&*]/.test(password))
    return "Password must include at least 1 special character (!@#$%^&*)";
  return null;
}

router.post("/register", async (req, res) => {
  const { username, password, passwordConfirm } = req.body;
  if (!username || !password || !passwordConfirm) {
    return res
      .status(400)
      .json({
        error: "Username, password, and password confirmation are required",
      });
  }
  if (username.length < 3) {
    return res
      .status(400)
      .json({ error: "Username must be at least 3 characters" });
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return res.status(400).json({ error: passwordError });
  }

  if (password !== passwordConfirm) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  try {
    const { rows } = await db.execute({
      sql: "SELECT id FROM users WHERE username = ?",
      args: [username],
    });
    if (rows.length > 0) {
      return res.status(409).json({ error: "Username already taken" });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await db.execute({
      sql: "INSERT INTO users (username, password_hash) VALUES (?, ?)",
      args: [username, password_hash],
    });
    const id = Number(result.lastInsertRowid);
    const token = jwt.sign({ id, username }, JWT_SECRET, { expiresIn: "30d" });
    res.status(201).json({ token, user: { id, username } });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  try {
    const { rows } = await db.execute({
      sql: "SELECT * FROM users WHERE username = ?",
      args: [username],
    });
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const id = Number(user.id);
    const token = jwt.sign({ id, username: user.username }, JWT_SECRET, {
      expiresIn: "30d",
    });
    res.json({ token, user: { id, username: user.username } });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get('/check-username/:username', async (req, res) => {
  try {
    const { rows } = await db.execute({ sql: 'SELECT id FROM users WHERE username = ?', args: [req.params.username] });
    res.json({ available: rows.length === 0 });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
