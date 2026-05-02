import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8070; // Prende la porta dall'ambiente Docker o usa 8070 [cite: 2]

// Percorsi per i dati persistenti (mappati nel volume Docker) [cite: 2]
const DATA_DIR = path.join(__dirname, "data");
const LINKS_FILE = path.join(DATA_DIR, "links.json");
const AUTH_FLAG_FILE = path.join(DATA_DIR, ".auth_enabled");

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "10mb" })); // Supporto per import JSON pesanti [cite: 2]

// Assicura che la cartella data esista all'avvio [cite: 2]
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// --- HELPER FUNCTIONS ---
const getLinks = () => {
  if (!fs.existsSync(LINKS_FILE)) return [];
  try {
    const data = fs.readFileSync(LINKS_FILE, "utf8");
    return JSON.parse(data);
  } catch (e) {
    console.error("Errore lettura links.json:", e);
    return [];
  }
};

const isAuthEnabled = () => fs.existsSync(AUTH_FLAG_FILE);

// --- API ROUTES ---

// 1. Verifica stato setup (Protezione ON/OFF per il frontend) [cite: 2]
app.get("/api/check-setup", (req, res) => {
  res.json({ 
    authEnabled: isAuthEnabled(),
    version: "1.3.10"
  });
});

// 2. Ottieni la lista dei link [cite: 2]
app.get("/api/links", (req, res) => {
  res.json(getLinks());
});

// 3. Salva la lista dei link (sovrascrittura massiva) [cite: 2]
app.post("/api/links", (req, res) => {
  try {
    const links = req.body;
    if (!Array.isArray(links)) {
      return res.status(400).json({ error: "Formato dati non valido (richiesto Array)" });
    }
    fs.writeFileSync(LINKS_FILE, JSON.stringify(links, null, 2));
    res.json({ success: true, count: links.length });
  } catch (e) {
    res.status(500).json({ error: "Errore durante il salvataggio: " + e.message });
  }
});

// 4. Toggle della protezione (Crea/Elimina file flag) [cite: 2]
app.post("/api/config/toggle-auth", (req, res) => {
  try {
    const { enabled } = req.body;
    if (enabled) {
      fs.writeFileSync(AUTH_FLAG_FILE, "true");
    } else {
      if (fs.existsSync(AUTH_FLAG_FILE)) fs.unlinkSync(AUTH_FLAG_FILE);
    }
    res.json({ success: true, authEnabled: enabled });
  } catch (e) {
    res.status(500).json({ error: "Errore toggle protezione: " + e.message });
  }
});

// 5. Healthcheck per Docker (essenziale per il tuo docker-compose) 
app.get("/api/health", (req, res) => {
  res.status(200).send("OK");
});

// Avvio Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`
  -----------------------------------------
  🚀 MATRIX HOME DASHBOARD v1.3.10
  -----------------------------------------
  🌍 Porta:      ${PORT}
  📂 Data Dir:   ${DATA_DIR}
  🛡️ Protezione: ${isAuthEnabled() ? 'ATTIVA' : 'DISATTIVATA'}
  -----------------------------------------
  `);
});