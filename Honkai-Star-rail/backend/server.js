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

// --------------------
// CREATE TABLES
// --------------------
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
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user'
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id INTEGER NOT NULL,
    user_id INTEGER,
    user_name TEXT,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(character_id) REFERENCES characters(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`).run();


function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

app.post("/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
   
    const existingUser = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

  
    const result = db.prepare(`
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, 'user')
    `).run(name, email, hashedPassword);

    res.json({ 
      success: true, 
      message: "User registered successfully",
      userId: result.lastInsertRowid 
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});


app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password" });
  }

  try {
   
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

 
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      SECRET_KEY,
      { expiresIn: "24h" }
    );

   
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});


app.get("/auth/me", authenticateToken, (req, res) => {
  const user = db.prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(req.user.id);
  
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});


app.get("/users", (req, res) => {
  const users = db.prepare("SELECT id, name, email, role FROM users").all();
  res.json(users);
});


app.get("/api/characters", (req, res) => {
  const characters = db.prepare("SELECT * FROM characters").all();
  res.json(characters);
});

app.get("/api/characters/:id", (req, res) => {
  const id = Number(req.params.id);
  const character = db.prepare("SELECT * FROM characters WHERE id = ?").get(id);
  if (!character) return res.status(404).json({ error: "Character not found" });
  res.json(character);
});

app.post("/api/characters", upload.single("image"), (req, res) => {
  const { name, type, description } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

  const result = db.prepare(`
    INSERT INTO characters (name, type, description, image)
    VALUES (?, ?, ?, ?)
  `).run(name, type, description, imagePath);

  res.json({ success: true, id: result.lastInsertRowid, image: imagePath });
});

app.put("/api/characters/:id", upload.single("image"), (req, res) => {
  const id = Number(req.params.id);
  const { name, type, description } = req.body;
  
  const character = db.prepare("SELECT * FROM characters WHERE id = ?").get(id);
  if (!character) return res.status(404).json({ error: "Character not found" });

  const imagePath = req.file ? `/uploads/${req.file.filename}` : character.image;

  db.prepare(`
    UPDATE characters 
    SET name = ?, type = ?, description = ?, image = ?
    WHERE id = ?
  `).run(name, type, description, imagePath, id);

  res.json({ success: true, image: imagePath });
});

app.delete("/api/characters/:id", (req, res) => {
  const id = Number(req.params.id);
  
  const character = db.prepare("SELECT * FROM characters WHERE id = ?").get(id);
  if (!character) return res.status(404).json({ error: "Character not found" });

  db.prepare("DELETE FROM characters WHERE id = ?").run(id);
  res.json({ success: true });
});


app.get("/api/comments/:characterId", (req, res) => {
  const characterId = Number(req.params.characterId);
  const comments = db.prepare(`
    SELECT id, user_id, user_name AS userName, content AS text, created_at
    FROM comments
    WHERE character_id = ?
    ORDER BY created_at DESC
  `).all(characterId);
  res.json(comments);
});

app.post("/api/comments", (req, res) => {
  const { characterId, text, userName, userId } = req.body;
  if (!characterId || !text) return res.status(400).json({ error: "Missing characterId or text" });

  const result = db.prepare(`
    INSERT INTO comments (character_id, user_id, user_name, content)
    VALUES (?, ?, ?, ?)
  `).run(characterId, userId || null, userName || "Guest", text);

  const comment = db.prepare(`
    SELECT id, user_id, user_name AS userName, content AS text, created_at
    FROM comments
    WHERE id = ?
  `).get(result.lastInsertRowid);

  res.json(comment);
});


app.listen(3000, () => console.log("Server running on http://localhost:3000"));