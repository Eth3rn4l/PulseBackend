import { db } from '../db.js';

// Lista de amigos aceptados del usuario
export const getFriends = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT f.id, u.id AS friend_id, u.username, u.email, u.avatar_url, f.status, f.created_at
       FROM friends f
       JOIN users u ON u.id = f.friend_id
       WHERE f.user_id = ? AND f.status = 'accepted'`,
      [req.user.id]
    );
    res.json(rows);
  } catch (e) {
    console.error('getFriends error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Solicitudes pendientes que YO he enviado
export const getPendingRequests = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT f.id, u.username, u.email, f.status, f.created_at
       FROM friends f
       JOIN users u ON u.id = f.friend_id
       WHERE f.user_id = ? AND f.status = 'pending'`,
      [req.user.id]
    );
    res.json(rows);
  } catch (e) {
    console.error('getPendingRequests error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Enviar solicitud de amistad por email del otro usuario
export const sendRequest = async (req, res) => {
  const { friend_email } = req.body;
  if (!friend_email) return res.status(400).json({ error: 'friend_email required' });

  try {
    const [target] = await db.query('SELECT id FROM users WHERE email = ?', [
      friend_email
    ]);
    if (target.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const friendId = target[0].id;

    if (friendId === req.user.id) {
      return res.status(400).json({ error: 'Cannot add yourself' });
    }

    const [exists] = await db.query(
      'SELECT id FROM friends WHERE user_id = ? AND friend_id = ?',
      [req.user.id, friendId]
    );
    if (exists.length > 0) {
      return res.status(400).json({ error: 'Request already exists or already friends' });
    }

    await db.query(
      'INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, ?)',
      [req.user.id, friendId, 'pending']
    );

    res.json({ message: 'Friend request sent' });
  } catch (e) {
    console.error('sendRequest error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Aceptar una solicitud (por id del registro en tabla friends)
export const acceptRequest = async (req, res) => {
  const { request_id } = req.body;
  if (!request_id) return res.status(400).json({ error: 'request_id required' });

  try {
    await db.query('UPDATE friends SET status = "accepted" WHERE id = ?', [
      request_id
    ]);
    res.json({ message: 'Friend request accepted' });
  } catch (e) {
    console.error('acceptRequest error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Eliminar amigo o solicitud
export const removeFriend = async (req, res) => {
  const id = req.params.id;
  try {
    await db.query('DELETE FROM friends WHERE id = ? AND user_id = ?', [
      id,
      req.user.id
    ]);
    res.json({ message: 'Friend removed' });
  } catch (e) {
    console.error('removeFriend error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
};
