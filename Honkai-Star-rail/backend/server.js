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
db.prepare(`CREATE TABLE IF NOT EXISTS characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    image TEXT NOT NULL
  )
`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user'
  )
`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS comments (
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

// NEW TABLE FOR WARP BANNERS
db.prepare(`CREATE TABLE IF NOT EXISTS warp_banners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version TEXT NOT NULL,
    status TEXT NOT NULL,
    phase TEXT NOT NULL,
    dates TEXT NOT NULL,
    banner_details TEXT NOT NULL,
    is_active INTEGER DEFAULT 1
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

// NEW ADMIN CHECK MIDDLEWARE
function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: "Access denied. Admin privileges required." });
  }
}

// --------------------
// AUTH ROUTES
// --------------------
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
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: "Invalid credentials" });

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
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

app.get("/users", (req, res) => {
  const users = db.prepare("SELECT id, name, email, role FROM users").all();
  res.json(users);
});

// --------------------
// CHARACTERS ROUTES
// --------------------
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

// --------------------
// COMMENTS ROUTES
// --------------------
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

// --------------------
// WARP BANNERS ROUTES
// --------------------
const uploadBannerImages = upload.fields(
    Array.from({ length: 10 }, (_, i) => ({ 
        name: `charImage_${i}`, 
        maxCount: 1 
    }))
);

app.post("/api/warp-banners", uploadBannerImages, (req, res) => {
    const { version, status, phase, dates, bannerDetailsJson } = req.body; 
    
    if (!version || !status || !phase || !dates || !bannerDetailsJson) {
        return res.status(400).json({ error: "Missing required banner fields or details" });
    }

    try {
        let banner_details = JSON.parse(bannerDetailsJson);
        
        const uploadedFiles = req.files || {};

        const finalDetails = banner_details.map((detail, index) => {
            const fieldName = `charImage_${index}`;
            const file = uploadedFiles[fieldName] ? uploadedFiles[fieldName][0] : null;

            if (file) {
                detail.image_path = `/uploads/${file.filename}`;
            } else {
                detail.image_path = detail.image_path || ""; 
            }
            return detail;
        });

        const finalDetailsJson = JSON.stringify(finalDetails);

        const result = db.prepare(`
            INSERT INTO warp_banners (version, status, phase, dates, banner_details)
            VALUES (?, ?, ?, ?, ?)
        `).run(version, status, phase, dates, finalDetailsJson);

        res.json({ 
            success: true, 
            id: result.lastInsertRowid, 
            message: "Warp banner schedule added successfully" 
        });
    } catch (error) {
        console.error("Add banner error:", error);
        res.status(500).json({ error: "Failed to add banner schedule: " + error.message });
    }
});

app.get("/api/warp-banners", (req, res) => {
    try {
        const banners = db.prepare(`
            SELECT id, version, status, phase, dates, banner_details FROM warp_banners
            WHERE is_active = 1
            ORDER BY id DESC 
        `).all();

        const parsedBanners = banners.map(banner => {
            try {
                return {
                    ...banner,
                    banner_details: JSON.parse(banner.banner_details)
                };
            } catch (e) {
                return banner; 
            }
        });

        res.json(parsedBanners);
    } catch (error) {
        console.error("Get banners error:", error);
        res.status(500).json({ error: "Failed to retrieve banner schedule" });
    }
});

// *** MODIFIED DELETE ROUTE: Removed authenticateToken and isAdmin ***
app.delete("/api/warp-banners/:id", (req, res) => {
    const id = Number(req.params.id);
    try {
        const result = db.prepare("DELETE FROM warp_banners WHERE id = ?").run(id);
        if (result.changes === 0) {
            return res.status(404).json({ error: "Banner not found" });
        }
        res.json({ success: true, message: "Banner deleted successfully" });
    } catch (error) {
        console.error("Delete banner error:", error);
        res.status(500).json({ error: "Failed to delete banner" });
    }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
