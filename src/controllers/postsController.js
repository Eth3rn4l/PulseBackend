import { db } from '../db.js';

// Feed general (últimos 50 posts)
export const getFeed = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.id, p.text, p.link, p.latitude, p.longitude,
              p.location_name, p.image_url, p.created_at,
              u.id AS user_id, u.username, u.avatar_url
       FROM posts p
       JOIN users u ON u.id = p.user_id
       ORDER BY p.created_at DESC
       LIMIT 50`
    );
    res.json(rows);
  } catch (e) {
    console.error('getFeed error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Posts de un usuario específico
export const getUserPosts = async (req, res) => {
  const userId = req.params.id;
  try {
    const [rows] = await db.query(
      `SELECT p.id, p.text, p.link, p.latitude, p.longitude,
              p.location_name, p.image_url, p.created_at
       FROM posts p
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (e) {
    console.error('getUserPosts error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Crear post
export const createPost = async (req, res) => {
  const { text, link, latitude, longitude, location_name, image_url } = req.body;
  if (!text && !image_url && !link) {
    return res.status(400).json({ error: 'At least text, link or image_url is required' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO posts (user_id, text, link, latitude, longitude, location_name, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        text || null,
        link || null,
        latitude || null,
        longitude || null,
        location_name || null,
        image_url || null
      ]
    );
    res.json({ message: 'Post created', id: result.insertId });
  } catch (e) {
    console.error('createPost error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Eliminar post propio
export const deletePost = async (req, res) => {
  const postId = req.params.id;
  try {
    await db.query(
      'DELETE FROM posts WHERE id = ? AND user_id = ?',
      [postId, req.user.id]
    );
    res.json({ message: 'Post deleted' });
  } catch (e) {
    console.error('deletePost error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
};
