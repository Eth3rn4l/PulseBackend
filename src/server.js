const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/appplaypulse";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("[mongo] conectado"))
  .catch((err) => {
    console.error("[mongo] error de conexión", err);
    process.exit(1);
  });

const userSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    edad: { type: Number, required: true, min: 12 },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    highScore: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now }
  },
  { collection: "users" }
);

userSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

const postSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true },
    content: { type: String, required: true },
    location: { type: String },
    link: { type: String },
    imageUri: { type: String },
    createdAt: { type: Date, default: Date.now }
  },
  { collection: "posts" }
);

const friendSchema = new mongoose.Schema(
  {
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    friendUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    friendName: { type: String, required: true },
    avatarResName: { type: String, default: "elena" },
    isOnline: { type: Boolean, default: false },
    friendSince: { type: Date, default: Date.now }
  },
  { collection: "friends" }
);

const gameSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    gameTitle: { type: String, required: true },
    imageResName: { type: String, default: "apex" },
    playedAt: { type: Date, default: Date.now }
  },
  { collection: "games" }
);

const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);
const Friend = mongoose.model("Friend", friendSchema);
const Game = mongoose.model("Game", gameSchema);

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "appplaypulse-backend" });
});

app.get("/api/users", async (_req, res) => {
  try {
    const users = await User.find({}, { password: 0 }).limit(200).lean();
    const mapped = users.map((u) => ({ ...u, id: u._id }));
    res.json({ items: mapped });
  } catch (err) {
    console.error("[users:list]", err);
    res.status(500).json({ error: "No se pudo listar usuarios" });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { nombre, apellido, edad, email, phone, username, password } = req.body;
    if (!nombre || !apellido || !edad || !email || !phone || !username || !password) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    const exists =
      (await User.findOne({ username })) ||
      (await User.findOne({ email })) ||
      (await User.findOne({ phone }));
    if (exists) {
      return res.status(409).json({ error: "Usuario ya existe (username/email/phone)" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      nombre,
      apellido,
      edad,
      email,
      phone,
      username,
      password: hash
    });

    res.status(201).json({ user: user.toSafeJSON() });
  } catch (err) {
    console.error("[register]", err);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { field, password } = req.body;
    if (!field || !password) {
      return res.status(400).json({ error: "Faltan credenciales" });
    }

    const user =
      (await User.findOne({ username: field })) ||
      (await User.findOne({ email: field })) ||
      (await User.findOne({ phone: field }));
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: "Contrasena incorrecta" });
    }

    res.json({ user: user.toSafeJSON() });
  } catch (err) {
    console.error("[login]", err);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

app.get("/api/posts", async (_req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).lean();
    const formatted = posts.map((p) => ({
      id: p._id,
      userId: p.userId,
      username: p.username,
      content: p.content,
      location: p.location,
      link: p.link,
      imageUri: p.imageUri,
      createdAt: p.createdAt
    }));
    res.json({ items: formatted });
  } catch (err) {
    console.error("[posts:list]", err);
    res.status(500).json({ error: "No se pudo cargar el feed" });
  }
});

app.post("/api/posts", async (req, res) => {
  try {
    const { userId, username, content, location, link, imageUri } = req.body;
    if (!userId || !username || !content) {
      return res.status(400).json({ error: "userId, username y content son requeridos" });
    }

    const post = await Post.create({
      userId,
      username,
      content,
      location,
      link,
      imageUri
    });

    res.status(201).json({
      item: {
        id: post._id,
        userId: post.userId,
        username: post.username,
        content: post.content,
        location: post.location,
        link: post.link,
        imageUri: post.imageUri,
        createdAt: post.createdAt
      }
    });
  } catch (err) {
    console.error("[posts:create]", err);
    res.status(500).json({ error: "No se pudo crear el post" });
  }
});

app.get("/api/friends", async (req, res) => {
  try {
    const { ownerUserId } = req.query;
    if (!ownerUserId) {
      return res.status(400).json({ error: "ownerUserId requerido" });
    }
    const friends = await Friend.find({ ownerUserId }).lean();
    const mapped = friends.map((f) => ({
      id: f._id,
      ownerUserId: f.ownerUserId,
      friendUserId: f.friendUserId,
      friendName: f.friendName,
      avatarResName: f.avatarResName,
      isOnline: f.isOnline,
      friendSince: f.friendSince
    }));
    res.json({ items: mapped });
  } catch (err) {
    console.error("[friends:list]", err);
    res.status(500).json({ error: "No se pudo listar amigos" });
  }
});

app.post("/api/friends", async (req, res) => {
  try {
    const { ownerUserId, friendUserId, friendName, avatarResName, isOnline } = req.body;
    if (!ownerUserId || !friendName) {
      return res.status(400).json({ error: "ownerUserId y friendName son requeridos" });
    }

    const exists = await Friend.findOne({ ownerUserId, friendUserId, friendName });
    if (exists) {
      return res.status(409).json({ error: "Amigo ya existe" });
    }

    const doc = await Friend.create({
      ownerUserId,
      friendUserId,
      friendName,
      avatarResName: avatarResName || "elena",
      isOnline: Boolean(isOnline)
    });

    res.status(201).json({
      item: {
        id: doc._id,
        ownerUserId: doc.ownerUserId,
        friendUserId: doc.friendUserId,
        friendName: doc.friendName,
        avatarResName: doc.avatarResName,
        isOnline: doc.isOnline,
        friendSince: doc.friendSince
      }
    });
  } catch (err) {
    console.error("[friends:create]", err);
    res.status(500).json({ error: "No se pudo crear amigo" });
  }
});

app.get("/api/games", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "userId requerido" });
    }
    const games = await Game.find({ userId }).sort({ playedAt: -1 }).lean();
    const mapped = games.map((g) => ({
      id: g._id,
      userId: g.userId,
      gameTitle: g.gameTitle,
      imageResName: g.imageResName,
      playedAt: g.playedAt
    }));
    res.json({ items: mapped });
  } catch (err) {
    console.error("[games:list]", err);
    res.status(500).json({ error: "No se pudo listar juegos" });
  }
});

app.post("/api/games", async (req, res) => {
  try {
    const { userId, gameTitle, imageResName } = req.body;
    if (!userId || !gameTitle) {
      return res.status(400).json({ error: "userId y gameTitle son requeridos" });
    }

    const doc = await Game.create({
      userId,
      gameTitle,
      imageResName: imageResName || "apex"
    });

    res.status(201).json({
      item: {
        id: doc._id,
        userId: doc.userId,
        gameTitle: doc.gameTitle,
        imageResName: doc.imageResName,
        playedAt: doc.playedAt
      }
    });
  } catch (err) {
    console.error("[games:create]", err);
    res.status(500).json({ error: "No se pudo crear juego" });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`API escuchando en http://${HOST}:${PORT}`);
  console.log(`Acceso desde emulador Android: http://10.0.2.2:${PORT}`);
});
