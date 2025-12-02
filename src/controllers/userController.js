import { db } from '../db.js';

export const me = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, email, username, avatar_url, phone, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (e) {
    console.error('me error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateMe = async (req, res) => {
  const { username, avatar_url, phone } = req.body;
  try {
    await db.query(
      'UPDATE users SET username = ?, avatar_url = ?, phone = ? WHERE id = ?',
      [username || null, avatar_url || null, phone || null, req.user.id]
    );
    res.json({ message: 'Profile updated' });
  } catch (e) {
    console.error('updateMe error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserById = async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await db.query(
      'SELECT id, username, avatar_url, created_at FROM users WHERE id = ?',
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (e) {
    console.error('getUserById error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
};
