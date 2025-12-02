import { db } from '../db.js';

// GET /api/games  -> catálogo (simple, todos los juegos existentes)
export const getCatalog = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, platform, genre FROM games"
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// GET /api/games/my -> juegos del usuario con stats
export const getMyGames = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT ugs.id, g.name, g.platform, g.genre,
              ugs.hours_played, ugs.rank, ugs.created_at
       FROM user_game_stats ugs
       JOIN games g ON g.id = ugs.game_id
       WHERE ugs.user_id = ?`,
      [req.user.id]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /api/games/my -> agregar juego al usuario
export const addMyGame = async (req, res) => {
  const { name, platform, genre, hours_played, rank } = req.body;
  try {
    // Buscar si ya existe el juego en catálogo
    let [grows] = await db.query(
      "SELECT id FROM games WHERE name = ? AND platform = ?",
      [name, platform]
    );
    let gameId;
    if (grows.length === 0) {
      const [result] = await db.query(
        "INSERT INTO games (name, platform, genre) VALUES (?, ?, ?)",
        [name, platform, genre]
      );
      gameId = result.insertId;
    } else {
      gameId = grows[0].id;
    }

    await db.query(
      "INSERT INTO user_game_stats (user_id, game_id, hours_played, rank) VALUES (?, ?, ?, ?)",
      [req.user.id, gameId, hours_played || 0, rank || null]
    );

    res.json({ message: "Game added to user" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// PUT /api/games/my/:id -> actualizar stats
export const updateMyGame = async (req, res) => {
  const { hours_played, rank } = req.body;
  const statId = req.params.id;
  try {
    await db.query(
      "UPDATE user_game_stats SET hours_played = ?, rank = ? WHERE id = ? AND user_id = ?",
      [hours_played, rank, statId, req.user.id]
    );
    res.json({ message: "Game stats updated" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// DELETE /api/games/my/:id -> eliminar juego del usuario
export const deleteMyGame = async (req, res) => {
  const statId = req.params.id;
  try {
    await db.query(
      "DELETE FROM user_game_stats WHERE id = ? AND user_id = ?",
      [statId, req.user.id]
    );
    res.json({ message: "Game removed from user" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
