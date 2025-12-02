import { db } from '../db.js';

export const me = async (req, res) => {
  try {
    const [u] = await db.query(
      "SELECT id, email, username, avatar_url, phone, created_at FROM users WHERE id = ?",
      [req.user.id]
    );
    res.json(u[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const updateMe = async (req, res) => {
  const { username, avatar_url, phone } = req.body;
  try {
    await db.query(
      "UPDATE users SET username = ?, avatar_url = ?, phone = ? WHERE id = ?",
      [username, avatar_url, phone, req.user.id]
    );
    res.json({ message: "Updated" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
