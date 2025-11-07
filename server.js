import express from "express";
import fs from "fs";
import bodyParser from "body-parser";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8070;
const LINKS_FILE = "./data/links.json";
const CREDENTIALS_FILE = "./data/credentials.json";

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(
  session({
    secret: crypto.randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false,
    cookie: { 
      maxAge: null, // Session lasts until browser closes
      httpOnly: true
    }
  })
);

// Funzione per hash password
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Inizializza i file se non esistono
if (!fs.existsSync("./data")) {
  fs.mkdirSync("./data", { recursive: true });
}

if (!fs.existsSync(LINKS_FILE)) {
  fs.writeFileSync(LINKS_FILE, JSON.stringify([], null, 2));
}

// Middleware per autenticazione
function requireAuth(req, res, next) {
  if (req.session.loggedIn) return next();
  res.status(401).json({ error: "Non autorizzato" });
}

// Setup iniziale - primo avvio
app.post("/setup", (req, res) => {
  // Controlla se già configurato
  if (fs.existsSync(CREDENTIALS_FILE)) {
    return res.status(400).json({ error: "Setup già completato" });
  }

  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: "Username e password richiesti" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password troppo corta (minimo 6 caratteri)" });
  }

  const credentials = {
    username: username,
    password: hashPassword(password)
  };

  fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(credentials, null, 2));
  console.log('Setup completed for user:', username);
  req.session.loggedIn = true;
  res.json({ success: true });
});

// Verifica se serve il setup
app.get("/check-setup", (req, res) => {
  const needsSetup = !fs.existsSync(CREDENTIALS_FILE);
  res.json({ needsSetup });
});

// Login
app.post("/login", (req, res) => {
  // Se non esiste il file credenziali, richiedi setup
  if (!fs.existsSync(CREDENTIALS_FILE)) {
    return res.status(403).json({ needsSetup: true });
  }

  const { username, password } = req.body;
  
  try {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));

    console.log('Login attempt:', { username, storedUsername: credentials.username });

    if (username === credentials.username && hashPassword(password) === credentials.password) {
      req.session.loggedIn = true;
      return res.json({ success: true });
    }
    res.json({ success: false });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: "Server error" });
  }
});

// Logout
app.post("/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

// API Links
app.get("/api/links", requireAuth, (req, res) => {
  const data = JSON.parse(fs.readFileSync(LINKS_FILE));
  res.json(data);
});

app.post("/api/links", requireAuth, (req, res) => {
  const newLink = req.body;
  const data = JSON.parse(fs.readFileSync(LINKS_FILE));
  data.push(newLink);
  fs.writeFileSync(LINKS_FILE, JSON.stringify(data, null, 2));
  res.json({ success: true });
});

// Import links (replace all) - DEVE essere prima di DELETE e PUT
app.post("/api/links/import", requireAuth, (req, res) => {
  const importedLinks = req.body;
  
  if (!Array.isArray(importedLinks)) {
    return res.status(400).json({ error: "Invalid data format" });
  }

  fs.writeFileSync(LINKS_FILE, JSON.stringify(importedLinks, null, 2));
  res.json({ success: true, count: importedLinks.length });
});

app.delete("/api/links/:sito", requireAuth, (req, res) => {
  const sito = decodeURIComponent(req.params.sito);
  const data = JSON.parse(fs.readFileSync(LINKS_FILE));
  const updated = data.filter(l => l.SITO !== sito);
  fs.writeFileSync(LINKS_FILE, JSON.stringify(updated, null, 2));
  res.json({ success: true });
});

app.put("/api/links/:sito", requireAuth, (req, res) => {
  const sito = decodeURIComponent(req.params.sito);
  const data = JSON.parse(fs.readFileSync(LINKS_FILE));
  const index = data.findIndex(l => l.SITO === sito);
  if (index === -1) return res.status(404).json({ error: "Link non trovato" });
  data[index] = req.body;
  fs.writeFileSync(LINKS_FILE, JSON.stringify(data, null, 2));
  res.json({ success: true });
});

// Import links (replace all)
app.post("/api/links/import", requireAuth, (req, res) => {
  const importedLinks = req.body;
  
  if (!Array.isArray(importedLinks)) {
    return res.status(400).json({ error: "Invalid data format" });
  }

  fs.writeFileSync(LINKS_FILE, JSON.stringify(importedLinks, null, 2));
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`✅ Matrix Home attivo su http://localhost:${PORT}`);
  if (!fs.existsSync(CREDENTIALS_FILE)) {
    console.log(`⚠️  PRIMO AVVIO: Configura username e password visitando http://localhost:${PORT}`);
  }
});