import express from "express";
import pool from "../db.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/analytics", verifyToken, async (req, res) => {
  try {
    const [[{ totalUsers }]] = await pool.execute(
      "SELECT COUNT(*) AS totalUsers FROM users"
    );
    const [[{ totalBalance }]] = await pool.execute(
      "SELECT SUM(balance) AS totalBalance FROM users"
    );
    const [[{ totalTransactions }]] = await pool.execute(
      "SELECT COUNT(*) AS totalTransactions FROM transactions"
    );

    res.json({
      totalUsers,
      totalBalance,
      totalTransactions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching analytics" });
  }
});

// ✅ Deposit money into a user's account
router.post("/deposit", verifyToken, async (req, res) => {
  const { userId, amount } = req.body;
  if (!userId || !amount)
    return res.status(400).json({ message: "Missing parameters" });

  try {
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    await conn.execute("UPDATE users SET balance = balance + ? WHERE id = ?", [
      amount,
      userId,
    ]);
    await conn.execute(
      "INSERT INTO transactions (user_id, type, amount) VALUES (?, 'deposit', ?)",
      [userId, amount]
    );

    await conn.commit();
    conn.release();

    res.json({ message: "Deposit successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error depositing" });
  }
});

// ✅ Withdraw money from a user's account
router.post("/withdraw", verifyToken, async (req, res) => {
  const { userId, amount } = req.body;
  if (!userId || !amount)
    return res.status(400).json({ message: "Missing parameters" });

  try {
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    // Check balance
    const [rows] = await conn.execute(
      "SELECT balance FROM users WHERE id = ?",
      [userId]
    );
    if (rows.length === 0) {
      conn.release();
      return res.status(404).json({ message: "User not found" });
    }
    if (rows[0].balance < amount) {
      conn.release();
      return res.status(400).json({ message: "Insufficient funds" });
    }

    await conn.execute("UPDATE users SET balance = balance - ? WHERE id = ?", [
      amount,
      userId,
    ]);
    await conn.execute(
      "INSERT INTO transactions (user_id, type, amount) VALUES (?, 'withdraw', ?)",
      [userId, amount]
    );

    await conn.commit();
    conn.release();

    res.json({ message: "Withdrawal successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error withdrawing" });
  }
});

// ✅ Transfer money between users
router.post("/transfer", verifyToken, async (req, res) => {
  const { fromUserId, toUserId, amount } = req.body;
  if (!fromUserId || !toUserId || !amount)
    return res.status(400).json({ message: "Missing parameters" });

  try {
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    // Check balance
    const [rows] = await conn.execute(
      "SELECT balance FROM users WHERE id = ?",
      [fromUserId]
    );
    if (rows.length === 0 || rows[0].balance < amount) {
      conn.release();
      return res.status(400).json({ message: "Insufficient funds" });
    }

    // Deduct sender
    await conn.execute("UPDATE users SET balance = balance - ? WHERE id = ?", [
      amount,
      fromUserId,
    ]);

    // Add receiver
    await conn.execute("UPDATE users SET balance = balance + ? WHERE id = ?", [
      amount,
      toUserId,
    ]);

    // Log transaction
    await conn.execute(
      "INSERT INTO transactions (user_id, type, amount, to_user_id) VALUES (?, 'transfer', ?, ?)",
      [fromUserId, amount, toUserId]
    );

    await conn.commit();
    conn.release();

    res.json({ message: "Transfer successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error transferring" });
  }
});

// ✅ Check user balance
router.get("/balance/:userId", verifyToken, async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.execute(
      "SELECT balance FROM users WHERE id = ?",
      [userId]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "User not found" });
    res.json({ userId, balance: rows[0].balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching balance" });
  }
});

// ✅ Get transaction history
router.get("/transactions/:userId", verifyToken, async (req, res) => {
  const { userId } = req.params;
  try {
    let rows;
    if (userId == 0) {
      [rows] = await pool.execute(`
        SELECT t.id, t.user_id, u1.name as from_user,
               t.type, t.amount,
               t.to_user_id, u2.name as to_user,
               t.created_at
        FROM transactions t
        LEFT JOIN users u1 ON t.user_id = u1.id
        LEFT JOIN users u2 ON t.to_user_id = u2.id
        ORDER BY t.created_at DESC
      `);
    } else {
      [rows] = await pool.execute(
        `
        SELECT t.id, t.user_id, u1.name as from_user,
               t.type, t.amount,
               t.to_user_id, u2.name as to_user,
               t.created_at
        FROM transactions t
        LEFT JOIN users u1 ON t.user_id = u1.id
        LEFT JOIN users u2 ON t.to_user_id = u2.id
        WHERE t.user_id = ? OR t.to_user_id = ?
        ORDER BY t.created_at DESC
      `,
        [userId, userId]
      );
    }
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching transactions" });
  }
});

router.get("/users", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, email FROM users ORDER BY email ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching users" });
  }
});

export default router;
