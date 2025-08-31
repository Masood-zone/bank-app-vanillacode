import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db.js";
import dotenv from "dotenv";
import { verifyToken } from "../middleware/auth.js";

dotenv.config();
const router = express.Router();

router.post("/register", verifyToken, async (req, res) => {
  const { username, name, email, password, role, adminId } = req.body;
  if (!username || !name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Ensure only admins can create users
    const [[admin]] = await pool.execute(
      "SELECT role FROM admins WHERE id = ?",
      [adminId]
    );
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }

    // Check if name exists
    const [existing] = await pool.execute(
      "SELECT id FROM users WHERE name = ?",
      [name]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "Name already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.execute(
      "INSERT INTO users (name, email, password, role, balance) VALUES (?, ?, ?, ?, 0)",
      [name, email, hashedPassword, role]
    );

    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Unified login for Admins and Users
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. Try admin first
    const [adminRows] = await pool.execute(
      "SELECT id, username, password, role FROM admins WHERE username = ?",
      [username]
    );

    let user = null;
    let role = null;

    if (adminRows.length > 0) {
      user = adminRows[0];
      role = "admin";
    } else {
      // 2. Otherwise check users table
      const [userRows] = await pool.execute(
        "SELECT id, name, password, role FROM users WHERE name = ?",
        [username]
      );

      if (userRows.length > 0) {
        user = userRows[0];
        role = "user";
      }
    }

    // If no match
    if (!user) return res.status(401).json({ message: "User not found" });

    // 3. Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // 4. Generate JWT
    const token = jwt.sign(
      { id: user.id, role: role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username || user.name,
        role: role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/users", verifyToken, async (req, res) => {
  const [rows] = await pool.execute(
    "SELECT id, name, email, balance, role FROM users"
  );
  res.json(rows);
});

export default router;
