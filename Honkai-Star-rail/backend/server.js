const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET_KEY = "mysecret123";
const db = new Database("database.db");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

if (!fs.existsSync("./uploads")) fs.mkdirSync("./uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

db.prepare(`
  CREATE TABLE IF NOT EXISTS characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    image TEXT NOT NULL
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`).run();

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

app.get("/users", (req, res) => {
  try {
    const users = db.prepare("SELECT id, name, email FROM users").all();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "All fields are required" });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)").run(name, email, hashedPassword);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) return res.status(400).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/characters", (req, res) => {
  try {
    const characters = db.prepare("SELECT * FROM characters").all();
    res.json(characters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/characters/:id", (req, res) => {
  const id = Number(req.params.id);
  try {
    const character = db.prepare("SELECT * FROM characters WHERE id = ?").get(id);
    if (!character) return res.status(404).json({ error: "Character not found" });
    res.json(character);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/characters", upload.single("image"), (req, res) => {
  try {
    const { name, description, type } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

    const result = db.prepare(`
      INSERT INTO characters (name, type, description, image)
      VALUES (?, ?, ?, ?)
    `).run(name, type, description, imagePath);

    res.json({ success: true, id: result.lastInsertRowid, image: imagePath });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/characters/:id", upload.single("image"), (req, res) => {
  const id = req.params.id;
  const { name, type, description } = req.body;

  try {
    const character = db.prepare("SELECT * FROM characters WHERE id = ?").get(id);
    if (!character) return res.status(404).json({ error: "Character not found" });

    let imagePath = character.image;
    if (req.file) {
      const oldImagePath = path.join(__dirname, character.image);
      if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      imagePath = `/uploads/${req.file.filename}`;
    }

    db.prepare(`
      UPDATE characters
      SET name = ?, type = ?, description = ?, image = ?
      WHERE id = ?
    `).run(name, type, description, imagePath, id);

    res.json({ success: true, id, image: imagePath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/characters/:id", (req, res) => {
  try {
    const id = req.params.id;
    const character = db.prepare("SELECT image FROM characters WHERE id = ?").get(id);
    if (!character) return res.status(404).json({ error: "Character not found" });

    if (character.image) {
      const imagePath = path.join(__dirname, character.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    db.prepare("DELETE FROM characters WHERE id = ?").run(id);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
