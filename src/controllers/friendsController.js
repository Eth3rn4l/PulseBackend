import { db } from '../db.js';

// GET /api/friends
export const getFriends = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT f.id, u.username, u.email, f.status, f.created_at
       FROM friends f
       JOIN users u ON u.id = f.friend_id
       WHERE f.user_id = ? AND f.status = 'accepted'`,
      [req.user.id]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /api/friends/request
export const sendRequest = async (req, res) => {
  const { friend_email } = req.body;
  try {
    const [target] = await db.query("SELECT id FROM users WHERE email = ?", [
      friend_email
    ]);
    if (target.length === 0)
      return res.status(404).json({ error: "User not found" });
    const friendId = target[0].id;

    if (friendId === req.user.id)
      return res.status(400).json({ error: "Cannot add yourself" });

    const [exists] = await db.query(
      "SELECT id FROM friends WHERE user_id = ? AND friend_id = ?",
      [req.user.id, friendId]
    );
    if (exists.length > 0)
      return res
        .status(400)
        .json({ error: "Already requested/are friends" });

    await db.query(
      "INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, ?)",
      [req.user.id, friendId, 'pending']
    );
    res.json({ message: "Request sent" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /api/friends/accept
export const acceptRequest = async (req, res) => {
  const { request_id } = req.body;
  try {
    await db.query("UPDATE friends SET status = 'accepted' WHERE id = ?", [
      request_id
    ]);
    res.json({ message: "Accepted" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// DELETE /api/friends/:id
export const removeFriend = async (req, res) => {
  try {
    await db.query(
      "DELETE FROM friends WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    res.json({ message: "Removed" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
